"""
Conversation Context Manager for Phase 3 Chatbot
Manages multi-turn conversation state and message history
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from collections import deque


class ConversationMessage:
    """Represents a single message in the conversation"""

    def __init__(
        self,
        role: str,  # "User" or "Chatbot"
        content: str,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Initialize a conversation message

        Args:
            role: Message role ("User" or "Chatbot")
            content: Message content
            timestamp: Message timestamp (defaults to now)
            metadata: Optional metadata (intent, tool calls, etc.)
        """
        self.role = role
        self.content = content
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Cohere API

        Returns:
            Dictionary with role and message
        """
        return {
            "role": self.role,
            "message": self.content,
        }

    def to_frontend_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for frontend

        Returns:
            Dictionary with message data for UI
        """
        return {
            "role": self.role.lower(),
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            **self.metadata,
        }


class ContextManager:
    """Manages conversation context across multiple turns"""

    def __init__(self, max_history: int = 10, session_id: Optional[str] = None):
        """Initialize context manager

        Args:
            max_history: Maximum number of messages to keep in history
            session_id: Optional session identifier
        """
        self.max_history = max_history
        self.session_id = session_id
        self.messages: deque[ConversationMessage] = deque(maxlen=max_history)
        self.context: Dict[str, Any] = {}  # Shared context across turns

    def add_message(
        self,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Add a message to the conversation history

        Args:
            role: Message role ("User" or "Chatbot")
            content: Message content
            metadata: Optional metadata
        """
        message = ConversationMessage(role=role, content=content, metadata=metadata)
        self.messages.append(message)

    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get conversation history formatted for Cohere API

        Returns:
            List of message dictionaries with role and message
        """
        return [msg.to_dict() for msg in self.messages]

    def get_messages_for_frontend(self) -> List[Dict[str, Any]]:
        """Get all messages formatted for frontend display

        Returns:
            List of message dictionaries with full details
        """
        return [msg.to_frontend_dict() for msg in self.messages]

    def get_last_n_messages(self, n: int) -> List[ConversationMessage]:
        """Get the last n messages from history

        Args:
            n: Number of messages to retrieve

        Returns:
            List of last n messages
        """
        message_list = list(self.messages)
        return message_list[-n:] if n < len(message_list) else message_list

    def set_context(self, key: str, value: Any) -> None:
        """Set a context variable

        Args:
            key: Context key
            value: Context value
        """
        self.context[key] = value

    def get_context(self, key: str, default: Any = None) -> Any:
        """Get a context variable

        Args:
            key: Context key
            default: Default value if key not found

        Returns:
            Context value or default
        """
        return self.context.get(key, default)

    def clear_context(self) -> None:
        """Clear all context variables"""
        self.context.clear()

    def clear_history(self) -> None:
        """Clear conversation history"""
        self.messages.clear()

    def reset(self) -> None:
        """Reset entire conversation (history + context)"""
        self.clear_history()
        self.clear_context()

    def get_stats(self) -> Dict[str, Any]:
        """Get conversation statistics

        Returns:
            Dictionary with stats
        """
        return {
            "session_id": self.session_id,
            "message_count": len(self.messages),
            "max_history": self.max_history,
            "context_keys": list(self.context.keys()),
        }


class ConversationManager:
    """Manages multiple conversation sessions"""

    def __init__(self, max_history: int = 10):
        """Initialize conversation manager

        Args:
            max_history: Default max history for new sessions
        """
        self.max_history = max_history
        self.sessions: Dict[str, ContextManager] = {}

    def get_or_create_session(self, session_id: str) -> ContextManager:
        """Get or create a conversation session

        Args:
            session_id: Session identifier

        Returns:
            ContextManager for the session
        """
        if session_id not in self.sessions:
            self.sessions[session_id] = ContextManager(
                max_history=self.max_history,
                session_id=session_id,
            )
        return self.sessions[session_id]

    def get_session(self, session_id: str) -> Optional[ContextManager]:
        """Get an existing session

        Args:
            session_id: Session identifier

        Returns:
            ContextManager or None if not found
        """
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        """Delete a conversation session

        Args:
            session_id: Session identifier

        Returns:
            True if deleted, False if not found
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def get_all_sessions(self) -> List[str]:
        """Get all session IDs

        Returns:
            List of session IDs
        """
        return list(self.sessions.keys())

    def clear_all_sessions(self) -> None:
        """Clear all sessions"""
        self.sessions.clear()


# Global conversation manager instance
_conversation_manager: Optional[ConversationManager] = None


def get_conversation_manager() -> ConversationManager:
    """Get or create global conversation manager

    Returns:
        ConversationManager singleton
    """
    global _conversation_manager
    if _conversation_manager is None:
        _conversation_manager = ConversationManager(max_history=10)
    return _conversation_manager
