from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models.transaction import Transaction
from models.category import Category

async def generate_timeline(db: AsyncSession, user_id: str, view: str = "month"):
    """
    Generates chronological financial events.
    view: "day", "week", "month", "year"
    """
    # Simply return all transactions ordered by date for now
    stmt = select(Transaction, Category.name.label("category_name"))\
        .join(Category, Transaction.category_id == Category.id, isouter=True)\
        .where(Transaction.user_id == user_id)\
        .order_by(desc(Transaction.date), desc(Transaction.created_at))
        
    res = await db.execute(stmt)
    
    events = []
    for row in res.all():
        t = row.Transaction
        cat_name = row.category_name
        
        events.append({
            "date": t.date.isoformat(),
            "merchant": t.merchant_name or t.description,
            "title": t.description,
            "category": cat_name or "Uncategorized",
            "amount": float(t.amount),
            "balance": float(t.balance) if t.balance is not None else None,
            "event_type": t.type
        })
        
    return {"events": events}
