"""
Cohere Service for Phase 3 AI Chatbot
Provides LLM chat, tool calling, and retry logic with exponential backoff
"""
import asyncio
import time
from typing import Optional, List, Dict, Any
from app.config import CohereClient, config


class CohereAPIError(Exception):
    """Cohere API error with retry info"""

    def __init__(self, message: str, retryable: bool = False, status_code: Optional[int] = None):
        self.message = message
        self.retryable = retryable
        self.status_code = status_code
        super().__init__(self.message)


class CohereService:
    """High-level Cohere service with retry logic and error handling"""

    def __init__(self, client: Optional[CohereClient] = None):
        """Initialize Cohere service

        Args:
            client: CohereClient instance (defaults to global client)
        """
        self.client = client or CohereClient()
        self.max_retries = 3
        self.base_delay = 1.0  # seconds
        self.max_delay = 10.0  # seconds

    async def chat_with_retry(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
    ) -> str:
        """Send chat message with automatic retry on rate limits

        Args:
            message: User message
            conversation_history: Previous conversation context
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens in response

        Returns:
            Assistant response text

        Raises:
            CohereAPIError: If all retries are exhausted
        """
        last_error = None

        for attempt in range(self.max_retries):
            try:
                # Run synchronous Cohere client in thread pool
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.chat(
                        message=message,
                        conversation_history=conversation_history or [],
                        temperature=temperature,
                        max_tokens=max_tokens,
                    ),
                )
                return response

            except Exception as e:
                last_error = e
                error_str = str(e).lower()

                # Check if error is retryable (rate limit, timeout, server error)
                is_retryable = any(
                    term in error_str
                    for term in ["rate limit", "timeout", "server error", "503", "502", "429"]
                )

                if not is_retryable:
                    raise CohereAPIError(
                        f"Cohere API error: {str(e)}",
                        retryable=False,
                    )

                if attempt < self.max_retries - 1:
                    # Calculate delay with exponential backoff
                    delay = min(
                        self.base_delay * (2**attempt) + (time.time() % 1),
                        self.max_delay,
                    )
                    print(f"Rate limited, retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)
                else:
                    raise CohereAPIError(
                        f"Cohere API error after {self.max_retries} retries: {str(e)}",
                        retryable=True,
                    )

        # Should not reach here, but just in case
        raise CohereAPIError(
            f"Failed to get response from Cohere: {last_error}",
            retryable=True,
        )

    async def generate_tool_call_response(
        self,
        user_message: str,
        tool_name: str,
        tool_result: Any,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Generate natural language response from tool result

        Args:
            user_message: Original user message
            tool_name: Name of tool that was called
            tool_result: Result from tool execution
            conversation_history: Previous conversation context

        Returns:
            Natural language response
        """
        response_prompt = f"""User: {user_message}

Tool called: {tool_name}
Tool result: {tool_result}

Provide a helpful, concise response to the user based on the tool result."""

        return await self.chat_with_retry(
            message=response_prompt,
            conversation_history=conversation_history,
            temperature=0.5,  # Lower temperature for more consistent responses
            max_tokens=300,
        )

    async def generate_error_response(
        self,
        error_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Generate user-friendly error message

        Args:
            error_message: Technical error message
            conversation_history: Previous conversation context

        Returns:
            User-friendly error response
        """
        error_prompt = f"""An error occurred: {error_message}

Explain this error to the user in a friendly, helpful way and suggest what they can do to fix it."""

        return await self.chat_with_retry(
            message=error_prompt,
            conversation_history=conversation_history,
            temperature=0.5,
            max_tokens=200,
        )

    def format_conversation_history(
        self,
        messages: List[Dict[str, Any]],
        max_history: int = 10,
    ) -> List[Dict[str, str]]:
        """Format conversation history for Cohere API

        Args:
            messages: List of chat messages with role and message
            max_history: Maximum number of messages to include

        Returns:
            Formatted conversation history
        """
        # Take last N messages
        recent_messages = messages[-max_history:] if len(messages) > max_history else messages

        # Format for Cohere (expects capitalized 'User' and 'Chatbot' roles)
        formatted = []
        for msg in recent_messages:
            role = msg.get("role", "User")
            # Support both 'message' and 'content' keys
            content = msg.get("message") or msg.get("content", "")

            # Ensure roles are capitalized for Cohere API
            if role.lower() in ["assistant", "chatbot"]:
                role = "Chatbot"
            elif role.lower() == "user":
                role = "User"
            elif role.lower() == "system":
                role = "System"
            elif role.lower() == "tool":
                role = "Tool"
            else:
                # Skip unknown roles
                continue

            formatted.append({
                "role": role,
                "message": content,
            })

        return formatted


# Global service instance
_cohere_service: Optional[CohereService] = None


def get_cohere_service() -> CohereService:
    """Get or create global Cohere service"""
    global _cohere_service
    if _cohere_service is None:
        _cohere_service = CohereService()
    return _cohere_service
