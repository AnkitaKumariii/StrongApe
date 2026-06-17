import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DEFAULT_SQLITE_PATH = os.path.join(_BACKEND_DIR, "strongape.db").replace("\\", "/")
_DEFAULT_DATABASE_URL = f"sqlite+aiosqlite:///{_DEFAULT_SQLITE_PATH}"

class Settings(BaseSettings):
    APP_NAME: str = "StrongApe API"
    DEBUG: bool = True
    
    # Security Config
    JWT_SECRET_KEY: str = Field(default="super_secret_development_key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # DB URL — SQLite by default for local dev; use PostgreSQL in production via .env
    DATABASE_URL: str = Field(default=_DEFAULT_DATABASE_URL)

    # Google Gemini (Food Scanner & Workout Routines)
    GEMINI_API_KEY: str = Field(default="")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")
    GEMINI_FALLBACK_MODELS: str = Field(
        default="gemini-2.5-flash-lite,gemini-1.5-flash"
    )

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
