---
name: agents-sdk-integration
description: |
  This skill guides Claude Code to set up OpenAI Agents SDK in FastAPI backends for Phase 3 chatbot logic. Creates agents that parse natural language, extract intents, and call MCP tools for Todo CRUD operations with robust error handling, JWT verification, and user isolation. References OpenAI Agents SDK docs (function_tool, agent loop) and FastAPI patterns. This skill activates automatically when users mention Agents SDK setup, agent workflows, NLP parsing for Todo commands, tool calling with MCP, Phase 3 chatbot logic, natural language intent extraction, or OpenAI agent integration.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
related_skills:
  - fastapi-jwt-middleware-neon
  - mcp-tool-engineer
  - nlp-intent-parser
  - chatbot-integrator
  - nextjs-api-client-with-jwt
---

# Agents SDK Integration Skill

## Overview

This skill provides comprehensive guidance for integrating OpenAI Agents SDK into FastAPI backends to build intelligent chatbot agents that understand natural language commands and perform Todo CRUD operations through MCP tools. It covers agent configuration, function tool definition, JWT-secured endpoints, error handling, and production deployment patterns.

## When to Use This Skill

- Setting up OpenAI Agents SDK in FastAPI backends
- Creating agents that parse natural language Todo commands
- Implementing tool calling with MCP for Todo operations
- Building Phase 3 chatbot logic with intent extraction
- Securing agent endpoints with JWT verification
- Implementing retry logic and error handling for agents
- Creating function_tool decorators for Todo CRUD
- Integrating agents with existing FastAPI middleware

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing FastAPI structure, JWT middleware patterns, Todo routes/models, MCP tool definitions |
| **Conversation** | User's agent requirements, NLP capabilities needed, error handling preferences, authentication setup |
| **Skill References** | OpenAI Agents SDK docs, function_tool patterns, agent loop best practices, FastAPI dependency injection |
| **User Guidelines** | Project-specific security requirements, performance needs, deployment environment |

Ensure all required context is gathered before implementing.

## Quick Start: Installation and Setup

### 1. Install OpenAI Agents SDK

```bash
# Install OpenAI Python SDK with Agents support
pip install openai[agents]

# Or with uv/pip
uv add "openai[agents]"

# Verify installation
python -c "import openai; print(openai.__version__)"
```

### 2. Environment Configuration

```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o for production
AGENT_MAX_ITERATIONS=10
AGENT_TIMEOUT_SECONDS=30
```

### 3. Project Structure

```
backend/
├── app/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── todo_agent.py       # Agent definition and tools
│   │   ├── tools.py            # MCP tool wrappers
│   │   └── schemas.py          # Agent request/response schemas
│   ├── api/
│   │   └── routes/
│   │       └── agents.py       # Agent endpoints
│   └── core/
│       └── config.py           # Existing config (add agent settings)
```

## Agent Configuration

### Core Agent Setup with Function Tools

