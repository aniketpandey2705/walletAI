import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    
    account_no: Mapped[str | None] = mapped_column(String, nullable=True)
    ifsc: Mapped[str | None] = mapped_column(String, nullable=True)
    account_type: Mapped[str] = mapped_column(
        Enum('savings', 'current', 'cash', 'wallet', name='account_type_enum'),
        nullable=False,
        default='savings'
    )
    display_name: Mapped[str] = mapped_column(String, nullable=False, default="My Account")
    starting_balance: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
