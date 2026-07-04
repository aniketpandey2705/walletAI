# Import all models here so Alembic can discover them for autogenerate
from models.user import User
from models.category import Category
from models.merchant import MerchantMapping
from models.statement import Statement
from models.transaction import Transaction
from models.insight import AiInsight
from models.chat import ChatHistory

__all__ = [
    "User",
    "Category",
    "MerchantMapping",
    "Statement",
    "Transaction",
    "AiInsight",
    "ChatHistory",
]