```python
# backend/app/agents/todo_agent.py
"""
OpenAI Agents SDK integration for Todo management.
Handles natural language parsing and tool calling for Todo CRUD.
"""
from openai import OpenAI
from openai.types.chat import ChatCompletionMessage
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.agents.tools import (
    create_task_tool,
    list_tasks_tool,
    update_task_tool,
    delete_task_tool,
    toggle_task_tool,
)
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)


def create_todo_agent(user_id: str) -> Any:
    """
    Create an OpenAI agent configured for Todo management.

    Args:
        user_id: User ID for scoping operations

    Returns:
        Configured agent instance
    """
    # Import function tools (scoped to user)
    tools = [
        create_task_tool(user_id),
        list_tasks_tool(user_id),
        update_task_tool(user_id),
        delete_task_tool(user_id),
        toggle_task_tool(user_id),
    ]

    # System prompt for intent extraction and tool usage
    system_prompt = """You are a helpful Todo assistant. You can help users manage their tasks.

Available operations:
- Create tasks: "add task [title]" or "create task [title] with priority [high/medium/low]"
- List tasks: "show my tasks", "list all tasks", "what are my tasks?"
- Update tasks: "update task [id] to [new title]", "change task [id] priority to [high/medium/low]"
- Delete tasks: "delete task [id]", "remove task [id]"
- Toggle completion: "mark task [id] as complete", "complete task [id]"

Guidelines:
- Extract task IDs from user input when mentioned
- Use appropriate tools based on user intent
- Ask for clarification if intent is unclear
- Provide friendly, concise responses
- Always confirm actions that modify data

Priority levels: low, medium, high (default: medium)"""

    # Create agent with tools and system prompt
    # Note: Using the OpenAI Agents SDK pattern
    agent = {
        "model": settings.openai_model,
        "tools": tools,
        "system_message": {"role": "system", "content": system_prompt},
        "max_iterations": settings.agent_max_iterations,
        "timeout": settings.agent_timeout_seconds,
    }

    return agent


async def run_agent_conversation(
    user_id: str,
    user_message: str,
    conversation_history: Optional[List[ChatCompletionMessage]] = None,
) -> Dict[str, Any]:
    """
    Run agent conversation with tool calling.

    Args:
        user_id: User ID for scoping
        user_message: User's natural language input
        conversation_history: Optional conversation history

    Returns:
        Agent response with tool calls and results
    """
    agent = create_todo_agent(user_id)

    messages: List[ChatCompletionMessage] = conversation_history or []
    messages.append({"role": "user", "content": user_message})

    tool_results = []
    final_response = None
    iterations = 0
    max_iterations = agent["max_iterations"]

    try:
        while iterations < max_iterations:
            iterations += 1

            # Call OpenAI with tools
            response = client.chat.completions.create(
                model=agent["model"],
                messages=[
                    agent["system_message"],
                    *messages,
                ],
                tools=agent["tools"],
                tool_choice="auto",  # Let model decide which tool to use
            )

            response_message = response.choices[0].message
            messages.append(response_message)

            # Check if agent wants to call tools
            tool_calls = response_message.tool_calls

            if not tool_calls:
                # No more tool calls, return final response
                final_response = response_message.content
                break

            # Execute tool calls
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                logger.info(f"Tool call: {function_name} with args: {function_args}")

                # Execute function (tools are async-safe)
                try:
                    # Import tool execution function
                    from app.agents.tools import execute_tool_call

                    result = await execute_tool_call(
                        function_name=function_name,
                        arguments=function_args,
                        user_id=user_id,
                    )

                    tool_results.append({
                        "tool": function_name,
                        "args": function_args,
                        "result": result,
                        "status": "success",
                    })

                    # Append tool result to messages
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "content": json.dumps(result),
                    })

                except Exception as e:
                    error_msg = f"Error executing {function_name}: {str(e)}"
                    logger.error(error_msg)

                    tool_results.append({
                        "tool": function_name,
                        "args": function_args,
                        "result": {"error": error_msg},
                        "status": "error",
                    })

                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "content": json.dumps({"error": error_msg}),
                    })

        return {
            "response": final_response or "Agent completed without response",
            "tool_calls": tool_results,
            "iterations": iterations,
            "conversation_history": messages,
        }

    except Exception as e:
        logger.error(f"Agent execution error: {e}")
        raise
```

## MCP Tool Integration

### Function Tool Definitions

