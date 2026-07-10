from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models.transactions_view import TransactionsView
from models.category import Category

async def generate_timeline(db: AsyncSession, user_id: str, view: str = "month", account_id: str | None = None):
    """
    Generates chronological financial events.
    view: "day", "week", "month", "year"
    """
    # Base query for all transactions
    stmt = select(TransactionsView, Category.name.label("category_name"))\
        .join(Category, TransactionsView.category_id == Category.id, isouter=True)\
        .where(TransactionsView.user_id == user_id)
        
    if account_id:
        stmt = stmt.where(TransactionsView.account_id == account_id)
        
    stmt = stmt.order_by(desc(TransactionsView.txn_date), desc(TransactionsView.created_at))
        
    res = await db.execute(stmt)
    
    events = []
    for row in res.all():
        t = row.TransactionsView
        cat_name = row.category_name
        
        events.append({
            "date": t.txn_date.isoformat(),
            "merchant": t.merchant_name or t.description,
            "title": t.description,
            "category": cat_name or "Uncategorized",
            "amount": float(t.amount),
            "balance": float(t.balance) if t.balance is not None else None,
            "event_type": t.direction
        })
        
    return {"events": events}
