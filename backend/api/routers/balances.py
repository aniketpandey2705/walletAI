from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Optional
from decimal import Decimal

from db.database import get_db
from models.user import User
from models.account import Account
from models.statement import Statement
from models.manual_transaction import ManualTransaction
from api.middleware.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/balance", tags=["Balances"])

class AccountBalanceOut(BaseModel):
    account_id: str
    display_name: str
    account_type: str
    balance: Decimal

class BalanceResponse(BaseModel):
    balance: Decimal
    label: str

class NetPositionResponse(BaseModel):
    net_position: Decimal
    bank_balance: Decimal
    manual_balance: Decimal
    accounts_breakdown: List[AccountBalanceOut]

@router.get("/overall", response_model=BalanceResponse)
async def get_overall_balance(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch account
    account_res = await db.execute(select(Account).where(Account.id == account_id, Account.user_id == current_user.id))
    account = account_res.scalar_one_or_none()
    if not account:
        return BalanceResponse(balance=Decimal(0), label="Unknown")
        
    if account.account_type in ["cash", "wallet", "manual"]:
        # Compute running balance
        base_bal = account.starting_balance or Decimal(0)
        
        # Sum of credits
        credit_res = await db.execute(
            select(func.coalesce(func.sum(ManualTransaction.amount), 0))
            .where(ManualTransaction.account_id == account_id, ManualTransaction.direction == "CREDIT")
        )
        credits = credit_res.scalar()
        
        # Sum of debits
        debit_res = await db.execute(
            select(func.coalesce(func.sum(ManualTransaction.amount), 0))
            .where(ManualTransaction.account_id == account_id, ManualTransaction.direction == "DEBIT")
        )
        debits = debit_res.scalar()
        
        return BalanceResponse(balance=base_bal + credits - debits, label="Tracked Balance")
    else:
        # Bank account - get most recent statement closing balance
        stmt_res = await db.execute(
            select(Statement)
            .where(Statement.account_id == account_id, Statement.status == "COMPLETED")
            .order_by(Statement.period_end.desc())
            .limit(1)
        )
        statement = stmt_res.scalar_one_or_none()
        bal = statement.closing_bal if statement and statement.closing_bal is not None else Decimal(0)
        return BalanceResponse(balance=bal, label="Verified Balance")

@router.get("/net-position", response_model=NetPositionResponse)
async def get_net_position(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Bank Balance (sum of latest closing_bal for all bank accounts)
    # Using a subquery or DISTINCT ON (not standard across all dialects, but we use Postgres)
    query = text("""
        SELECT COALESCE(SUM(latest_bal), 0) FROM (
            SELECT DISTINCT ON (account_id) closing_bal AS latest_bal
            FROM statements
            JOIN accounts ON statements.account_id = accounts.id
            WHERE accounts.user_id = :user_id 
              AND accounts.account_type NOT IN ('cash', 'wallet', 'manual')
              AND statements.status = 'COMPLETED'
            ORDER BY account_id, period_end DESC
        ) sub
    """)
    bank_res = await db.execute(query, {"user_id": current_user.id})
    bank_balance = bank_res.scalar() or Decimal(0)
    
    # 2. Manual Balance
    # Sum of all starting balances
    start_bal_res = await db.execute(
        select(func.coalesce(func.sum(Account.starting_balance), 0))
        .where(Account.user_id == current_user.id, Account.account_type.in_(["cash", "wallet", "manual"]))
    )
    start_balance = start_bal_res.scalar() or Decimal(0)
    
    # Sum of all manual transactions credits
    credit_res = await db.execute(
        select(func.coalesce(func.sum(ManualTransaction.amount), 0))
        .where(ManualTransaction.user_id == current_user.id, ManualTransaction.direction == "CREDIT")
    )
    total_credits = credit_res.scalar() or Decimal(0)
    
    # Sum of all manual transactions debits
    debit_res = await db.execute(
        select(func.coalesce(func.sum(ManualTransaction.amount), 0))
        .where(ManualTransaction.user_id == current_user.id, ManualTransaction.direction == "DEBIT")
    )
    total_debits = debit_res.scalar() or Decimal(0)
    
    manual_balance = start_balance + total_credits - total_debits
    
    # Breakdown calculation
    breakdown = []
    
    # Get all active accounts
    all_accounts_res = await db.execute(
        select(Account).where(Account.user_id == current_user.id)
    )
    all_accounts = all_accounts_res.scalars().all()
    
    for acc in all_accounts:
        if acc.account_type in ["cash", "wallet", "manual"]:
            c_res = await db.execute(
                select(func.coalesce(func.sum(ManualTransaction.amount), 0))
                .where(ManualTransaction.account_id == acc.id, ManualTransaction.direction == "CREDIT")
            )
            d_res = await db.execute(
                select(func.coalesce(func.sum(ManualTransaction.amount), 0))
                .where(ManualTransaction.account_id == acc.id, ManualTransaction.direction == "DEBIT")
            )
            c = c_res.scalar() or Decimal(0)
            d = d_res.scalar() or Decimal(0)
            base = acc.starting_balance or Decimal(0)
            b = base + c - d
            breakdown.append({
                "account_id": acc.id,
                "display_name": acc.display_name,
                "account_type": acc.account_type,
                "balance": b
            })
        else:
            stmt_res = await db.execute(
                select(Statement.closing_bal)
                .where(Statement.account_id == acc.id, Statement.status == "COMPLETED")
                .order_by(Statement.period_end.desc())
                .limit(1)
            )
            stmt_bal = stmt_res.scalar()
            if stmt_bal is not None:
                breakdown.append({
                    "account_id": acc.id,
                    "display_name": acc.display_name,
                    "account_type": acc.account_type,
                    "balance": stmt_bal
                })
    
    return NetPositionResponse(
        net_position=bank_balance + manual_balance,
        bank_balance=bank_balance,
        manual_balance=manual_balance,
        accounts_breakdown=breakdown
    )
