import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriSense"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key & JWT
    SECRET_KEY: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "agrisense_super_secret_jwt_key_change_in_production_32bytes")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Environment & Auth
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEV_OTP_CODE: str = os.getenv("DEV_OTP_CODE", "123456")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    # External APIs & Keys
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_API_KEY") or os.getenv("DATA_GOV_IN_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("CLAUDE_API_KEY") or os.getenv("ANTHROPIC_API_KEY", "")
    CACHE_TTL_MINUTES: int = int(os.getenv("CACHE_TTL_MINUTES", "30"))
    
    # RAG & ChromaDB Configuration
    CHROMA_DB_DIR: str = os.getenv("VECTOR_DB_PATH") or os.getenv("CHROMA_DB_DIR", "./chroma_db")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    SIMILARITY_DISTANCE_THRESHOLD: float = float(os.getenv("SIMILARITY_DISTANCE_THRESHOLD", "0.92"))
    DEFAULT_FARM_DISTRICT: str = os.getenv("DEFAULT_FARM_DISTRICT", "Nashik")
    
    # Storage Configuration
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # 'local' or 's3'
    LOCAL_STORAGE_DIR: str = os.getenv("LOCAL_STORAGE_DIR", "static/uploads")
    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))

    # Voice / Audio Configuration
    TTS_ENGINE: str = os.getenv("TTS_ENGINE", "web_speech_api")  # 'web_speech_api' or 'gtts'
    STT_ENGINE: str = os.getenv("STT_ENGINE", "web_speech_api")  # 'web_speech_api' or 'whisper'
    DEFAULT_LANGUAGE: str = os.getenv("DEFAULT_LANGUAGE", "mr")

    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./agrisense_dev.db"  # Defaults to sqlite for local dev fallback, overrides to postgresql in prod
    )

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
