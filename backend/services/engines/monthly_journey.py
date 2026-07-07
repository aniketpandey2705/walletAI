from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models.transaction import Transaction
from datetime import date
from collections import defaultdict

async def generate_monthly_journey(db: AsyncSession, user_id: str, month: int, year: int):
    """
    Generates structured monthly events deterministically.
    Examples: Salary Received, Largest Purchase, Subscription.
    """
    stmt = select(Transaction).where(Transaction.user_id == user_id)
    res = await db.execute(stmt)
    transactions = res.scalars().all()
    
    # Filter for the month/year
    month_txs = [t for t in transactions if t.date.month == month and t.date.year == year]
    
    if not month_txs:
        return {"events": []}
    
    events = []
    
    # Salary Received
    incomes = [t for t in month_txs if t.type == "CREDIT"]
    if incomes:
        largest_income = max(incomes, key=lambda t: t.amount)
        events.append({
            "type": "Salary Received" if largest_income.amount > 10000 else "Major Income",
            "date": largest_income.date.isoformat(),
            "amount": float(largest_income.amount),
            "merchant": largest_income.merchant_name or largest_income.description
        })
        
    # Largest Purchase
    expenses = [t for t in month_txs if t.type == "DEBIT"]
    if expenses:
        largest_expense = max(expenses, key=lambda t: t.amount)
        events.append({
            "type": "Largest Purchase",
            "date": largest_expense.date.isoformat(),
            "amount": float(largest_expense.amount),
            "merchant": largest_expense.merchant_name or largest_expense.description
        })
        
        # Highest Spending Day
        daily_spending = defaultdict(float)
        for e in expenses:
            daily_spending[e.date] += float(e.amount)
        
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
            "date": sub.date.isoformat(),
            "amount": float(sub.amount),
            "merchant": sub.merchant_name or sub.description
        })

    # Sort events by date
    events.sort(key=lambda x: x["date"])
    
    return {"events": events}