```python
# backend/app/agents/tools.py
"""
MCP tool wrappers for Todo CRUD operations.
All tools are scoped to user_id for security.
"""
import json
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from sqlmodel import select
from uuid import uuid4
from datetime import datetime
import logging

logger = logging.getLogger(____)


def create_task_tool(user_id: str) -> Dict[str, Any]:
    """
    Create a task (function tool for OpenAI agent).

    Args:
        user_id: User ID for scoping

    Returns:
        Function tool definition
    """
    return {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new task with a title, optional description, and priority",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Task title (1-200 characters)",
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description (max 1000 characters)",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Task priority level (default: medium)",
                    },
                },
                "required": ["title"],
            },
        },
    }


def list_tasks_tool(user_id: str) -> Dict[str, Any]:
    """List tasks tool definition."""
    return {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List all tasks for the user, optionally filtered by status",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed", "all"],
                        "description": "Filter by status (default: all)",
                    },
                },
            },
        },
    }


def update_task_tool(user_id: str) -> Dict[str, Any]:
    """Update task tool definition."""
    return {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update an existing task's title, description, or priority",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID (UUID) to update",
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title",
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "New priority level",
                    },
                },
                "required": ["task_id"],
            },
        },
    }


def delete_task_tool(user_id: str) -> Dict[str, Any]:
    """Delete task tool definition."""
    return {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task permanently",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID (UUID) to delete",
                    },
                },
                "required": ["task_id"],
            },
        },
    }


def toggle_task_tool(user_id: str) -> Dict[str, Any]:
    """Toggle task completion tool definition."""
    return {
        "type": "function",
        "function": {
            "name": "toggle_task",
            "description": "Mark a task as complete or incomplete",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "Task ID (UUID) to toggle",
                    },
                    "completed": {
                        "type": "boolean",
                        "description": "True to mark complete, False to mark incomplete",
                    },
                },
                "required": ["task_id"],
            },
        },
    }


async def execute_tool_call(
    function_name: str,
    arguments: Dict[str, Any],
    user_id: str,
) -> Dict[str, Any]:
    """
    Execute a tool call by routing to the appropriate handler.

    Args:
        function_name: Name of the function to execute
        arguments: Function arguments
        user_id: User ID for scoping

    Returns:
        Tool execution result
    """
    # Get database session
    async for session in get_db():
        try:
            if function_name == "create_task":
                return await _create_task(session, user_id, arguments)

            elif function_name == "list_tasks":
                return await _list_tasks(session, user_id, arguments)

            elif function_name == "update_task":
                return await _update_task(session, user_id, arguments)

            elif function_name == "delete_task":
                return await _delete_task(session, user_id, arguments)

            elif function_name == "toggle_task":
                return await _toggle_task(session, user_id, arguments)

            else:
                return {"error": f"Unknown function: {function_name}"}

        except Exception as e:
            logger.error(f"Tool execution error for {function_name}: {e}")
            return {"error": str(e)}


async def _create_task(
    session: AsyncSession,
    user_id: str,
    args: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute create task operation."""
    title = args["title"]
    description = args.get("description")
    priority = args.get("priority", "medium")

    task = Task(
        id=str(uuid4()),
        user_id=user_id,
        title=title,
        description=description,
        priority=priority,
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {
        "success": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
        },
        "message": f"Created task: {task.title}",
    }


async def _list_tasks(
    session: AsyncSession,
    user_id: str,
    args: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute list tasks operation."""
    status_filter = args.get("status", "all")

    statement = select(Task).where(Task.user_id == user_id)

    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    result = await session.scalars(statement)
    tasks = list(result.all())

    return {
        "success": True,
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "completed": task.completed,
            }
            for task in tasks
        ],
        "count": len(tasks),
        "message": f"Found {len(tasks)} tasks",
    }


async def _update_task(
    session: AsyncSession,
    user_id: str,
    args: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute update task operation."""
    task_id = args["task_id"]

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.scalars(statement)
    task = result.first()

    if not task:
        return {"error": "Task not found"}

    # Update fields
    if "title" in args:
        task.title = args["title"]
    if "description" in args:
        task.description = args["description"]
    if "priority" in args:
        task.priority = args["priority"]

    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return {
        "success": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
        },
        "message": f"Updated task: {task.title}",
    }


async def _delete_task(
    session: AsyncSession,
    user_id: str,
    args: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute delete task operation."""
    task_id = args["task_id"]

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.scalars(statement)
    task = result.first()

    if not task:
        return {"error": "Task not found"}

    await session.delete(task)
    await session.commit()

    return {
        "success": True,
        "message": f"Deleted task: {task.title}",
    }


async def _toggle_task(
    session: AsyncSession,
    user_id: str,
    args: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute toggle task operation."""
    task_id = args["task_id"]
    completed = args.get("completed")

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.scalars(statement)
    task = result.first()

    if not task:
        return {"error": "Task not found"}

    if completed is not None:
        task.completed = completed
    else:
        task.completed = not task.completed

    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    status = "complete" if task.completed else "incomplete"

    return {
        "success": True,
        "task": {
            "id": task.id,
            "title": task.title,
            "completed": task.completed,
        },
        "message": f"Marked task '{task.title}' as {status}",
    }
```

## FastAPI Endpoint Integration

### Agent Endpoint with JWT Security

