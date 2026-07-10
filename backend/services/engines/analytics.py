from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, extract
from models.transactions_view import TransactionsView
from models.category import Category
from datetime import datetime, timedelta

async def get_dashboard_summary(db: AsyncSession, user_id: str, account_id: str | None = None):
    """
    Returns Summary, Quick Statistics, Recent Transactions, Top Categories, Top Merchants.
    """
    # Totals
    stmt = select(TransactionsView.direction, func.sum(TransactionsView.amount).label("total_amount"))\
        .where(TransactionsView.user_id == user_id)
        
    if account_id:
        stmt = stmt.where(TransactionsView.account_id == account_id)
        
    stmt = stmt.group_by(TransactionsView.direction)
    
    result = await db.execute(stmt)
    totals = {row.direction: float(row.total_amount) for row in result.all()}
    
    income = totals.get("CREDIT", 0.0)
    expenses = totals.get("DEBIT", 0.0)
    savings = income - expenses
    
    # Recent Transactions
    rec_stmt = select(TransactionsView).where(TransactionsView.user_id == user_id)
    if account_id:
        rec_stmt = rec_stmt.where(TransactionsView.account_id == account_id)
    rec_stmt = rec_stmt.order_by(desc(TransactionsView.txn_date)).limit(5)
    rec_res = await db.execute(rec_stmt)
    recent_transactions = rec_res.scalars().all()
    
    # Top Categories (Expenses)
    cat_stmt = select(TransactionsView.category_id, Category.name, func.sum(TransactionsView.amount).label("total"))\
        .join(Category, TransactionsView.category_id == Category.id, isouter=True)\
        .where(TransactionsView.user_id == user_id, TransactionsView.direction == "DEBIT")
    if account_id:
        cat_stmt = cat_stmt.where(TransactionsView.account_id == account_id)
        
    cat_stmt = cat_stmt.group_by(TransactionsView.category_id, Category.name)\
        .order_by(desc("total")).limit(5)
    cat_res = await db.execute(cat_stmt)
    top_categories = [{"category_id": row.category_id, "name": row.name or "Uncategorized", "amount": float(row.total)} for row in cat_res.all()]
    
    # Top Merchants (Expenses)
    merch_stmt = select(TransactionsView.merchant_name, func.sum(TransactionsView.amount).label("total"))\
        .where(TransactionsView.user_id == user_id, TransactionsView.direction == "DEBIT", TransactionsView.merchant_name.is_not(None))
    if account_id:
        merch_stmt = merch_stmt.where(TransactionsView.account_id == account_id)
        
    merch_stmt = merch_stmt.group_by(TransactionsView.merchant_name)\
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
                "date": t.txn_date.isoformat(),
                "description": t.description,
                "merchant": t.merchant_name,
                "amount": float(t.amount),
                "type": t.direction
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
    stmt = select(TransactionsView).where(TransactionsView.user_id == user_id, TransactionsView.direction == "DEBIT")\
        .order_by(desc(TransactionsView.amount)).limit(1)
    res = await db.execute(stmt)
    largest_expense = res.scalar_one_or_none()
    
    # Average transaction
    avg_stmt = select(func.avg(TransactionsView.amount)).where(TransactionsView.user_id == user_id, TransactionsView.direction == "DEBIT")
    avg_res = await db.execute(avg_stmt)
    avg_expense = avg_res.scalar() or 0.0
    
    return {
        "largest_expense": {
            "amount": float(largest_expense.amount) if largest_expense else 0,
            "merchant": largest_expense.merchant_name if largest_expense else None,
            "date": largest_expense.txn_date.isoformat() if largest_expense else None
        },
        "average_expense": float(avg_expense)
    }
