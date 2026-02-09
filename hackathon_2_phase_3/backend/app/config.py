"""
Backend Configuration for Phase 3 AI Chatbot
Loads environment variables and initializes Cohere client
"""
import os
from typing import Optional
from dotenv import load_dotenv
import cohere

# Load environment variables
load_dotenv()


class Config:
    """Application configuration"""

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # JWT Authentication
    BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_DAYS: int = int(os.getenv("JWT_EXPIRATION_DAYS", "7"))

    # Cohere API (Phase 3)
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "")

    # Frontend (CORS)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # MCP Configuration
    MCP_SERVER_NAME: str = "todo-mcp-server"
    MCP_SERVER_VERSION: str = "1.0.0"


class CohereClient:
    """Cohere API client for LLM orchestration"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize Cohere client

        Args:
            api_key: Cohere API key (defaults to COHERE_API_KEY env var)
        """
        self.api_key = api_key or Config.COHERE_API_KEY
        if not self.api_key:
            raise ValueError("COHERE_API_KEY environment variable is required")

        self.client = cohere.Client(self.api_key)

    def chat(
        self,
        message: str,
        conversation_history: Optional[list] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
    ) -> str:
        """Send chat message to Cohere

        Args:
            message: User message
            conversation_history: Previous conversation context
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens in response

        Returns:
            Assistant response text
        """
        try:
            response = self.client.chat(
                message=message,
                chat_history=conversation_history or [],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return response.text
        except Exception as e:
            raise Exception(f"Cohere API error: {str(e)}")


# Global config instance
config = Config()

# Global Cohere client (lazy initialization)
_cohere_client: Optional[CohereClient] = None


def get_cohere_client() -> CohereClient:
    """Get or create global Cohere client"""
    global _cohere_client
    if _cohere_client is None:
        _cohere_client = CohereClient()
    return _cohere_client
