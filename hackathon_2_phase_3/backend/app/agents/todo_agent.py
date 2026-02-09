"""
Todo Agent Orchestrator for Phase 3 Chatbot
Coordinates NLP parsing, MCP tool calls, and Cohere response generation
"""
import json
import asyncio
from typing import Dict, List, Any, Optional, AsyncIterator
from app.services.nlp_parser import IntentParser, Intent
from app.services.cohere_service import CohereService, CohereAPIError
from app.services.context_manager import ContextManager, get_conversation_manager
from app.mcp.server import get_request_context
from app.mcp.tools.task_tools import (
    add_task,
    list_tasks,
    get_task,
    update_task,
    delete_task,
    complete_task,
)


class TodoAgentOrchestrator:
    """Orchestrates Todo operations using NLP parsing and MCP tools"""

    def __init__(
        self,
        nlp_parser: Optional[IntentParser] = None,
        cohere_service: Optional[CohereService] = None,
        conversation_id: Optional[str] = None,
    ):
        """Initialize TodoAgent orchestrator

        Args:
            nlp_parser: Intent parser instance (defaults to global)
            cohere_service: Cohere service instance (defaults to global)
            conversation_id: Optional conversation/session ID for context
        """
        from app.services.nlp_parser import get_intent_parser
        from app.services.cohere_service import get_cohere_service

        self.nlp_parser = nlp_parser or get_intent_parser()
        self.cohere_service = cohere_service or get_cohere_service()

        # Initialize or get conversation context
        self.conversation_id = conversation_id or "default"
        conv_manager = get_conversation_manager()
        self.context = conv_manager.get_or_create_session(self.conversation_id)

        # Legacy support - maintain conversation_history list
        self.conversation_history: List[Dict[str, str]] = []
        self.max_history = 10

    async def process_message(
        self,
        user_message: str,
        conversation_id: Optional[str] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Process user message and yield streaming response chunks

        Args:
            user_message: User's natural language input
            conversation_id: Optional conversation ID for context

        Yields:
            Streaming chunks with type ('content', 'tool_call', 'error', 'done')
        """
        try:
            # Step 1: Parse user input
            yield {
                "type": "content",
                "content": f"\n🔍 Understanding: '{user_message}'...\n",
            }

            parse_result = self.nlp_parser.parse(user_message)
            intent = parse_result["intent"]
            entities = parse_result["entities"]
            confidence = parse_result["confidence"]

            # Step 2: Log intent detection
            yield {
                "type": "content",
                "content": f"✓ Intent detected: {intent} (confidence: {confidence:.0%})\n",
            }

            # Step 3: Handle unknown intent
            if intent == Intent.UNKNOWN.value:
                response = await self._handle_unknown_intent(user_message)
                yield {"type": "content", "content": response}
                yield {"type": "done"}
                return

            # Step 4: Execute intent
            tool_result = await self._execute_intent(intent, entities)

            # Step 5: Generate natural language response
            yield {
                "type": "content",
                "content": "\n🤖 Generating response...\n",
            }

            # Get formatted history from context manager
            formatted_history = self.context.get_conversation_history()

            response = await self.cohere_service.generate_tool_call_response(
                user_message=user_message,
                tool_name=intent,
                tool_result=tool_result,
                conversation_history=formatted_history,
            )

            # Step 6: Stream response
            yield {"type": "content", "content": f"\n{response}\n"}

            # Step 7: Update conversation history (both legacy and context manager)
            self._update_conversation_history(user_message, response)

            # Also add to context manager with metadata
            self.context.add_message(
                role="User",
                content=user_message,
                metadata={"intent": intent, "entities": entities},
            )
            self.context.add_message(
                role="Chatbot",
                content=response,
                metadata={"tool_result": tool_result},
            )

            yield {"type": "done"}

        except Exception as e:
            error_message = f"Error processing message: {str(e)}"
            yield {"type": "error", "content": error_message}
            yield {"type": "done"}

    async def _execute_intent(
        self, intent: str, entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute intent by calling appropriate MCP tool

        Args:
            intent: Detected intent
            entities: Extracted entities

        Returns:
            Tool execution result
        """
        try:
            if intent == Intent.ADD_TASK.value:
                return await self._handle_add_task(entities)

            elif intent == Intent.LIST_TASKS.value:
                return await self._handle_list_tasks(entities)

            elif intent == Intent.UPDATE_TASK.value:
                return await self._handle_update_task(entities)

            elif intent == Intent.DELETE_TASK.value:
                return await self._handle_delete_task(entities)

            elif intent == Intent.COMPLETE_TASK.value:
                return await self._handle_complete_task(entities)

            else:
                return {"error": f"Unknown intent: {intent}"}

        except Exception as e:
            return {"error": str(e)}

    async def _handle_add_task(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Handle add_task intent

        Args:
            entities: Extracted entities (title, description, priority, due_date)

        Returns:
            MCP tool result
        """
        title = entities.get("title")
        if not title:
            return {"error": "Could not extract task title from your message"}

        description = entities.get("description")
        priority = entities.get("priority", "medium")

        # Call MCP tool's underlying function
        result = await add_task.fn(
            title=title,
            description=description,
            priority=priority,
        )

        return result

    async def _handle_list_tasks(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Handle list_tasks intent

        Args:
            entities: Extracted entities (status, priority, limit)

        Returns:
            MCP tool result
        """
        status = entities.get("status")
        priority = entities.get("priority")
        limit = entities.get("limit", 50)

        # Call MCP tool's underlying function
        result = await list_tasks.fn(
            status=status,
            priority=priority,
            limit=limit,
        )

        return result

    async def _handle_update_task(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Handle update_task intent

        Args:
            entities: Extracted entities (task_id, title, description, priority, completed)

        Returns:
            MCP tool result
        """
        task_reference = entities.get("task_reference")
        if not task_reference:
            return {"error": "Could not identify which task to update"}

        # For now, use task_reference as task_id (will need resolution logic)
        task_id = task_reference

        # Extract update fields
        updates = {}
        if entities.get("title"):
            updates["title"] = entities["title"]
        if entities.get("description"):
            updates["description"] = entities["description"]
        if entities.get("priority"):
            updates["priority"] = entities["priority"]
        if entities.get("due_date"):
            updates["due_date"] = entities["due_date"]

        # Call MCP tool's underlying function
        result = await update_task.fn(
            task_id=task_id,
            **updates,
        )

        return result

    async def _handle_delete_task(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Handle delete_task intent

        Args:
            entities: Extracted entities (task_id)

        Returns:
            MCP tool result
        """
        task_reference = entities.get("task_reference")
        if not task_reference:
            return {"error": "Could not identify which task to delete"}

        task_id = task_reference

        # Call MCP tool's underlying function
        result = await delete_task.fn(task_id=task_id)

        return result

    async def _handle_complete_task(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Handle complete_task intent

        Args:
            entities: Extracted entities (task_id)

        Returns:
            MCP tool result
        """
        task_reference = entities.get("task_reference")
        if not task_reference:
            return {"error": "Could not identify which task to complete"}

        task_id = task_reference

        # Call MCP tool's underlying function
        result = await complete_task.fn(task_id=task_id)

        return result

    async def _handle_unknown_intent(self, user_message: str) -> str:
        """Handle unknown intent with Cohere clarification

        Args:
            user_message: Original user message

        Returns:
            Clarification response
        """
        try:
            clarification_prompt = f"""The user said: "{user_message}"

I couldn't understand what they want to do with their Todo list. Please ask for clarification in a friendly way.

Available actions I can help with:
- Add new tasks
- List/show tasks
- Update existing tasks
- Delete tasks
- Mark tasks as complete

Ask what they'd like to do."""

            response = await self.cohere_service.chat_with_retry(
                message=clarification_prompt,
                conversation_history=[],
                temperature=0.7,
            )

            return response

        except CohereAPIError:
            return "I'm not sure what you'd like to do. Could you please rephrase that? I can help you add, list, update, delete, or complete tasks."

    def _update_conversation_history(self, user_message: str, assistant_response: str):
        """Update conversation history with new messages

        Args:
            user_message: User's message
            assistant_response: Assistant's response
        """
        self.conversation_history.append({
            "role": "User",
            "message": user_message,
        })

        self.conversation_history.append({
            "role": "Chatbot",
            "message": assistant_response,
        })

        # Trim to max history
        if len(self.conversation_history) > self.max_history * 2:
            self.conversation_history = self.conversation_history[-self.max_history * 2 :]

    def clear_conversation_history(self):
        """Clear conversation history (both legacy and context manager)"""
        self.conversation_history = []
        self.context.clear_history()

    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get current conversation history

        Returns:
            List of conversation messages
        """
        return self.conversation_history.copy()

    def get_messages_for_frontend(self) -> List[Dict[str, Any]]:
        """Get all messages formatted for frontend display

        Returns:
            List of message dictionaries with full details
        """
        return self.context.get_messages_for_frontend()

    def set_context(self, key: str, value: Any) -> None:
        """Set a context variable

        Args:
            key: Context key
            value: Context value
        """
        self.context.set_context(key, value)

    def get_context(self, key: str, default: Any = None) -> Any:
        """Get a context variable

        Args:
            key: Context key
            default: Default value if key not found

        Returns:
            Context value or default
        """
        return self.context.get_context(key, default)


# Global agent instance
_agent: Optional[TodoAgentOrchestrator] = None


def get_todo_agent() -> TodoAgentOrchestrator:
    """Get or create global TodoAgent orchestrator

    Returns:
        TodoAgentOrchestrator instance
    """
    global _agent
    if _agent is None:
        _agent = TodoAgentOrchestrator()
    return _agent
