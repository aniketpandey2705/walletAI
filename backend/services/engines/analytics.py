from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, extract
from models.transaction import Transaction
from models.category import Category
from datetime import datetime, timedelta

async def get_dashboard_summary(db: AsyncSession, user_id: str):
    """
    Returns Summary, Quick Statistics, Recent Transactions, Top Categories, Top Merchants.
    """
    # Totals
    stmt = select(Transaction.type, func.sum(Transaction.amount).label("total_amount"))\
        .where(Transaction.user_id == user_id)\
        .group_by(Transaction.type)
    
    result = await db.execute(stmt)
    totals = {row.type: float(row.total_amount) for row in result.all()}
    
    income = totals.get("CREDIT", 0.0)
    expenses = totals.get("DEBIT", 0.0)
    savings = income - expenses
    
    # Recent Transactions
    rec_stmt = select(Transaction).where(Transaction.user_id == user_id)\
        .order_by(desc(Transaction.date)).limit(5)
    rec_res = await db.execute(rec_stmt)
    recent_transactions = rec_res.scalars().all()
    
    # Top Categories (Expenses)
    cat_stmt = select(Transaction.category_id, Category.name, func.sum(Transaction.amount).label("total"))\
        .join(Category, Transaction.category_id == Category.id, isouter=True)\
        .where(Transaction.user_id == user_id, Transaction.type == "DEBIT")\
        .group_by(Transaction.category_id, Category.name)\
        .order_by(desc("total")).limit(5)
    cat_res = await db.execute(cat_stmt)
    top_categories = [{"category_id": row.category_id, "name": row.name or "Uncategorized", "amount": float(row.total)} for row in cat_res.all()]
    
    # Top Merchants (Expenses)
    merch_stmt = select(Transaction.merchant_name, func.sum(Transaction.amount).label("total"))\
        .where(Transaction.user_id == user_id, Transaction.type == "DEBIT", Transaction.merchant_name.is_not(None))\
        .group_by(Transaction.merchant_name)\
        .order_by(desc("total")).limit(5)
    merch_res = await db.execute(merch_stmt)
    top_merchants = [{"name": row.merchant_name, "amount": float(row.total)} for row in merch_res.all()]
    
    return {
        "summary": {
            "income": income,
            "expenses": expenses,
            "savings": savings,
            "savings_rate": (savings / income * 100) if income > 0 else 0
        },
        "recent_transactions": [
            {
                "id": t.id,
                "date": t.date.isoformat(),
                "description": t.description,
                "merchant": t.merchant_name,
                "amount": float(t.amount),
                "type": t.type
            }
            for t in recent_transactions
        ],
        "top_categories": top_categories,
        "top_merchants": top_merchants
    }

async def get_detailed_analytics(db: AsyncSession, user_id: str):
    """
    Returns full analytics: Category totals, Merchant totals, daily spending, averages, recurring, largest tx.
    """
    # Just the largest expense for now as an example
    stmt = select(Transaction).where(Transaction.user_id == user_id, Transaction.type == "DEBIT")\
        .order_by(desc(Transaction.amount)).limit(1)
    res = await db.execute(stmt)
    largest_expense = res.scalar_one_or_none()
    
    # Average transaction
    avg_stmt = select(func.avg(Transaction.amount)).where(Transaction.user_id == user_id, Transaction.type == "DEBIT")
    avg_res = await db.execute(avg_stmt)
    avg_expense = avg_res.scalar() or 0.0
    
    return {
        "largest_expense": {
            "amount": float(largest_expense.amount) if largest_expense else 0,
            "merchant": largest_expense.merchant_name if largest_expense else None,
            "date": largest_expense.date.isoformat() if largest_expense else None
        },
        "average_expense": float(avg_expense)
    }
