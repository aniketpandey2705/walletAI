from sqlalchemy import String, Numeric, Date, DateTime, Text, ARRAY, Integer, Boolean, text
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base
from datetime import datetime, date
from decimal import Decimal
import uuid

class TransactionsView(Base):
    __tablename__ = "transactions_view"
    __table_args__ = {"info": {"is_view": True}}

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String)
    account_id: Mapped[str | None] = mapped_column(String, nullable=True)
    
    txn_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(Text)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    direction: Mapped[str] = mapped_column(String)
    currency: Mapped[str] = mapped_column(String)
    balance: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    
    category_id: Mapped[str | None] = mapped_column(String, nullable=True)
    merchant_id: Mapped[str | None] = mapped_column(String, nullable=True)
    merchant_name: Mapped[str | None] = mapped_column(String, nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    source: Mapped[str] = mapped_column(String)  # 'bank' or 'manual'
    category_source: Mapped[str | None] = mapped_column(String, nullable=True)
    ai_confidence: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
