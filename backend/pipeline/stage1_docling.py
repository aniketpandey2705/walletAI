import os
import tempfile
from supabase import create_client, Client
from config import settings
import pikepdf

# Initialize Supabase Admin client to fetch the private file
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)

def run_stage1_docling(file_path_in_bucket: str, password: str | None) -> dict:
    """
    1. Downloads PDF from Supabase Storage.
    2. Unlocks it if password provided.
    3. Parses it using Docling.
    4. Returns the docling JSON representation.
    """
    # 1. Download File
    bucket = settings.storage_bucket_name
    res = supabase.storage.from_(bucket).download(file_path_in_bucket)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_in:
        temp_in.write(res)
        temp_in_path = temp_in.name

    # 2. Unlock PDF if password exists
    target_path = temp_in_path
    if password:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_unlocked:
            target_path = temp_unlocked.name
            
        with pikepdf.open(temp_in_path, password=password) as pdf:
            pdf.save(target_path)
            
        # Clean up encrypted original
        os.remove(temp_in_path)

    # 3. Parse with Docling
    try:
        from docling.document_converter import DocumentConverter
        converter = DocumentConverter()
        doc = converter.convert(target_path).document
        
        # 4. Return as simpler dict with markdown and pandas records
        import pandas as pd
        
        tables_data = []
        for table in doc.tables:
            try:
                df = table.export_to_dataframe()
                tables_data.append(df.to_dict(orient="records"))
            except:
                pass
                
        return {
            "text": doc.export_to_markdown(),
            "tables": tables_data
        }
    finally:
        # Clean up target
        if os.path.exists(target_path):
            os.remove(target_path)
