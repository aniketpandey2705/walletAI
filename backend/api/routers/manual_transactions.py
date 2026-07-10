from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import date

from db.database import get_db
from models.user import User
from models.manual_transaction import ManualTransaction
from api.middleware.auth import get_current_user
from schemas.manual_transaction import ManualTransactionCreate, ManualTransactionOut, ManualTransactionUpdate

router = APIRouter(prefix="/manual-transactions", tags=["Manual Transactions"])

@router.post("", response_model=ManualTransactionOut)
async def create_manual_transaction(
    tx_in: ManualTransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tx = ManualTransaction(
        **tx_in.model_dump(),
        user_id=current_user.id
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx

@router.get("", response_model=List[ManualTransactionOut])
async def list_manual_transactions(
    account_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(ManualTransaction).where(ManualTransaction.user_id == current_user.id)
    if account_id:
        query = query.where(ManualTransaction.account_id == account_id)
    if start_date:
        query = query.where(ManualTransaction.txn_date >= start_date)
    if end_date:
        query = query.where(ManualTransaction.txn_date <= end_date)
    
    query = query.order_by(desc(ManualTransaction.txn_date), desc(ManualTransaction.created_at))
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/{tx_id}", response_model=ManualTransactionOut)
async def update_manual_transaction(
    tx_id: str,
    tx_in: ManualTransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ManualTransaction).where(ManualTransaction.id == tx_id, ManualTransaction.user_id == current_user.id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Manual transaction not found")

    update_data = tx_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tx, key, value)

    await db.commit()
    await db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
async def delete_manual_transaction(
    tx_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ManualTransaction).where(ManualTransaction.id == tx_id, ManualTransaction.user_id == current_user.id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Manual transaction not found")

    await db.delete(tx)
    await db.commit()
    return {"status": "success"}
