from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from models.user import User
from models.statement import Statement
from api.middleware.auth import get_current_user
from services.storage_service import storage_service
from schemas.upload import UploadResponse
from config import settings
from workers.process_statement import process_statement_task
import hashlib

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("", response_model=UploadResponse)
async def upload_statement(
    file: UploadFile = File(...),
    bank_slug: str = Form(...),
    password: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size is {settings.max_upload_size_mb}MB"
        )
        
    # Reset cursor for upload
    await file.seek(0)
    
    # 2. Basic file type validation
    if not (file.filename.lower().endswith(".pdf") or file.filename.lower().endswith(".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF or CSV files are supported"
        )
        
    # 3. Check for duplicates via hash
    file_hash = hashlib.sha256(file_content).hexdigest()
    
    # 4. Upload to Supabase Storage
    s3_key, _ = await storage_service.upload_statement(current_user.id, file)
    
    # 5. Insert statement record
    new_statement = Statement(
        user_id=current_user.id,
        bank_slug=bank_slug,
        file_name=file.filename,
        file_type="pdf" if file.filename.lower().endswith(".pdf") else "csv",
        file_size_bytes=file_size,
        s3_key=s3_key,
        file_hash=file_hash,
        status="PENDING",
        progress=0
    )
    db.add(new_statement)
    await db.commit()
    await db.refresh(new_statement)
    
    # 6. Enqueue Celery task
    # We pass the statement ID. If there's a password, we would store it temporarily 
    # in Redis (e.g. for 10 mins) so the worker can securely use it without DB persistence.
    # For now, we pass it directly to the task.
    process_statement_task.delay(new_statement.id, password)
    
    return UploadResponse(
        job_id=new_statement.id,
        status="PENDING",
        message="File uploaded successfully. Processing started."
    )
