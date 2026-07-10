from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from models.user import User
from api.middleware.auth import get_current_user
from services.engines.analytics import get_dashboard_summary, get_detailed_analytics
from services.engines.money_flow import generate_money_flow
from services.engines.timeline import generate_timeline
from services.engines.monthly_journey import generate_monthly_journey
from services.engines.financial_dna import generate_financial_dna
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["Analytics"])

from typing import Optional

@router.get("/dashboard")
async def get_dashboard(
    account_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """GET /dashboard - Summary, Quick Statistics, Recent Transactions, Top Categories, Top Merchants."""
    return await get_dashboard_summary(db, current_user.id, account_id)

@router.get("/detailed")
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """GET /analytics - Detailed analytics (Largest expense, averages, etc.)"""
    return await get_detailed_analytics(db, current_user.id)

@router.get("/money-flow")
async def get_money_flow(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """GET /money-flow - Hierarchical Sankey JSON (Income -> Category -> Merchant -> Tx)"""
    return await generate_money_flow(db, current_user.id)

@router.get("/timeline")
async def get_timeline(
    view: str = Query("month", description="View interval: day, week, month, year"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """GET /timeline - Chronological events"""
    return await generate_timeline(db, current_user.id, view)

@router.get("/monthly-journey")
async def get_monthly_journey(
    month: int = Query(datetime.now().month, description="Month (1-12)"),
    year: int = Query(datetime.now().year, description="Year"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """GET /monthly-journey - Structured monthly milestone events"""
    return await generate_monthly_journey(db, current_user.id, month, year)

@router.get("/financial-dna")
async def get_financial_dna(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """GET /financial-dna - User financial behavior traits"""
    return await generate_financial_dna(db, current_user.id)
