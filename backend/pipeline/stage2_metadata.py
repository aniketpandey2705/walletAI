from typing import Tuple
from adapters.registry import detect_adapter
from adapters.base import StatementMetadata


def run_stage2_metadata(docling_json: dict) -> Tuple[StatementMetadata, str, str]:
    """
    1. Pass docling json to adapter registry to find matching bank.
    2. Use adapter to extract metadata.
    3. Use adapter to get the raw statement text for Groq to parse.
    Returns: (Metadata, raw_text, bank_slug)
    """
    adapter = detect_adapter(docling_json)
    if not adapter:
        # Fallback: just send the full text to Groq anyway
        import logging
        logging.getLogger(__name__).warning("Could not detect bank adapter. Using full text fallback.")
        return StatementMetadata(), docling_json.get("text", ""), "unknown"

    metadata = adapter.extract_metadata(docling_json)
    raw_text = adapter.get_transaction_text(docling_json)

    return metadata, raw_text, adapter.slug
