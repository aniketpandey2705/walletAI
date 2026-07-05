from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
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
        """
        Detects if this adapter should handle the given document.
        Returns True if matched.
        """
        pass

    @abstractmethod
    def extract_metadata(self, docling_doc: Dict[str, Any]) -> StatementMetadata:
        """
        Extracts high-level metadata (account info, balances) from the document.
        """
        pass

    @abstractmethod
    def get_transaction_table(self, docling_doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identifies and extracts the core transaction table from the document JSON.
        Returns a list of rows (dicts) to be passed to the LLM.
        """
        pass