```python
# backend/app/api/routes/agents.py
"""
FastAPI endpoints for agent interactions.
JWT-secured with user isolation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.api.deps import get_current_user
from app.agents.todo_agent import run_agent_conversation
from app.agents.schemas import (
    AgentRequest,
    AgentResponse,
    ToolCall,
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["agent"])


class ChatRequest(BaseModel):
    """Request schema for agent chat."""
    message: str = Field(..., min_length=1, max_length=2000, description="User's natural language message")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    stream: bool = Field(False, description="Enable streaming responses")


class ChatResponse(BaseModel):
    """Response schema for agent chat."""
    response: str
    tool_calls: List[Dict[str, Any]] = []
    conversation_id: str
    iterations: int


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Chat with the Todo agent using natural language.

    - **message**: Natural language command (e.g., "add task buy groceries")
    - **conversation_id**: Optional conversation ID for context
    - **stream**: Enable streaming responses (default: false)

    The agent will:
    1. Parse natural language intent
    2. Call appropriate MCP tools
    3. Return response with results

    Example commands:
    - "Create a task called Buy groceries with high priority"
    - "Show me all my pending tasks"
    - "Mark task abc123 as complete"
    - "Delete task xyz789"
    """
    try:
        # Run agent conversation
        result = await run_agent_conversation(
            user_id=user_id,
            user_message=request.message,
            conversation_history=None,  # TODO: Implement conversation persistence
        )

        return ChatResponse(
            response=result["response"],
            tool_calls=result["tool_calls"],
            conversation_id=request.conversation_id or user_id,
            iterations=result["iterations"],
        )

    except Exception as e:
        logger.error(f"Agent chat error for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent processing failed: {str(e)}",
        )


@router.post("/parse")
async def parse_intent(
    request: ChatRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Parse natural language intent without executing tools.

    Useful for previewing what the agent would do.
    """
    # TODO: Implement intent-only parsing
    return {
        "intent": "preview",
        "message": request.message,
        "suggested_tools": [],
    }
```

### Agent Schemas

```python
# backend/app/agents/schemas.py
"""
Pydantic schemas for agent requests and responses.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ToolCall(BaseModel):
    """Schema for tool call information."""
    tool: str = Field(..., description="Tool function name")
    args: Dict[str, Any] = Field(default_factory=dict, description="Tool arguments")
    result: Optional[Dict[str, Any]] = Field(None, description="Tool execution result")
    status: str = Field(..., description="Execution status (success/error)")


class AgentRequest(BaseModel):
    """Schema for agent request."""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    stream: bool = False


class AgentResponse(BaseModel):
    """Schema for agent response."""
    response: str
    tool_calls: List[ToolCall] = []
    conversation_id: str
    iterations: int
```

## Error Handling and Retry Logic

### Comprehensive Error Handler

```python
# backend/app/agents/errors.py
"""
Error handling for agent operations.
"""
from typing import Any, Dict, Optional
from openai import OpenAIError, APIError, RateLimitError, APITimeoutError
import logging

logger = logging.getLogger(__name__)


class AgentError(Exception):
    """Base exception for agent errors."""
    pass


class ToolExecutionError(AgentError):
    """Exception raised when tool execution fails."""
    pass


class IntentParsingError(AgentError):
    """Exception raised when intent parsing fails."""
    pass


class AgentRateLimitError(AgentError):
    """Exception raised when rate limit is hit."""
    pass


async def handle_agent_error(error: Exception) -> Dict[str, Any]:
    """
    Convert agent exceptions to user-friendly responses.

    Args:
        error: Exception from agent execution

    Returns:
        Error response dictionary
    """
    if isinstance(error, RateLimitError):
        logger.warning(f"Rate limit exceeded: {error}")
        return {
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again in a moment.",
            "retry_after": 60,  # Suggest retry after 60 seconds
        }

    elif isinstance(error, APITimeoutError):
        logger.error(f"Agent timeout: {error}")
        return {
            "error": "timeout",
            "message": "The agent took too long to respond. Please try again.",
        }

    elif isinstance(error, ToolExecutionError):
        logger.error(f"Tool execution error: {error}")
        return {
            "error": "tool_execution_failed",
            "message": f"Failed to execute operation: {str(error)}",
        }

    elif isinstance(error, IntentParsingError):
        logger.warning(f"Intent parsing error: {error}")
        return {
            "error": "unclear_intent",
            "message": "I couldn't understand that command. Try rephrasing it.",
            "suggestions": [
                "Create a task: 'add task [title]'",
                "List tasks: 'show my tasks'",
                "Update task: 'update task [id]'",
                "Delete task: 'delete task [id]'",
                "Complete task: 'mark task [id] as complete'",
            ],
        }

    else:
        logger.error(f"Unexpected agent error: {error}")
        return {
            "error": "internal_error",
            "message": "Something went wrong. Please try again.",
        }


async def execute_with_retry(
    func,
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> Any:
    """
    Execute function with exponential backoff retry.

    Args:
        func: Async function to execute
        max_retries: Maximum number of retry attempts
        base_delay: Base delay between retries (seconds)

    Returns:
        Function result

    Raises:
        Exception: If all retries fail
    """
    import asyncio

    for attempt in range(max_retries):
        try:
            return await func()

        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            logger.warning(f"Rate limit hit, retry {attempt + 1}/{max_retries} after {delay}s")
            await asyncio.sleep(delay)

        except APITimeoutError as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            logger.warning(f"Timeout, retry {attempt + 1}/{max_retries} after {delay}s")
            await asyncio.sleep(delay)

        except APIError as e:
            # Don't retry on client errors (4xx)
            if hasattr(e, 'status_code') and 400 <= e.status_code < 500:
                raise
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            logger.warning(f"API error, retry {attempt + 1}/{max_retries} after {delay}s")
            await asyncio.sleep(delay)
```

