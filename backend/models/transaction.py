import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    String, Numeric, Date, DateTime, Boolean, ForeignKey,
    Text, func, ARRAY, Integer
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    statement_id: Mapped[str] = mapped_column(
        String, ForeignKey("statements.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Core financial data
    date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)   # Raw bank narration
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)  # Always positive
    type: Mapped[str] = mapped_column(String, nullable=False)         # "DEBIT" | "CREDIT"
    balance: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String, nullable=False, default="INR")

    # Classification
    category_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    merchant_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("merchant_mapping.id", ondelete="SET NULL"), nullable=True
    )
    merchant_name: Mapped[str | None] = mapped_column(String, nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    is_recurring: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    category = relationship("Category", lazy="joined")

    @property
    def category_name(self) -> str | None:
        return self.category.name if self.category else None

    @property
    def reason(self) -> str | None:
        if self.raw_metadata and isinstance(self.raw_metadata, dict):
            return self.raw_metadata.get("reason")
        return None

    # Pipeline metadata
    tx_hash: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    # "rule" | "ai" | "user"
    category_source: Mapped[str] = mapped_column(String, nullable=False, default="ai")
    ai_confidence: Mapped[int | None] = mapped_column(Integer, nullable=True)
    raw_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
