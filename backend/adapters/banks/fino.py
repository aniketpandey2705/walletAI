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
        Uses a robust regex-based approach to extract amounts and determine
        Debit vs Credit, bypassing Docling's flawed column shifts.
        """
        transactions = []
        lines = raw_text.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line.startswith("|") or not line.endswith("|"):
                continue
            
            # Remove all '|' and extra spaces, but keep a normalized separator
            clean_line = re.sub(r"\s*\|\s*", " | ", line).strip()
            
            # Find all dates
            dates = re.findall(r"\d{2}/\d{2}/\d{4}", clean_line)
            if not dates:
                continue
                
            txn_date_str = dates[0]
            
            # Find all amounts (numbers ending in .XX)
            amounts_matches = list(re.finditer(r"[\d,]+\.\d{2}", clean_line))
            
            if len(amounts_matches) >= 2:
                # The last amount is balance, second to last is the txn amount
                balance_str = amounts_matches[-1].group()
                amount_str = amounts_matches[-2].group()
                
                # The description is everything between the last date and the second-to-last amount
                last_date_match = list(re.finditer(r"\d{2}/\d{2}/\d{4}", clean_line))[-1]
                
                desc_start = last_date_match.end()
                desc_end = amounts_matches[-2].start()
                
                desc = clean_line[desc_start:desc_end].strip(" |")
                
                # Cleanup desc (remove | and extra spaces)
                desc = re.sub(r"\|\s*", "", desc)
                desc = re.sub(r"\s+", " ", desc).strip()
                
                # Determine Tx Type
                tx_type = "DEBIT"
                
                if "UPI/CR" in desc.upper():
                    tx_type = "CREDIT"
                elif "UPI/DR" in desc.upper():
                    tx_type = "DEBIT"
                else:
                    # Check original parts to guess based on position
                    parts = [p.strip() for p in line.split("|")][1:-1]
                    if len(parts) >= 6:
                        credit_col = parts[-2]
                        if amount_str in credit_col:
                            tx_type = "CREDIT"
                        else:
                            debit_col = parts[-3]
                            if amount_str in debit_col:
                                tx_type = "DEBIT"
                            else:
                                # Fallback: if it says NEFT Fund Transfer and is in part 4, it's credit
                                if len(parts) == 7 and amount_str in parts[4]:
                                    tx_type = "CREDIT"
                                elif len(parts) == 6 and amount_str in parts[3]:
                                    tx_type = "CREDIT"

                amount = float(amount_str.replace(",", ""))
                if amount == 0.0:
                    continue
                
                try:
                    dt = datetime.strptime(txn_date_str, "%d/%m/%Y")
                    std_date = dt.strftime("%Y-%m-%d")
                    transactions.append({
                        "date": std_date,
                        "description": desc,
                        "amount": amount,
                        "type": tx_type
                    })
                except Exception:
                    continue
                    
        return transactions
