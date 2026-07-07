import re
from typing import Dict, Any
from adapters.base import BankAdapter, StatementMetadata
from datetime import datetime


class FinoBankAdapter(BankAdapter):
    slug = "fino"
    display_name = "Fino Payments Bank"

    def detect(self, docling_doc: Dict[str, Any]) -> bool:
        text = docling_doc.get("text", "")
        return "FINO PAYMENTS BANK" in text.upper() or "FINO0" in text

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
            try:
                meta.opening_balance = float(open_bal.group(1).replace(",", ""))
            except:
                pass

        close_bal = re.search(r"Closing\s*Balance[\s\.:*]+([\d,.]+)", text, re.IGNORECASE)
        if close_bal:
            try:
                meta.closing_balance = float(close_bal.group(1).replace(",", ""))
            except:
                pass

        return meta

    def get_transaction_text(self, docling_doc: Dict[str, Any]) -> str:
        """
        Returns the full markdown text of the document. Groq will extract all
        transactions directly from this text, bypassing the fragile DataFrame approach
        which fails on Fino's duplicate-column tables (Withdrawal/Deposit amounts).
        """
        return docling_doc.get("text", "")

    # Keep for backward compatibility
    def get_transaction_table(self, docling_doc: Dict[str, Any]):
        return []

    def parse_transactions(self, raw_text: str) -> list[dict]:
        """
        Parses all transaction rows from the Fino statement markdown text.
        Handles both 6-column and 7-column row structures.
        """
        transactions = []
        lines = raw_text.split("\n")
        
        # Date regex DD/MM/YYYY
        date_pattern = re.compile(r"^\d{2}/\d{2}/\d{4}$")
        
        for line in lines:
            line = line.strip()
            if not line.startswith("|") or not line.endswith("|"):
                continue
            
            # Split and clean parts
            parts = [p.strip() for p in line.split("|")]
            # Remove the first and last empty elements caused by splitting outer |
            parts = parts[1:-1]
            
            if not parts:
                continue
            
            # Check if this row starts with a date
            txn_date_str = parts[0]
            if not date_pattern.match(txn_date_str):
                continue
                
            # Parse the row depending on the column count
            # 7 columns (with Reference No.): Date, ValueDate, RefNo, Desc, Debit, Credit, Balance
            # 6 columns (Reference No. omitted): Date, ValueDate, Desc, Debit, Credit, Balance
            if len(parts) == 7:
                desc = parts[3]
                debit_str = parts[4]
                credit_str = parts[5]
            elif len(parts) == 6:
                desc = parts[2]
                debit_str = parts[3]
                credit_str = parts[4]
            else:
                continue
                
            # Determine debit/credit amount and type
            amount = 0.0
            tx_type = "DEBIT"
            
            def clean_amount(val: str) -> float:
                val = val.replace(",", "").strip()
                return float(val) if val else 0.0
                
            try:
                debit_val = clean_amount(debit_str)
                credit_val = clean_amount(credit_str)
            except Exception:
                continue
                
            if debit_val > 0:
                amount = debit_val
                tx_type = "DEBIT"
            elif credit_val > 0:
                amount = credit_val
                tx_type = "CREDIT"
            else:
                continue
                
            # Standardize date format: DD/MM/YYYY -> YYYY-MM-DD
            try:
                dt = datetime.strptime(txn_date_str, "%d/%m/%Y")
                std_date = dt.strftime("%Y-%m-%d")
            except Exception:
                continue
                
            desc = re.sub(r"\s+", " ", desc).strip()
            
            transactions.append({
                "date": std_date,
                "description": desc,
                "amount": amount,
                "type": tx_type
            })
            
        return transactions
