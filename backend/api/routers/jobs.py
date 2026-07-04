from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from models.user import User
from models.statement import Statement
from api.middleware.auth import get_current_user
from schemas.statement import JobStatusOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/{job_id}", response_model=JobStatusOut)
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Statement).where(
        Statement.id == job_id,
        Statement.user_id == current_user.id
    )
    result = await db.execute(stmt)
    statement = result.scalar_one_or_none()
    
    if not statement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
        
    return statement
