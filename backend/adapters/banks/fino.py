import re
from typing import Dict, Any, List
from adapters.base import BankAdapter, StatementMetadata
from datetime import datetime

class FinoBankAdapter(BankAdapter):
    slug = "fino"
    display_name = "Fino Payments Bank"

    def _get_all_text(self, docling_doc: Dict[str, Any]) -> str:
        """Helper to extract all raw text blocks from the docling json."""
        texts = []
        for text_item in docling_doc.get("texts", []):
            if isinstance(text_item, dict) and "text" in text_item:
                texts.append(text_item["text"])
            elif isinstance(text_item, str):
                texts.append(text_item)
        return "\n".join(texts)

    def detect(self, docling_doc: Dict[str, Any]) -> bool:
        text = docling_doc.get("text", "")
        if "FINO PAYMENTS BANK" in text.upper() or "FINO0" in text:
            return True
        return False

    def extract_metadata(self, docling_doc: Dict[str, Any]) -> StatementMetadata:
        text = docling_doc.get("text", "")
        meta = StatementMetadata()
        
        acc_match = re.search(r"Account\s*No[\s\.:*]+(\d+)", text, re.IGNORECASE)
        if acc_match:
            meta.account_number = acc_match.group(1)
            
        name_match = re.search(r"Customer\s*Name[\s\.:*]+([A-Za-z\s]+)", text, re.IGNORECASE)
        if name_match:
            meta.holder_name = name_match.group(1).strip()
            
        open_bal = re.search(r"Opening\s*Balance[\s\.:*]+([\d,.]+)", text, re.IGNORECASE)
        if open_bal:
            meta.opening_balance = float(open_bal.group(1).replace(",", ""))
            
        close_bal = re.search(r"Closing\s*Balance[\s\.:*]+([\d,.]+)", text, re.IGNORECASE)
        if close_bal:
            meta.closing_balance = float(close_bal.group(1).replace(",", ""))
            
        return meta

    def get_transaction_table(self, docling_doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        tables = docling_doc.get("tables", [])
        tx_rows = []
        
        for table in tables:
            # table is a list of dicts (rows). We check the keys of the first row to see if it's the tx table.
            if not table: continue
            first_row = table[0]
            keys_str = " ".join([str(k).lower() for k in first_row.keys()])
            
            if "date" in keys_str and ("balance" in keys_str or "narration" in keys_str or "particulars" in keys_str):
                # We found it! Add all rows
                tx_rows.extend(table)
                
        # If headers were completely mangled, fallback: just return the longest table and let Groq figure it out!
        if not tx_rows and tables:
            longest_table = max(tables, key=len)
            tx_rows.extend(longest_table)
            
        return tx_rows
