"""Application configuration loaded from environment variables."""
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from functools import lru_cache

# Load environment variables before creating Settings
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # JWT / Authentication
    better_auth_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7

    # Frontend (CORS)
    frontend_url: str = "http://localhost:3000"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Environment
    environment: str = "development"

    # Phase 3: AI Chatbot
    cohere_api_key: str  # Cohere API key for LLM

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()


settings = get_settings()
