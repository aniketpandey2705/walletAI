import os
import json
from services.groq_client import groq_client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.category import Category
import logging

logger = logging.getLogger(__name__)


async def _get_categories_for_prompt(db: AsyncSession) -> str:
    """Fetches all categories from DB and formats them for the prompt."""
    stmt = select(Category)
    result = await db.execute(stmt)
    categories = result.scalars().all()
    cat_list = [{"id": c.id, "name": c.name} for c in categories]
    return json.dumps(cat_list, indent=2)


async def run_stage3_groq_analysis(db: AsyncSession, raw_text: str, bank_slug: str | None = None) -> tuple[list[dict], list[dict]]:
    """
    1. Reads prompts from disk.
    2. Extracts transactions programmatically if adapter supports it, else calls Groq.
    3. Calls Groq to categorize transactions (providing DB category IDs).
    4. Calls Groq to generate insights based on the categorized data.
    Returns: (categorized_transactions, insights)
    """
    # Load prompts
    base_dir = os.path.dirname(os.path.dirname(__file__))
    with open(os.path.join(base_dir, "prompts", "extraction.txt"), "r") as f:
        extraction_prompt = f.read()
    with open(os.path.join(base_dir, "prompts", "categorization.txt"), "r") as f:
        base_cat_prompt = f.read()
    with open(os.path.join(base_dir, "prompts", "insights.txt"), "r") as f:
        insights_prompt = f.read()

    # 1. Extraction — use bank adapter if available, else fallback to Groq
    extracted_tx = []
    if bank_slug:
        try:
            from adapters.registry import get_adapter_by_slug
            adapter = get_adapter_by_slug(bank_slug)
            if adapter and hasattr(adapter, "parse_transactions"):
                logger.info(f"Using programmatic parser for bank: {bank_slug}")
                extracted_tx = adapter.parse_transactions(raw_text)
                logger.info(f"Programmatic parser extracted {len(extracted_tx)} transactions.")
        except Exception as pe:
            logger.error(f"Programmatic parser failed for {bank_slug}, falling back to Groq. Error: {pe}", exc_info=True)

    if not extracted_tx:
        logger.info("Calling Groq for extraction from raw text...")
        extracted_tx = await groq_client.extract_from_text(raw_text, extraction_prompt)
        logger.info(f"Extracted {len(extracted_tx)} transactions total via Groq.")

    if not extracted_tx:
        logger.warning("No transactions extracted from text!")
        return [], []

    # 2. Categorization
    logger.info("Calling Groq for categorization...")
    categories_json = await _get_categories_for_prompt(db)
    full_cat_prompt = f"{base_cat_prompt}\n\nValid Categories:\n{categories_json}"
    categorized_tx = await groq_client.categorize_transactions(extracted_tx, full_cat_prompt)

    # 3. Insights — aggregate stats first
    income = sum(float(t.get("amount", 0)) for t in categorized_tx if t.get("type") == "CREDIT")
    expense = sum(float(t.get("amount", 0)) for t in categorized_tx if t.get("type") == "DEBIT")

    stats = {
        "total_income": round(income, 2),
        "total_expense": round(expense, 2),
        "net": round(income - expense, 2),
        "transaction_count": len(categorized_tx)
    }

    logger.info(f"Stats: {stats}")
    logger.info("Calling Groq for insights...")
    insights = await groq_client.generate_insights(stats, insights_prompt)

    return categorized_tx, insights
