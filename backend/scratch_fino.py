import re
from datetime import datetime

with open("docling_debug.md", "r") as f:
    raw_text = f.read()

transactions = []
lines = raw_text.split("\n")

date_pattern = re.compile(r"^\d{2}/\d{2}/\d{4}$")

for line in lines:
    line = line.strip()
    if not line.startswith("|") or not line.endswith("|"):
        continue
    
    clean_line = re.sub(r"\s*\|\s*", " | ", line).strip()
    dates = re.findall(r"\d{2}/\d{2}/\d{4}", clean_line)
    if not dates:
        continue
        
    txn_date_str = dates[0]
    
    amounts_matches = list(re.finditer(r"[\d,]+\.\d{2}", clean_line))
    if len(amounts_matches) >= 2:
        balance_str = amounts_matches[-1].group()
        amount_str = amounts_matches[-2].group()
        
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
            # Check original parts
            parts = [p.strip() for p in line.split("|")][1:-1]
            if len(parts) >= 6:
                # The credit column is parts[-2] in a 6 col or parts[-2] in 7 col
                credit_col = parts[-2]
                if amount_str in credit_col:
                    tx_type = "CREDIT"
                else:
                    debit_col = parts[-3]
                    if amount_str in debit_col:
                        tx_type = "DEBIT"
                    else:
                        # Fallback for NEFT Fund Transfer which is CREDIT in row 1
                        if "NEFT" in desc.upper() and amount_str in line:
                            # Actually, we can check if the amount is in the credit column in the raw line
                            pass
                            
        amount = float(amount_str.replace(",", ""))
        
        try:
            dt = datetime.strptime(txn_date_str, "%d/%m/%Y")
            std_date = dt.strftime("%Y-%m-%d")
            transactions.append({
                "date": std_date,
                "description": desc,
                "amount": amount,
                "type": tx_type
            })
        except:
            continue

for tx in transactions:
    print(f"{tx['date']} | {tx['type']} | {tx['amount']} | {tx['description']}")
