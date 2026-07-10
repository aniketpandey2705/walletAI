from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, date

class ManualTransactionBase(BaseModel):
    account_id: str
    txn_date: date
    description: str
    amount: Decimal
    direction: str
    currency: str = "INR"
    category_id: Optional[str] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    created_by: str = "user"
    category_source: Optional[str] = None
    ai_confidence: Optional[int] = None

class ManualTransactionCreate(ManualTransactionBase):
    pass

class ManualTransactionUpdate(BaseModel):
    txn_date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    direction: Optional[str] = None
    category_id: Optional[str] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class ManualTransactionOut(ManualTransactionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
