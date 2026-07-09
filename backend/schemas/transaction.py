from pydantic import BaseModel, ConfigDict
from datetime import date
from decimal import Decimal
from typing import Optional, List


class TransactionUpdate(BaseModel):
    category_id: Optional[str] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    notes: Optional[str] = None

class TransactionOut(BaseModel):
    id: str
    statement_id: str
    date: date
    description: str
    amount: Decimal
    type: str  # DEBIT or CREDIT
    balance: Optional[Decimal] = None
    currency: str
    
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    merchant_name: Optional[str] = None
    subcategory: Optional[str] = None
    is_recurring: bool
    notes: Optional[str] = None
    
    category_source: str
    ai_confidence: Optional[Decimal] = None
    reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionList(BaseModel):
    data: List[TransactionOut]
    total: int
    page: int
    limit: int
