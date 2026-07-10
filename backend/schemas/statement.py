from pydantic import BaseModel, ConfigDict, Field
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
    
    account_id: Optional[str] = None
    computed_opening_balance: Optional[Decimal] = Field(None, validation_alias="opening_bal")
    computed_closing_balance: Optional[Decimal] = Field(None, validation_alias="closing_bal")
    continuity_warning: Optional[dict] = None
    
    bank_reported_closing_balance: Optional[Decimal] = None
    reconciliation_pass: Optional[bool] = None
    row_anomalies: Optional[list] = []
    date_anomalies: Optional[list] = []

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class JobStatusOut(BaseModel):
    id: str
    status: str
    progress: int
    current_stage: Optional[str] = None
    error_msg: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
