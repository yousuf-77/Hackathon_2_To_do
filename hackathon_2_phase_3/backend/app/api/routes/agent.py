"""
Agent Chat API for Phase 3 Todo Chatbot
SSE streaming endpoint for conversational Todo management
"""
import json
import logging
from typing import AsyncIterator
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.agents.todo_agent import get_todo_agent
from app.middleware.jwt_auth import get_current_user
from app.mcp.server import set_request_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"])


class ChatRequest(BaseModel):
    """Request model for chat endpoint"""

    message: str = Field(..., description="User message", min_length=1, max_length=2000)
    conversation_id: str | None = Field(None, description="Optional conversation ID")


async def stream_chat_response(
    user_message: str,
    user_id: int,
    conversation_id: str | None = None,
) -> AsyncIterator[dict]:
    """Stream chat response chunks

    Args:
        user_message: User's message
        user_id: Authenticated user ID
        conversation_id: Optional conversation ID

    Yields:
        SSE event data dictionaries
    """
    try:
        # Get TodoAgent orchestrator
        agent = get_todo_agent()

        # Process message and stream response
        async for chunk in agent.process_message(
            user_message=user_message,
            conversation_id=conversation_id,
        ):
            # Convert chunk to NDJSON format
            yield chunk

    except Exception as e:
        logger.error(f"Error streaming chat response: {str(e)}")
        yield {
            "type": "error",
            "content": f"An error occurred: {str(e)}",
        }
        yield {"type": "done"}


@router.post("/chat")
async def chat(
    chat_request: ChatRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """Chat endpoint with SSE streaming

    Args:
        chat_request: Chat request with user message
        request: FastAPI Request object for headers
        current_user: Authenticated user from JWT

    Returns:
        SSE streaming response

    Raises:
        HTTPException: If authentication fails or error occurs
    """
    try:
        # Extract user_id from JWT
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
            )

        # Extract raw JWT token from request headers for MCP context
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else None

        # Set MCP context for this request
        if token:
            try:
                set_request_token(token)
            except Exception as e:
                logger.warning(f"Failed to set MCP context: {str(e)}")

        logger.info(f"Processing chat message from user {user_id}: {chat_request.message[:50]}...")

        # Stream response
        async def event_stream():
            async for chunk in stream_chat_response(
                user_message=chat_request.message,
                user_id=str(user_id),
                conversation_id=chat_request.conversation_id,
            ):
                # Format as SSE event
                yield {
                    "event": "message",
                    "data": json.dumps(chunk),
                }

        return EventSourceResponse(
            event_stream(),
            media_type="text/event-stream",
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.post("/chat/clear")
async def clear_chat_history(
    current_user: dict = Depends(get_current_user),
):
    """Clear conversation history for current user

    Args:
        current_user: Authenticated user from JWT

    Returns:
        Success message
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
            )

        # Get agent and clear history
        agent = get_todo_agent()
        agent.clear_conversation_history()

        logger.info(f"Cleared chat history for user {user_id}")

        return {
            "success": True,
            "message": "Conversation history cleared",
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}",
        )


@router.get("/messages")
async def get_conversation_messages(
    conversation_id: str = "default",
    current_user: dict = Depends(get_current_user),
):
    """Get conversation message history for frontend display

    Args:
        conversation_id: Conversation/session identifier
        current_user: Authenticated user from JWT

    Returns:
        List of conversation messages

    Raises:
        HTTPException: If authentication fails
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
            )

        # Get agent and retrieve messages
        agent = get_todo_agent()

        # Update agent's conversation_id if different
        if agent.conversation_id != conversation_id:
            from app.services.context_manager import get_conversation_manager
            conv_manager = get_conversation_manager()
            agent.context = conv_manager.get_or_create_session(conversation_id)
            agent.conversation_id = conversation_id

        messages = agent.get_messages_for_frontend()

        logger.info(f"Retrieved {len(messages)} messages for conversation {conversation_id}")

        return {
            "conversation_id": conversation_id,
            "messages": messages,
            "count": len(messages),
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error getting conversation messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve messages: {str(e)}",
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for agent service

    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "todo-agent",
        "version": "1.0.0",
    }
