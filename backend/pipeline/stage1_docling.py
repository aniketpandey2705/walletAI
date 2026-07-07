import os
import logging
import tempfile
from supabase import create_client, Client
from config import settings
import pikepdf

logger = logging.getLogger(__name__)

# Initialize Supabase Admin client once at module load
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)

# --- Docling Singleton ---
# DocumentConverter loads heavy PyTorch AI models (~30s) on first init.
# We keep ONE instance alive for the entire lifetime of the Celery worker
# process so all subsequent tasks reuse the already-loaded models.
_converter = None

def _get_converter():
    global _converter
    if _converter is None:
        logger.info("Initializing Docling DocumentConverter (first time — loading AI models)...")
        from docling.document_converter import DocumentConverter
        _converter = DocumentConverter()
        logger.info("Docling DocumentConverter ready.")
    return _converter


def run_stage1_docling(file_path_in_bucket: str, password: str | None) -> dict:
    """
    1. Downloads PDF from Supabase Storage.
    2. Unlocks it with pikepdf if password is provided.
    3. Parses it using Docling (reuses the singleton converter — fast after first run).
    4. Returns a dict with the full markdown text of the document.
    """
    # 1. Download file from Supabase
    bucket = settings.storage_bucket_name
    res = supabase.storage.from_(bucket).download(file_path_in_bucket)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_in:
        temp_in.write(res)
        temp_in_path = temp_in.name

    # 2. Unlock PDF if password provided
    target_path = temp_in_path
    if password:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_unlocked:
            target_path = temp_unlocked.name

        with pikepdf.open(temp_in_path, password=password) as pdf:
            pdf.save(target_path)

        os.remove(temp_in_path)

    # 3. Convert with Docling (uses cached singleton)
    try:
        converter = _get_converter()
        logger.info(f"Converting {os.path.basename(target_path)} with Docling...")
        doc = converter.convert(target_path).document

        # 4. Export to markdown — Groq reads this directly
        markdown_text = doc.export_to_markdown()
        logger.info(f"Docling conversion complete. Text length: {len(markdown_text)} chars.")

        # ── DEBUG: Save raw output to file so you can inspect it ──────────────
        debug_path = os.path.join(os.path.dirname(__file__), "..", "docling_debug.md")
        with open(debug_path, "w", encoding="utf-8") as f:
            f.write(markdown_text)
        logger.info(f"DEBUG: Docling output saved to {os.path.abspath(debug_path)}")
        # ── END DEBUG ──────────────────────────────────────────────────────────

        return {
            "text": markdown_text,
        }
    finally:
        if os.path.exists(target_path):
            os.remove(target_path)
