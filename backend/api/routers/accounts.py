from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from db.database import get_db
from models.user import User
from models.account import Account
from api.middleware.auth import get_current_user
from schemas.account import AccountCreate, AccountOut, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.post("", response_model=AccountOut)
async def create_account(
    account_in: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    account = Account(
        user_id=current_user.id,
        account_no=account_in.account_no,
        ifsc=account_in.ifsc,
        account_type=account_in.account_type,
        display_name=account_in.display_name,
        starting_balance=account_in.starting_balance
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account

@router.get("", response_model=List[AccountOut])
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Account).where(Account.user_id == current_user.id).order_by(Account.created_at)
    )
    return result.scalars().all()

@router.get("/{account_id}", response_model=AccountOut)
async def get_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Account).where(Account.id == account_id, Account.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.patch("/{account_id}", response_model=AccountOut)
async def update_account(
    account_id: str,
    account_in: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Account).where(Account.id == account_id, Account.user_id == current_user.id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account_in.display_name is not None:
        account.display_name = account_in.display_name
    if account_in.starting_balance is not None:
        account.starting_balance = account_in.starting_balance

    await db.commit()
    await db.refresh(account)
    return account
