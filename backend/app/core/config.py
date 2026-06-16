import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "StrongApe API"
    DEBUG: bool = True
    
    # Security Config
    JWT_SECRET_KEY: str = Field(default="super_secret_development_key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # DB URL
    # Replace postgresql:// with postgresql+asyncpg:// if needed
    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/strongape")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
