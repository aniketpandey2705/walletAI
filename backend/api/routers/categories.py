from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from db.database import get_db
from models.user import User
from models.category import Category
from models.transaction import Transaction
from api.middleware.auth import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("")
async def get_all_categories(db: AsyncSession = Depends(get_db)):
    """Returns all system categories for dropdowns."""
    query = select(Category).order_by(Category.name)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/summary")
async def get_category_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns aggregated spend per category for the current user."""
    # This is a simplified summary. In a real app we'd filter by month/date range.
    query = (
        select(
            Category.id,
            Category.name,
            Category.icon,
            Category.color_hex,
            func.sum(Transaction.amount).label("total_amount")
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "DEBIT"
        )
        .group_by(Category.id)
        .order_by(func.sum(Transaction.amount).desc())
    )
    
    result = await db.execute(query)
    
    summary = []
    for row in result:
        summary.append({
            "id": row.id,
            "name": row.name,
            "icon": row.icon,
            "color_hex": row.color_hex,
            "total_amount": float(row.total_amount)
        })
        
    return summary
