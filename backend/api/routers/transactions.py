from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from db.database import get_db
from models.user import User
from models.transaction import Transaction
from models.transactions_view import TransactionsView
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
    account_id: Optional[str] = None,
    source: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Base query secured by user_id
    base_query = select(TransactionsView).where(TransactionsView.user_id == current_user.id)
    count_query = select(func.count()).select_from(TransactionsView).where(TransactionsView.user_id == current_user.id)
    
    # Apply filters
    if category_id:
        base_query = base_query.where(TransactionsView.category_id == category_id)
        count_query = count_query.where(TransactionsView.category_id == category_id)
        
    if type:
        base_query = base_query.where(TransactionsView.direction == type.upper())
        count_query = count_query.where(TransactionsView.direction == type.upper())
        
    if search:
        search_term = f"%{search}%"
        base_query = base_query.where(TransactionsView.description.ilike(search_term))
        count_query = count_query.where(TransactionsView.description.ilike(search_term))
        
    if account_id:
        base_query = base_query.where(TransactionsView.account_id == account_id)
        count_query = count_query.where(TransactionsView.account_id == account_id)

    if source and source.lower() != 'all':
        base_query = base_query.where(TransactionsView.source == source.lower())
        count_query = count_query.where(TransactionsView.source == source.lower())

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Pagination & sorting
    offset = (page - 1) * limit
    base_query = base_query.order_by(desc(TransactionsView.txn_date), desc(TransactionsView.created_at))
    base_query = base_query.offset(offset).limit(limit)
    
    result = await db.execute(base_query)
    transactions = result.scalars().all()
    
    # Map the output properly to match TransactionList schema (which expects 'date' and 'type')
    # Because TransactionsView has 'txn_date' and 'direction', we might need to map them back
    # Actually it's cleaner to let the router return dicts or we just rely on alias in schema
    output_txs = []
    for tx in transactions:
        tx_dict = {
            "id": tx.id,
            "statement_id": "", # views don't have this, but schema might require it?
            "user_id": tx.user_id,
            "date": tx.txn_date,
            "description": tx.description,
            "amount": tx.amount,
            "type": tx.direction,
            "balance": tx.balance,
            "currency": tx.currency,
            "category_id": tx.category_id,
            "merchant_id": tx.merchant_id,
            "merchant_name": tx.merchant_name,
            "subcategory": tx.subcategory,
            "tags": tx.tags,
            "is_recurring": False,
            "notes": tx.notes,
            "tx_hash": "", 
            "category_source": tx.category_source or "ai",
            "ai_confidence": tx.ai_confidence,
            "raw_metadata": {},
            "created_at": tx.created_at,
            "updated_at": tx.updated_at,
            "account_id": tx.account_id,
            "source": tx.source
        }
        output_txs.append(tx_dict)
    
    return TransactionList(
        data=output_txs,
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
