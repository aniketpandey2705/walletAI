from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional
from decimal import Decimal


class StatementOut(BaseModel):
    id: str
    bank_slug: str
    file_name: str
    file_size_bytes: Optional[int] = None
    account_number: Optional[str] = None
    holder_name: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    status: str
    progress: int
    current_stage: Optional[str] = None
    error_msg: Optional[str] = None
    tx_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobStatusOut(BaseModel):
    id: str
    status: str
    progress: int
    current_stage: Optional[str] = None
    error_msg: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
