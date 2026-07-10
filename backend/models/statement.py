import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import String, Numeric, Date, DateTime, ForeignKey, Integer, SmallInteger, func, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base


class Statement(Base):
    __tablename__ = "statements"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # File info
    bank_slug: Mapped[str] = mapped_column(String, nullable=False)         # e.g. "fino"
    file_name: Mapped[str] = mapped_column(String, nullable=False)
    file_type: Mapped[str] = mapped_column(String, nullable=False, default="pdf")
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    s3_key: Mapped[str] = mapped_column(String, nullable=False)
    file_hash: Mapped[str | None] = mapped_column(String, nullable=True)   # SHA-256 for dedup
    source_file_hash: Mapped[str | None] = mapped_column(String, nullable=True) # Exact re-upload protection

    # Account metadata (filled by adapter in Stage 2)
    account_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True
    )
    account_number: Mapped[str | None] = mapped_column(String, nullable=True)
    holder_name: Mapped[str | None] = mapped_column(String, nullable=True)
    period_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    period_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    opening_bal: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    closing_bal: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String, nullable=False, default="INR")
    continuity_warning: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Processing state
    # PENDING | PROCESSING | COMPLETE | FAILED | PARTIAL
    status: Mapped[str] = mapped_column(String, nullable=False, default="PENDING")
    progress: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    current_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    error_msg: Mapped[str | None] = mapped_column(Text, nullable=True)
    tx_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Raw Docling output — cached so we can re-run AI without re-uploading
    docling_output: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
