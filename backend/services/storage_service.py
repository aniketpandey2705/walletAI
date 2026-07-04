from supabase import create_client, Client
from config import settings
import uuid
import os
from fastapi import UploadFile

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        self.bucket = settings.storage_bucket_name

    async def upload_statement(self, user_id: str, file: UploadFile) -> tuple[str, int]:
        """
        Uploads a file to Supabase Storage and returns the file path (key) and size.
        """
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        s3_key = f"{user_id}/{unique_filename}"

        # Read the file content
        file_content = await file.read()
        file_size = len(file_content)

        # Upload to Supabase Storage
        res = self.supabase.storage.from_(self.bucket).upload(
            file=file_content,
            path=s3_key,
            file_options={"content-type": file.content_type}
        )
        
        # Reset file cursor just in case it's used again
        await file.seek(0)
        
        return s3_key, file_size

    def get_signed_url(self, s3_key: str, expires_in: int = 3600) -> str:
        """
        Gets a temporary signed URL for a file.
        """
        res = self.supabase.storage.from_(self.bucket).create_signed_url(
            s3_key, expires_in
        )
        return res["signedURL"]

    def delete_statement(self, s3_key: str):
        """
        Deletes a file from Supabase Storage.
        """
        self.supabase.storage.from_(self.bucket).remove([s3_key])


storage_service = StorageService()
