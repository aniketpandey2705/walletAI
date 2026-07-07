from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from db.database import get_db
from models.user import User
from models.transaction import Transaction
from api.middleware.auth import get_current_user
from schemas.transaction import TransactionList, TransactionUpdate, TransactionOut
from models.merchant import MerchantMapping
from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException

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

@router.put("/{tx_id}", response_model=TransactionOut)
async def update_transaction(
    tx_id: str,
    update_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch the transaction
    stmt = select(Transaction).where(Transaction.id == tx_id, Transaction.user_id == current_user.id)
    result = await db.execute(stmt)
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    # Update fields
    if update_data.category_id is not None:
        transaction.category_id = update_data.category_id
    if update_data.merchant_name is not None:
        transaction.merchant_name = update_data.merchant_name
    if update_data.subcategory is not None:
        transaction.subcategory = update_data.subcategory
    if update_data.notes is not None:
        transaction.notes = update_data.notes
        
    transaction.category_source = "user"
    
    # If the user updated the merchant, subcategory or category, we should update the global merchant mapping cache
    # so future transactions use this new mapping.
    if update_data.merchant_name or update_data.category_id or update_data.subcategory:
        raw_desc = transaction.description
        
        # Check if mapping exists for this raw description
        m_stmt = select(MerchantMapping).where(MerchantMapping.raw_name == raw_desc)
        m_result = await db.execute(m_stmt)
        mapping = m_result.scalar_one_or_none()
        
        if mapping:
            # Update existing
            if update_data.merchant_name:
                mapping.normalized_name = update_data.merchant_name
            if update_data.category_id:
                mapping.category_id = update_data.category_id
            if update_data.subcategory:
                mapping.subcategory = update_data.subcategory
            
            mapping.source = "user"
            mapping.confidence = 100
            mapping.last_seen = datetime.now(timezone.utc)
        else:
            # Create new user-defined mapping
            merchant_name = update_data.merchant_name or transaction.merchant_name or "Unknown"
            cat_id = update_data.category_id or transaction.category_id
            subcat = update_data.subcategory or transaction.subcategory
            
            new_mapping = MerchantMapping(
                raw_name=raw_desc,
                normalized_name=merchant_name,
                category_id=cat_id,
                subcategory=subcat,
                confidence=100,
                aliases=[raw_desc],
                times_seen=1,
                last_seen=datetime.now(timezone.utc),
                source="user"
            )
            db.add(new_mapping)
            
    await db.commit()
    await db.refresh(transaction)
    
    return transaction
