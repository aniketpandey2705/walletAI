from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Union
from datetime import date
from pydantic import BaseModel

class StatementMetadata(BaseModel):
    account_number: Optional[str] = None
    holder_name: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    opening_balance: Optional[float] = None
    closing_balance: Optional[float] = None

class BankAdapter(ABC):
    slug: str
    display_name: str

    @abstractmethod
    def detect(self, docling_doc: Dict[str, Any]) -> bool:
        """Detects if this adapter should handle the given document."""
        pass

    @abstractmethod
    def extract_metadata(self, docling_doc: Dict[str, Any]) -> StatementMetadata:
        """Extracts high-level metadata (account info, balances) from the document."""
        pass

    @abstractmethod
    def get_transaction_text(self, docling_doc: Dict[str, Any]) -> str:
        """
        Returns the raw markdown text of the statement for Groq to parse.
        Using raw text is more reliable than DataFrame parsing for PDFs with
        duplicate/merged column headers (common in bank statements).
        """
        pass
