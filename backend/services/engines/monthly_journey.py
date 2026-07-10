from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract
from models.transactions_view import TransactionsView
from datetime import date
from collections import defaultdict

async def generate_monthly_journey(db: AsyncSession, user_id: str, month: int, year: int, account_id: str | None = None):
    """
    Generates structured monthly events deterministically.
    Examples: Salary Received, Largest Purchase, Subscription.
    """
    stmt = select(TransactionsView).where(TransactionsView.user_id == user_id)
    if account_id:
        stmt = stmt.where(TransactionsView.account_id == account_id)
        
    stmt = stmt.where(
        extract("month", TransactionsView.txn_date) == month,
        extract("year", TransactionsView.txn_date) == year
    ).order_by(TransactionsView.txn_date)
    
    res = await db.execute(stmt)
    transactions = res.scalars().all()
    
    if not transactions:
        return {"events": []}
    
    events = []
    expenses = [t for t in transactions if t.direction == "DEBIT"]
    
    # Salary/Payday logic
    for t in transactions:
        amt = float(t.amount)
        if t.direction == "CREDIT" and amt > 1000:
            events.append({
                "type": "payday",
                "title": f"Payday: {t.merchant_name or 'Deposit'}",
                "date": t.txn_date.isoformat(),
                "amount": amt,
                "description": "A significant deposit landed in your account."
            })

    # Largest Purchase
    if expenses:
        largest_expense = max(expenses, key=lambda t: t.amount)
        events.append({
            "type": "Largest Purchase",
            "date": largest_expense.txn_date.isoformat(),
            "amount": float(largest_expense.amount),
            "merchant": largest_expense.merchant_name or largest_expense.description
        })
        
        # Highest Spending Day
        daily_spending = defaultdict(float)
        for e in expenses:
            daily_spending[e.txn_date] += float(e.amount)
        
        highest_day = max(daily_spending.items(), key=lambda item: item[1])
        events.append({
            "type": "Highest Spending Day",
            "date": highest_day[0].isoformat(),
            "amount": highest_day[1],
            "merchant": "Multiple"
        })
        
    # Subscriptions (heuristic based on subcategory or merchant_type)
    subscriptions = [t for t in expenses if t.subcategory and "subscription" in t.subcategory.lower()]
    for sub in subscriptions:
         events.append({
            "type": "Subscription",
            "date": sub.txn_date.isoformat(),
            "amount": float(sub.amount),
            "merchant": sub.merchant_name or sub.description
        })

    # Sort events by date
    events.sort(key=lambda x: x["date"])
    
    return {"events": events}
