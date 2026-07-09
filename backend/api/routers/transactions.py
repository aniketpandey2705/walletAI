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
    transaction.ai_confidence = 100
    
    # Financial Memory: Alias Learning and User Corrections
    if update_data.merchant_name or update_data.category_id or update_data.subcategory:
        raw_desc = transaction.description
        new_normalized_name = update_data.merchant_name or transaction.merchant_name or "Unknown"
        
        # We first check if the target merchant already exists (by normalized_name)
        # so we can append this raw_desc as an alias to it.
        m_stmt = select(MerchantMapping).where(MerchantMapping.normalized_name.ilike(new_normalized_name))
        m_result = await db.execute(m_stmt)
        existing_mapping = m_result.scalars().first()
        
        if existing_mapping:
            # Add raw_desc to aliases if not already there
            aliases = existing_mapping.aliases or []
            if raw_desc not in aliases:
                aliases.append(raw_desc)
                existing_mapping.aliases = list(aliases)
                
            if update_data.category_id:
                existing_mapping.category_id = update_data.category_id
            if update_data.subcategory:
                existing_mapping.subcategory = update_data.subcategory
                
            existing_mapping.source = "user"
            existing_mapping.confidence = 100
            existing_mapping.last_seen = datetime.now(timezone.utc)
            
            # Update the transaction to point to this merchant mapping
            transaction.merchant_id = existing_mapping.id
        else:
            # Wait, what if there's already a mapping for this raw_desc but the user renamed the merchant?
            # E.g. raw_desc="AMZN" was mapped to "Unknown", now mapped to "Amazon".
            # We should check if a mapping for raw_name exists and update it, or create a new one.
            m_raw_stmt = select(MerchantMapping).where(MerchantMapping.raw_name == raw_desc)
            m_raw_result = await db.execute(m_raw_stmt)
            raw_mapping = m_raw_result.scalar_one_or_none()
            
            if raw_mapping:
                raw_mapping.normalized_name = new_normalized_name
                if update_data.category_id:
                    raw_mapping.category_id = update_data.category_id
                if update_data.subcategory:
                    raw_mapping.subcategory = update_data.subcategory
                raw_mapping.source = "user"
                raw_mapping.confidence = 100
                raw_mapping.last_seen = datetime.now(timezone.utc)
                transaction.merchant_id = raw_mapping.id
            else:
                cat_id = update_data.category_id or transaction.category_id
                subcat = update_data.subcategory or transaction.subcategory
                
                new_mapping = MerchantMapping(
                    raw_name=raw_desc,
                    normalized_name=new_normalized_name,
                    category_id=cat_id,
                    subcategory=subcat,
                    confidence=100,
                    aliases=[raw_desc],
                    times_seen=1,
                    last_seen=datetime.now(timezone.utc),
                    source="user"
                )
                db.add(new_mapping)
                # Flush to get the ID
                await db.flush()
                transaction.merchant_id = new_mapping.id
            
    await db.commit()
    await db.refresh(transaction)
    
    return transaction