## Configuration Updates

### Add Agent Settings to Config

```python
# backend/app/core/config.py (add to existing)
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # ... existing settings ...

    # Agent Configuration
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")
    agent_max_iterations: int = Field(default=10, env="AGENT_MAX_ITERATIONS")
    agent_timeout_seconds: int = Field(default=30, env="AGENT_TIMEOUT_SECONDS")
    agent_enable_streaming: bool = Field(default=False, env="AGENT_ENABLE_STREAMING")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
```

## Integration with Existing Backend

### Update Main App to Include Agent Router

```python
# backend/app/main.py (update existing)
# ... existing imports ...

# Include Agent Router
from app.api.routes.agents import router as agent_router

app.include_router(agent_router)
```

### Add to Requirements

```txt
# backend/requirements.txt (add to existing)
openai[agents]>=1.0.0
```

## Testing Strategy

### Unit Tests for Agent Tools

```python
# backend/tests/test_agent_tools.py
"""Test agent tool execution."""
import pytest
from app.agents.tools import execute_tool_call


@pytest.mark.asyncio
async def test_create_task_tool(db_session):
    """Test create task tool execution."""
    result = await execute_tool_call(
        function_name="create_task",
        arguments={
            "title": "Test task",
            "priority": "high",
        },
        user_id="test-user-123",
    )

    assert result["success"] is True
    assert result["task"]["title"] == "Test task"
    assert result["task"]["priority"] == "high"


@pytest.mark.asyncio
async def test_list_tasks_tool(db_session):
    """Test list tasks tool execution."""
    result = await execute_tool_call(
        function_name="list_tasks",
        arguments={"status": "all"},
        user_id="test-user-123",
    )

    assert result["success"] is True
    assert "tasks" in result
    assert isinstance(result["count"], int)
```

### Integration Tests for Agent Flow

```python
# backend/tests/test_agent_integration.py
"""Test agent conversation flow."""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_agent_chat_create_task(auth_headers):
    """Test agent chat for creating a task."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/agent/chat",
            headers=auth_headers,
            json={
                "message": "Create a task called Buy groceries with high priority",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "tool_calls" in data
        assert len(data["tool_calls"]) > 0
        assert data["tool_calls"][0]["tool"] == "create_task"


@pytest.mark.asyncio
async def test_agent_chat_list_tasks(auth_headers):
    """Test agent chat for listing tasks."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/agent/chat",
            headers=auth_headers,
            json={
                "message": "Show me all my tasks",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "response" in data
```

## Quality Assurance Checklist

- [ ] OpenAI Agents SDK installed with correct version
- [ ] Environment variables configured (OPENAI_API_KEY, OPENAI_MODEL)
- [ ] Agent configuration created with function tools
- [ ] All Todo CRUD operations exposed as function tools
- [ ] JWT middleware integrated with agent endpoints
- [ ] User isolation enforced (user_id in all tool calls)
- [ ] Error handling implemented with retry logic
- [ ] Agent endpoint added to FastAPI router
- [ ] System prompt configured for intent extraction
- [ ] Tool execution wrappers created with database integration
- [ ] Conversation history handling implemented (if needed)
- [ ] Rate limiting and timeout handling in place
- [ ] Unit tests written for tool execution
- [ ] Integration tests written for agent flow
- [ ] Logging configured for debugging agent behavior
- [ ] Documentation updated with agent usage examples

## References and Further Reading

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Building Production-Ready AI Agents with FastAPI](https://dev.to/parupati/building-production-ready-ai-agents-with-openai-agents-sdk-and-fastapi-abd)
- [AI-Powered APIs with FastAPI and Agents SDK](https://blog.devgenius.io/building-ai-powered-apis-with-fastapi-and-openai-agents-sdk-deployment-on-hugging-face-2ce34d3eb766)
- [OpenAI Agents SDK Tools Documentation](https://openai.github.io/openai-agents-python/tools/)
- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [JWT Authentication Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [SQLModel Async Sessions](https://sqlmodel.tiangolo.com/tutorial/async/)
