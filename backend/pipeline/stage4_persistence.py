from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.transaction import Transaction
from models.insight import AiInsight
from models.statement import Statement
from services.dedup_service import dedup_service
from config import settings

async def run_stage4_persistence(
    db: AsyncSession, 
    user_id: str, 
    statement_id: str,
    categorized_tx: list[dict], 
    insights: list[dict]
) -> dict:
    """
    1. Calculates hashes for all transactions.
    2. Filters out existing duplicates using DedupService.
    3. Bulk inserts new transactions.
    4. Inserts insights.
    5. Returns a summary dict of what was saved.
    """
    # 1. Calculate hashes
    hashed_txs = []
    hashes_only = []
    
    for tx in categorized_tx:
        # Pydantic validation would normally happen here, but we trust Groq output for MVP
        try:
            date_str = str(tx.get("date"))
            desc = str(tx.get("description", ""))
            amount = float(tx.get("amount", 0))
            
            tx_hash = dedup_service.compute_tx_hash(user_id, date_str, desc, amount)
            
            tx["tx_hash"] = tx_hash
            hashed_txs.append(tx)
            hashes_only.append(tx_hash)
        except Exception as e:
            print(f"Skipping malformed transaction: {tx} | Error: {e}")
            
    # 2. Filter duplicates
    new_hashes = await dedup_service.filter_existing(db, user_id, hashes_only)
    new_hashes_set = set(new_hashes)
    
    # Filter the actual list
    transactions_to_insert = [tx for tx in hashed_txs if tx["tx_hash"] in new_hashes_set]
    
    # 3. Bulk insert transactions
    if transactions_to_insert:
        db_txs = [
            Transaction(
                user_id=user_id,
                statement_id=statement_id,
                date=datetime.strptime(tx["date"], "%Y-%m-%d").date(),
                description=tx["description"],
                amount=tx["amount"],
                type=tx["type"],
                category_id=tx.get("category_id"),
                merchant_name=tx.get("merchant"),
                subcategory=tx.get("subcategory"),
                ai_confidence=tx.get("confidence"),
                tx_hash=tx["tx_hash"]
            )
            for tx in transactions_to_insert
        ]
        db.add_all(db_txs)
        
    # 4. Insert insights
    if insights:
        db_insights = [
            AiInsight(
                user_id=user_id,
                statement_id=statement_id,
                title=ins.get("title", "Insight"),
                body=ins.get("content", ""),
                insight_type=ins.get("type", "NEUTRAL"),
                stats_snapshot={},
                groq_model=settings.groq_model
            )
            for ins in insights
        ]
        db.add_all(db_insights)
        
    # Commit all
    await db.commit()
    
    return {
        "total_extracted": len(hashed_txs),
        "inserted_new": len(transactions_to_insert),
        "duplicates_skipped": len(hashed_txs) - len(transactions_to_insert),
        "insights_generated": len(insights)
    }
