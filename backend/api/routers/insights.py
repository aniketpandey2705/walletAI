from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from db.database import get_db
from models.user import User
from models.insight import AiInsight
from api.middleware.auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("")
async def get_insights(
    statement_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(AiInsight).where(
        AiInsight.user_id == current_user.id,
        AiInsight.is_dismissed == False
    )
    
    if statement_id:
        query = query.where(AiInsight.statement_id == statement_id)
        
    query = query.order_by(desc(AiInsight.priority), desc(AiInsight.created_at))
    
    result = await db.execute(query)
    insights = result.scalars().all()
    
    return insights
