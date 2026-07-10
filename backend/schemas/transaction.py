from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List


class TransactionUpdate(BaseModel):
    category_id: Optional[str] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    notes: Optional[str] = None

class TransactionOut(BaseModel):
    id: str
    statement_id: Optional[str] = None
    account_id: Optional[str] = None
    user_id: str
    date: date
    description: str
    amount: Decimal
    type: str
    balance: Optional[Decimal] = None
    currency: str
    
    category_id: Optional[str] = None
    merchant_id: Optional[str] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[list[str]] = None
    is_recurring: bool
    notes: Optional[str] = None
    
    tx_hash: str
    category_source: str
    ai_confidence: Optional[int] = None
    raw_metadata: Optional[dict] = None
    
    source: Optional[str] = "bank"

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionList(BaseModel):
    data: List[TransactionOut]
    total: int
    page: int
    limit: int
