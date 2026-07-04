import uuid
from datetime import datetime
from sqlalchemy import String, Integer, SmallInteger, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base


class AiInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    statement_id: Mapped[str] = mapped_column(
        String, ForeignKey("statements.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Insight content
    # MONTHLY_SUMMARY | CATEGORY_ALERT | SAVING_TIP | RECURRING_DETECTED | MERCHANT_SPOTLIGHT | CASHFLOW_ANALYSIS
    insight_type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=5)

    # Context
    stats_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    related_tx_ids: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    # AI metadata
    groq_model: Mapped[str] = mapped_column(String, nullable=False)
    prompt_version: Mapped[str] = mapped_column(String, nullable=False, default="v1")
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # User interaction
    is_dismissed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    user_rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
