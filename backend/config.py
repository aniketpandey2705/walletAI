from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache
from typing import List, Any


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "WalletDNA"
    app_env: str = "development"
    debug: bool = False
    backend_cors_origins: Any = "http://localhost:3000"

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        """
        Accepts any of these .env formats:
          BACKEND_CORS_ORIGINS=http://localhost:3000
          BACKEND_CORS_ORIGINS=http://localhost:3000,https://myapp.com
          BACKEND_CORS_ORIGINS=["http://localhost:3000"]
        """
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Strip JSON brackets if present
            v = v.strip()
            if v.startswith("["):
                import json
                return json.loads(v)
            # Comma-separated plain string
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return [str(v)]

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    database_url: str

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Groq
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"

    # Storage
    storage_bucket_name: str = "statements"
    max_upload_size_mb: int = 10

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

