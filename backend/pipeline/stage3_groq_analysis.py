import os
import json
from datetime import datetime, timezone
from services.groq_client import groq_client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.category import Category
from models.merchant import MerchantMapping
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
    3. Checks merchant cache.
    4. Calls Groq to categorize remaining transactions.
    5. Saves new Groq results to cache.
    6. Calls Groq to generate insights based on the categorized data.
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

    # 2. Check Merchant Cache
    logger.info("Checking Merchant Cache...")
    stmt = select(MerchantMapping)
    res = await db.execute(stmt)
    all_mappings = res.scalars().all()
    
    categorized_tx = []
    tx_for_llm = []

    for tx in extracted_tx:
        desc = tx.get("description", "").lower()
        matched = False
        for mapping in all_mappings:
            aliases = [a.lower() for a in (mapping.aliases or [])]
            if desc == mapping.raw_name.lower() or desc in aliases or desc == mapping.normalized_name.lower():
                # Match found
                mapping.times_seen = (mapping.times_seen or 0) + 1
                mapping.last_seen = datetime.now(timezone.utc)
                
                cat_tx = tx.copy()
                cat_tx["merchant"] = mapping.normalized_name
                cat_tx["category_id"] = mapping.category_id
                cat_tx["subcategory"] = mapping.subcategory
                cat_tx["confidence"] = mapping.confidence or 100
                cat_tx["reason"] = "Matched from Merchant Cache"
                cat_tx["merchant_type"] = mapping.merchant_type
                cat_tx["category_source"] = "memory"
                
                categorized_tx.append(cat_tx)
                matched = True
                break
        
        if not matched:
            tx_for_llm.append(tx)

    logger.info(f"Cache hit: {len(categorized_tx)}, Sending to Groq: {len(tx_for_llm)}")

    # 3. Categorization for unmatched
    if tx_for_llm:
        logger.info("Calling Groq for categorization...")
        categories_json = await _get_categories_for_prompt(db)
        full_cat_prompt = f"{base_cat_prompt}\n\nValid Categories:\n{categories_json}"
        llm_categorized_tx = await groq_client.categorize_transactions(tx_for_llm, full_cat_prompt)
        
        # Save newly discovered merchants to Cache
        for tx in llm_categorized_tx:
            merchant = tx.get("merchant", "Unknown")
            desc = tx.get("description", "")
            
            # Check if merchant name already exists in mappings (as normalized_name)
            existing_mapping = next((m for m in all_mappings if m.normalized_name.lower() == merchant.lower()), None)
            if existing_mapping:
                if existing_mapping.aliases is None:
                    existing_mapping.aliases = []
                if desc not in existing_mapping.aliases:
                    existing_mapping.aliases.append(desc)
                    # For SQLAlchemy array update in-place, sometimes we need to flag it as modified.
                    # Or just re-assign.
                    existing_mapping.aliases = list(existing_mapping.aliases)
                existing_mapping.times_seen = (existing_mapping.times_seen or 0) + 1
                existing_mapping.last_seen = datetime.now(timezone.utc)
            elif merchant != "Unknown":
                new_mapping = MerchantMapping(
                    raw_name=desc,
                    normalized_name=merchant,
                    category_id=tx.get("category_id"),
                    subcategory=tx.get("subcategory"),
                    merchant_type=tx.get("merchant_type"),
                    confidence=tx.get("confidence", 50),
                    aliases=[desc],
                    times_seen=1,
                    last_seen=datetime.now(timezone.utc),
                    source="ai"
                )
                db.add(new_mapping)
                all_mappings.append(new_mapping)
            
            
            # Default missing fields from LLM response
            tx["category_source"] = "ai"
            tx["reason"] = tx.get("reason", "Categorized by AI")
            categorized_tx.append(tx)

    # 4. Insights — aggregate stats first
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
