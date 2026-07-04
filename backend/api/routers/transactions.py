from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from db.database import get_db
from models.user import User
from models.transaction import Transaction
from api.middleware.auth import get_current_user
from schemas.transaction import TransactionList
from typing import Optional

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=TransactionList)
async def get_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    category_id: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Base query secured by user_id
    base_query = select(Transaction).where(Transaction.user_id == current_user.id)
    count_query = select(func.count()).select_from(Transaction).where(Transaction.user_id == current_user.id)
    
    # Apply filters
    if category_id:
        base_query = base_query.where(Transaction.category_id == category_id)
        count_query = count_query.where(Transaction.category_id == category_id)
        
    if type:
        base_query = base_query.where(Transaction.type == type.upper())
        count_query = count_query.where(Transaction.type == type.upper())
        
    if search:
        search_term = f"%{search}%"
        base_query = base_query.where(Transaction.description.ilike(search_term))
        count_query = count_query.where(Transaction.description.ilike(search_term))
        
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Pagination & sorting
    offset = (page - 1) * limit
    base_query = base_query.order_by(desc(Transaction.date), desc(Transaction.created_at))
    base_query = base_query.offset(offset).limit(limit)
    
    result = await db.execute(base_query)
    transactions = result.scalars().all()
    
    return TransactionList(
        data=transactions,
        total=total,
        page=page,
        limit=limit
    )
