from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from models.transactions_view import TransactionsView
from models.category import Category

async def generate_money_flow(db: AsyncSession, user_id: str, account_id: str | None = None):
    """
    Generates a hierarchical Sankey-compatible JSON representation of money flow:
    Income -> Category -> Merchant
    """
    # 1. Total Income
    inc_stmt = select(func.sum(TransactionsView.amount)).where(TransactionsView.user_id == user_id, TransactionsView.direction == "CREDIT")
    if account_id:
        inc_stmt = inc_stmt.where(TransactionsView.account_id == account_id)
    inc_res = await db.execute(inc_stmt)
    total_income = inc_res.scalar() or 0.0

    # 2. Expenses by Category
    cat_stmt = select(Category.name, func.sum(TransactionsView.amount).label("total"))\
        .join(Category, TransactionsView.category_id == Category.id, isouter=True)\
        .where(TransactionsView.user_id == user_id, TransactionsView.direction == "DEBIT")
    
    if account_id:
        cat_stmt = cat_stmt.where(TransactionsView.account_id == account_id)
        
    cat_stmt = cat_stmt.group_by(Category.name)
    cat_res = await db.execute(cat_stmt)
    categories = [{"name": row.name or "Uncategorized", "value": float(row.total)} for row in cat_res.all()]
    
    # 3. Expenses by Merchant (grouped by Category)
    merch_stmt = select(Category.name, TransactionsView.merchant_name, func.sum(TransactionsView.amount).label("total"))\
        .join(Category, TransactionsView.category_id == Category.id, isouter=True)\
        .where(TransactionsView.user_id == user_id, TransactionsView.direction == "DEBIT")
        
    if account_id:
        merch_stmt = merch_stmt.where(TransactionsView.account_id == account_id)
        
    merch_stmt = merch_stmt.group_by(Category.name, TransactionsView.merchant_name)
    merch_res = await db.execute(merch_stmt)
    
    merchants = [{"category": row.name or "Uncategorized", "merchant": row.merchant_name or "Unknown", "value": float(row.total)} for row in merch_res.all()]
    
    return {
        "nodes": [
            {"id": "Income", "type": "root", "value": float(total_income)}
        ],
        "links": [
            {"source": "Income", "target": cat["name"], "value": cat["value"]} for cat in categories
        ] + [
            {"source": m["category"], "target": f"{m['merchant']} ({m['category']})", "value": m["value"]} for m in merchants
        ]
    }
