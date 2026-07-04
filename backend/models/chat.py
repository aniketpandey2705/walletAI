import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from db.database import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    # Optional: which statement this chat is about
    statement_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("statements.id", ondelete="SET NULL"), nullable=True
    )
    # Groups all messages in one conversation thread
    session_id: Mapped[str] = mapped_column(String, nullable=False)

    # "user" | "assistant" | "system"
    role: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Assistant message metadata
    groq_model: Mapped[str | None] = mapped_column(String, nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String, nullable=True)

    # Rich metadata (tool calls, citations, referenced transaction IDs)
    # Note: 'metadata' is reserved by SQLAlchemy — using 'extra_data' as attribute name,
    # mapped to 'metadata' column in the DB
    extra_data: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
