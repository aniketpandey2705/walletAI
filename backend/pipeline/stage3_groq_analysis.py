import os
import json
from services.groq_client import groq_client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.category import Category

async def _get_categories_for_prompt(db: AsyncSession) -> str:
    """Fetches all categories from DB and formats them for the prompt."""
    stmt = select(Category)
    result = await db.execute(stmt)
    categories = result.scalars().all()
    
    cat_list = [{"id": c.id, "name": c.name} for c in categories]
    return json.dumps(cat_list, indent=2)

async def run_stage3_groq_analysis(db: AsyncSession, raw_tx_rows: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    1. Reads prompts from disk.
    2. Calls Groq to extract transactions.
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
        
    # 1. Extraction
    print("Calling Groq for extraction...")
    extracted_tx = await groq_client.extract_transactions(raw_tx_rows, extraction_prompt)
    if not extracted_tx:
        return [], []
        
    # 2. Categorization
    print("Calling Groq for categorization...")
    categories_json = await _get_categories_for_prompt(db)
    full_cat_prompt = f"{base_cat_prompt}\n\nValid Categories:\n{categories_json}"
    
    categorized_tx = await groq_client.categorize_transactions(extracted_tx, full_cat_prompt)
    
    # 3. Insights (aggregate data first)
    print("Generating stats for insights...")
    income = sum(t.get("amount", 0) for t in categorized_tx if t.get("type") == "CREDIT")
    expense = sum(t.get("amount", 0) for t in categorized_tx if t.get("type") == "DEBIT")
    
    stats = {
        "total_income": income,
        "total_expense": expense,
        "net": income - expense,
        "transaction_count": len(categorized_tx)
    }
    
    print("Calling Groq for insights...")
    insights = await groq_client.generate_insights(stats, insights_prompt)
    
    return categorized_tx, insights
