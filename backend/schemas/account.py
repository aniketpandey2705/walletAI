from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import datetime

class AccountBase(BaseModel):
    account_no: Optional[str] = None
    ifsc: Optional[str] = None
    account_type: str = "savings"
    display_name: str
    starting_balance: Optional[Decimal] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    display_name: Optional[str] = None
    starting_balance: Optional[Decimal] = None

class AccountOut(AccountBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
