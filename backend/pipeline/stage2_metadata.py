from typing import Tuple, Dict, Any
from adapters.registry import detect_adapter
from adapters.base import StatementMetadata

def run_stage2_metadata(docling_json: dict) -> Tuple[StatementMetadata, list[dict], str]:
    """
    1. Pass docling json to adapter registry to find matching bank.
    2. Use adapter to extract metadata.
    3. Use adapter to extract the raw transaction table.
    Returns: (Metadata, raw_tx_rows, bank_slug)
    """
    adapter = detect_adapter(docling_json)
    if not adapter:
        raise ValueError("Could not detect the bank format for this statement.")
        
    metadata = adapter.extract_metadata(docling_json)
    raw_tx_rows = adapter.get_transaction_table(docling_json)
    
    return metadata, raw_tx_rows, adapter.slug
