"""
Response Generator for Phase 3 Chatbot
Provides concise, friendly responses with emojis
"""
import random
from typing import Optional

class ResponseGenerator:
    """Generates concise, friendly responses with emojis"""

    # Response templates for each operation type
    RESPONSE_TEMPLATES = {
        "add_task": [
            "Task added! 🎯",
            "Got it! 🔥",
            "New task created! ⚡",
            "Task saved! ✅",
        ],
        "update_task": [
            "Task updated! ⚡",
            "Changes saved! 🔄",
            "Task modified! 🔧",
        ],
        "complete_task": [
            "Task completed! 🎯",
            "Great job! 🏆",
            "Well done! 💪",
            "Nice work! ⭐",
        ],
        "delete_task": [
            "Task deleted! 🌧",
            "Task removed! 🗑️",
            "Done! ⚡",
        ],
        "list_tasks": [
            "Here are your tasks... 📋",
            "Loading tasks... 🤖",
        ],
        "error": {
            "missing_title": "I need a task title. 🎯",
            "task_not_found": "Task not found. 🔍",
            "multiple_matches": "Multiple tasks found. Which one? 🔍",
            "invalid_date": "Invalid date format. 📅",
            "unauthorized": "Access denied. 🔒",
            "rate_limit": "Too many requests. ⏳",
            "general": "Something went wrong. ⚠️",
        },
        "confirmation": {
            "delete": "Delete this task? 🗑️",
            "high_priority": "Set as HIGH priority? 🔥",
        },
    }

    def __init__(self):
        """Initialize response generator"""
        pass

    def get_response(self, operation: str, context: Optional[dict] = None) -> str:
        """Get a contextual response for given operation

        Args:
            operation: Type of operation (add_task, update_task, etc.)
            context: Optional context for generating specific responses

        Returns:
            Concise response text with emojis
        """
        # Handle error responses with context
        if operation == "error":
            error_type = context.get("error_type") if context else None
            if error_type:
                return self.RESPONSE_TEMPLATES["error"].get(
                    error_type,
                    self.RESPONSE_TEMPLATES["error"]["general"]
                )
            return self.RESPONSE_TEMPLATES["error"]["general"]

        # Handle confirmation prompts
        if operation == "confirmation":
            action = context.get("action") if context else None
            if action and action in self.RESPONSE_TEMPLATES["confirmation"]:
                return self.RESPONSE_TEMPLATES["confirmation"][action]
            return "Confirm action? ❓"

        # Handle standard operations with random selection
        if operation in self.RESPONSE_TEMPLATES:
            responses = self.RESPONSE_TEMPLATES[operation]
            if isinstance(responses, list):
                return random.choice(responses)
            return responses

        # Fallback for unknown operations
        return f"Operation '{operation}' complete! Stay focused! ⚡"

    def get_tool_call_response(
        self,
        tool_name: str,
        tool_result: dict
    ) -> str:
        """Generate response based on tool execution result

        Args:
            tool_name: Name of tool that was called
            tool_result: Result from tool execution

        Returns:
            Concise contextual response with personality
        """
        # Check if tool execution failed
        if not tool_result.get("success"):
            error_msg = tool_result.get("error", "Unknown error")
            return self.get_response("error", {"error_type": "general"})
        # Map tool names to response types
        tool_to_operation = {
            "add_task": "add_task",
            "update_task": "update_task",
            "complete_task": "complete_task",
            "delete_task": "delete_task",
            "list_tasks": "list_tasks",
        }
        operation = tool_to_operation.get(tool_name, "add_task")
        return self.get_response(operation)

    def get_error_response(
        self,
        error_type: str,
        details: Optional[str] = None
    ) -> str:
        """Generate user-friendly error message

        Args:
            error_type: Type of error (missing_title, task_not_found, etc.)
            details: Optional additional error details

        Returns:
            User-friendly error message with emoji
        """
        response = self.get_response("error", {"error_type": error_type})
        if details:
            return f"{response}\nDetails: {details}"
        return response

    def get_confirmation_prompt(self, action: str) -> str:
        """Generate confirmation prompt for destructive operations

        Args:
            action: Type of action (delete, high_priority)

        Returns:
            Confirmation prompt with options
        """
        return self.get_response("confirmation", {"action": action})

# Global response generator instance
_response_generator: Optional[ResponseGenerator] = None

def get_response_generator() -> ResponseGenerator:
    """Get or create global response generator"""
    global _response_generator
    if _response_generator is None:
        _response_generator = ResponseGenerator()
    return _response_generator
