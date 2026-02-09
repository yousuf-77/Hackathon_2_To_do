---
name: mcp-tool-definition
description: |
  This skill guides Claude Code to define and implement Official MCP (Model Context Protocol) SDK tools for Todo operations. Covers MCP server setup with FastAPI, tool schemas (add_task, update_task, list_tasks, complete_task, delete_task), JWT security enforcement, user isolation, and tool registration. References official MCP documentation, fastapi-mcp examples, and JSON Schema tool definitions. This skill activates automatically when users mention defining MCP tools, MCP tool schemas, backend tool execution, Phase 3 AI governance, Model Context Protocol, or MCP tool implementation.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
related_skills:
  - agents-sdk-integration
  - fastapi-jwt-middleware-neon
  - mcp-tool-engineer
  - chatbot-integrator
---

# MCP Tool Definition Skill

## Overview

This skill provides comprehensive guidance for defining and implementing Model Context Protocol (MCP) tools in FastAPI backends. It covers MCP server setup, tool schema definitions using JSON Schema, the `@mcp.tool()` decorator pattern, JWT security integration, and user isolation for Phase 3 Todo operations.

## When to Use This Skill

- Defining MCP tools for Todo CRUD operations
- Implementing MCP server with FastAPI
- Creating tool schemas with JSON Schema
- Registering tools with `@mcp.tool()` decorator
- Enforcing JWT security on MCP tool execution
- Implementing user isolation for MCP tools
- Setting up MCP server for Phase 3 AI governance
- Integrating MCP with existing FastAPI backends

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing FastAPI structure, Todo models/routes, JWT middleware patterns |
| **Conversation** | User's MCP tool requirements, security needs, tool naming preferences |
| **Skill References** | Official MCP documentation, fastapi-mcp examples, JSON Schema specifications |
| **User Guidelines** | Project-specific security requirements, governance policies |

Ensure all required context is gathered before implementing.

## Quick Start: MCP SDK Installation

### 1. Install MCP Python SDK

```bash
# Install official MCP Python SDK
pip install mcp

# Or with uv/pip
uv add mcp

# For FastAPI integration
pip install mcp[fastapi]

# Verify installation
python -c "import mcp; print(mcp.__version__)"
```

### 2. Project Structure

```
backend/
├── app/
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py            # MCP server setup
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── todo_tools.py    # Todo tool definitions
│   │   │   └── schemas.py       # Tool input/output schemas
│   │   └── middleware.py        # JWT auth for MCP
```

## MCP Server Setup with FastAPI

### Initialize MCP Server

```python
# backend/app/mcp/server.py
"""
MCP Server setup for Todo operations.
Integrates with FastAPI and enforces JWT security.
"""
from mcp.server.fastmcp import FastMCP
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Create MCP server instance
mcp = FastMCP(
    name="hackathon-todo-server",
    instructions=(
        "Todo management server for multi-user Todo application. "
        "Provides tools for creating, reading, updating, and deleting tasks. "
        "All operations are scoped to authenticated users."
    ),
)

# Import and register tools
from app.mcp.tools.todo_tools import (
    register_add_task_tool,
    register_list_tasks_tool,
    register_update_task_tool,
    register_complete_task_tool,
    register_delete_task_tool,
)

# Register all tools with MCP server
def setup_mcp_tools():
    """Register all Todo tools with MCP server."""
    register_add_task_tool(mcp)
    register_list_tasks_tool(mcp)
    register_update_tasks_tool(mcp)
    register_complete_task_tool(mcp)
    register_delete_task_tool(mcp)

    logger.info("Registered 5 MCP tools for Todo operations")


# Setup tools on import
setup_mcp_tools()
```

## Tool Definitions with MCP Decorator

### Add Task Tool

```python
# backend/app/mcp/tools/todo_tools.py
"""
MCP tool definitions for Todo CRUD operations.
All tools enforce user isolation through JWT middleware.
"""
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.task import Task
from app.api.deps import get_current_user
from sqlmodel import select
from uuid import uuid4
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# Tool Input/Output Schemas
# ============================================================================

class AddTaskInput(BaseModel):
    """Input schema for add_task tool."""
    title: str = Field(
        ...,
        description="Task title (1-200 characters)",
        min_length=1,
        max_length=200
    )
    description: Optional[str] = Field(
        None,
        description="Optional task description (max 1000 characters)",
        max_length=1000
    )
    priority: Literal["low", "medium", "high"] = Field(
        "medium",
        description="Task priority level"
    )

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('title cannot be empty or whitespace only')
        return v.strip()


class AddTaskOutput(BaseModel):
    """Output schema for add_task tool."""
    success: bool = Field(..., description="Whether the operation succeeded")
    task_id: str = Field(..., description="ID of the created task")
    title: str = Field(..., description="Task title")
    priority: str = Field(..., description="Task priority")
    message: str = Field(..., description="Human-readable result message")


class ListTasksInput(BaseModel):
    """Input schema for list_tasks tool."""
    status: Optional[Literal["pending", "completed", "all"]] = Field(
        "all",
        description="Filter by completion status"
    )
    limit: int = Field(
        100,
        description="Maximum number of tasks to return",
        ge=1,
        le=1000
    )


class ListTasksOutput(BaseModel):
    """Output schema for list_tasks tool."""
    success: bool = Field(..., description="Whether the operation succeeded")
    tasks: list = Field(..., description="List of tasks")
    count: int = Field(..., description="Number of tasks returned")
    message: str = Field(..., description="Human-readable result message")


class UpdateTaskInput(BaseModel):
    """Input schema for update_task tool."""
    task_id: str = Field(..., description="Task ID (UUID) to update")
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[Literal["low", "medium", "high"]] = None


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task tool."""
    task_id: str = Field(..., description="Task ID (UUID) to mark complete")
    completed: bool = Field(..., description="True to mark complete, False to mark incomplete")


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task tool."""
    task_id: str = Field(..., description="Task ID (UUID) to delete")


# ============================================================================
# MCP Tool Registration Functions
# ============================================================================

def register_add_task_tool(mcp: FastMCP):
    """Register add_task tool with MCP server."""

    @mcp.tool()
    async def add_task(
        title: str,
        description: Optional[str] = None,
        priority: str = "medium",
    ) -> str:
        """
        Create a new task for the authenticated user.

        Args:
            title: Task title (1-200 characters)
            description: Optional task description
            priority: Task priority (low, medium, high)

        Returns:
            JSON string with created task details

        Example:
            add_task(title="Buy groceries", description="Weekly shopping", priority="high")
        """
        # Get user_id from JWT context (set by middleware)
        # Note: In FastMCP, user context is injected via middleware
        from app.mcp.middleware import get_current_user_id
        user_id = get_current_user_id()

        if not user_id:
            return json.dumps({
                "success": False,
                "error": "Unauthorized: No user context found"
            })

        # Validate input using Pydantic
        try:
            task_input = AddTaskInput(
                title=title,
                description=description,
                priority=priority
            )
        except Exception as e:
            return json.dumps({
                "success": False,
                "error": f"Validation error: {str(e)}"
            })

        # Get database session
        async for session in get_db():
            try:
                # Create task
                task = Task(
                    id=str(uuid4()),
                    user_id=user_id,
                    title=task_input.title,
                    description=task_input.description,
                    priority=task_input.priority,
                    completed=False,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                session.add(task)
                await session.commit()
                await session.refresh(task)

                result = AddTaskOutput(
                    success=True,
                    task_id=task.id,
                    title=task.title,
                    priority=task.priority,
                    message=f"Created task: {task.title}"
                )

                logger.info(f"User {user_id} created task {task.id}")
                return result.model_dump_json()

            except Exception as e:
                logger.error(f"Error creating task for user {user_id}: {e}")
                return json.dumps({
                    "success": False,
                    "error": f"Failed to create task: {str(e)}"
                })


def register_list_tasks_tool(mcp: FastMCP):
    """Register list_tasks tool with MCP server."""

    @mcp.tool()
    async def list_tasks(
        status: str = "all",
        limit: int = 100,
    ) -> str:
        """
        List tasks for the authenticated user.

        Args:
            status: Filter by status (pending, completed, all)
            limit: Maximum number of tasks to return (1-1000)

        Returns:
            JSON string with list of tasks

        Example:
            list_tasks(status="pending", limit=50)
        """
        from app.mcp.middleware import get_current_user_id
        user_id = get_current_user_id()

        if not user_id:
            return json.dumps({
                "success": False,
                "error": "Unauthorized: No user context found"
            })

        # Validate input
        try:
            task_input = ListTasksInput(status=status, limit=limit)
        except Exception as e:
            return json.dumps({
                "success": False,
                "error": f"Validation error: {str(e)}"
            })

        async for session in get_db():
            try:
                statement = select(Task).where(Task.user_id == user_id)

                # Apply status filter
                if task_input.status == "pending":
                    statement = statement.where(Task.completed == False)
                elif task_input.status == "completed":
                    statement = statement.where(Task.completed == True)

                # Apply limit
                statement = statement.limit(task_input.limit)

                result = await session.scalars(statement)
                tasks = list(result.all())

                tasks_data = [
                    {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "priority": task.priority,
                        "completed": task.completed,
                        "created_at": task.created_at.isoformat(),
                    }
                    for task in tasks
                ]

                result = ListTasksOutput(
                    success=True,
                    tasks=tasks_data,
                    count=len(tasks_data),
                    message=f"Found {len(tasks_data)} tasks"
                )

                logger.info(f"User {user_id} listed {len(tasks_data)} tasks")
                return result.model_dump_json()

            except Exception as e:
                logger.error(f"Error listing tasks for user {user_id}: {e}")
                return json.dumps({
                    "success": False,
                    "error": f"Failed to list tasks: {str(e)}"
                })


def register_update_task_tool(mcp: FastMCP):
    """Register update_task tool with MCP server."""

    @mcp.tool()
    async def update_task(
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
    ) -> str:
        """
        Update an existing task.

        Args:
            task_id: Task ID (UUID) to update
            title: New task title
            description: New task description
            priority: New priority level (low, medium, high)

        Returns:
            JSON string with updated task details

        Example:
            update_task(task_id="abc123", title="Updated title", priority="high")
        """
        from app.mcp.middleware import get_current_user_id
        user_id = get_current_user_id()

        if not user_id:
            return json.dumps({
                "success": False,
                "error": "Unauthorized: No user context found"
            })

        # Validate input
        try:
            task_input = UpdateTaskInput(
                task_id=task_id,
                title=title,
                description=description,
                priority=priority
            )
        except Exception as e:
            return json.dumps({
                "success": False,
                "error": f"Validation error: {str(e)}"
            })

        async for session in get_db():
            try:
                # Get task (enforce ownership)
                statement = select(Task).where(
                    Task.id == task_input.task_id,
                    Task.user_id == user_id,
                )
                result = await session.scalars(statement)
                task = result.first()

                if not task:
                    return json.dumps({
                        "success": False,
                        "error": "Task not found or access denied"
                    })

                # Update fields
                if task_input.title:
                    task.title = task_input.title
                if task_input.description is not None:
                    task.description = task_input.description
                if task_input.priority:
                    task.priority = task_input.priority

                task.updated_at = datetime.utcnow()

                await session.commit()
                await session.refresh(task)

                logger.info(f"User {user_id} updated task {task.id}")
                return json.dumps({
                    "success": True,
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "priority": task.priority,
                        "completed": task.completed,
                    },
                    "message": f"Updated task: {task.title}"
                })

            except Exception as e:
                logger.error(f"Error updating task for user {user_id}: {e}")
                return json.dumps({
                    "success": False,
                    "error": f"Failed to update task: {str(e)}"
                })


def register_complete_task_tool(mcp: FastMCP):
    """Register complete_task tool with MCP server."""

    @mcp.tool()
    async def complete_task(
        task_id: str,
        completed: bool = True,
    ) -> str:
        """
        Mark a task as complete or incomplete.

        Args:
            task_id: Task ID (UUID) to toggle
            completed: True to mark complete, False to mark incomplete

        Returns:
            JSON string with updated task details

        Example:
            complete_task(task_id="abc123", completed=True)
        """
        from app.mcp.middleware import get_current_user_id
        user_id = get_current_user_id()

        if not user_id:
            return json.dumps({
                "success": False,
                "error": "Unauthorized: No user context found"
            })

        # Validate input
        try:
            task_input = CompleteTaskInput(task_id=task_id, completed=completed)
        except Exception as e:
            return json.dumps({
                "success": False,
                "error": f"Validation error: {str(e)}"
            })

        async for session in get_db():
            try:
                # Get task (enforce ownership)
                statement = select(Task).where(
                    Task.id == task_input.task_id,
                    Task.user_id == user_id,
                )
                result = await session.scalars(statement)
                task = result.first()

                if not task:
                    return json.dumps({
                        "success": False,
                        "error": "Task not found or access denied"
                    })

                # Update completion status
                task.completed = task_input.completed
                task.updated_at = datetime.utcnow()

                await session.commit()
                await session.refresh(task)

                status = "complete" if task.completed else "incomplete"

                logger.info(f"User {user_id} marked task {task.id} as {status}")
                return json.dumps({
                    "success": True,
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "completed": task.completed,
                    },
                    "message": f"Marked task '{task.title}' as {status}"
                })

            except Exception as e:
                logger.error(f"Error completing task for user {user_id}: {e}")
                return json.dumps({
                    "success": False,
                    "error": f"Failed to update task: {str(e)}"
                })


def register_delete_task_tool(mcp: FastMCP):
    """Register delete_task tool with MCP server."""

    @mcp.tool()
    async def delete_task(task_id: str) -> str:
        """
        Delete a task permanently.

        Args:
            task_id: Task ID (UUID) to delete

        Returns:
            JSON string with deletion confirmation

        Example:
            delete_task(task_id="abc123")
        """
        from app.mcp.middleware import get_current_user_id
        user_id = get_current_user_id()

        if not user_id:
            return json.dumps({
                "success": False,
                "error": "Unauthorized: No user context found"
            })

        # Validate input
        try:
            task_input = DeleteTaskInput(task_id=task_id)
        except Exception as e:
            return json.dumps({
                "success": False,
                "error": f"Validation error: {str(e)}"
            })

        async for session in get_db():
            try:
                # Get task (enforce ownership)
                statement = select(Task).where(
                    Task.id == task_input.task_id,
                    Task.user_id == user_id,
                )
                result = await session.scalars(statement)
                task = result.first()

                if not task:
                    return json.dumps({
                        "success": False,
                        "error": "Task not found or access denied"
                    })

                task_title = task.title
                await session.delete(task)
                await session.commit()

                logger.info(f"User {user_id} deleted task {task.id}")
                return json.dumps({
                    "success": True,
                    "message": f"Deleted task: {task_title}"
                })

            except Exception as e:
                logger.error(f"Error deleting task for user {user_id}: {e}")
                return json.dumps({
                    "success": False,
                    "error": f"Failed to delete task: {str(e)}"
                })
```

## JWT Security Middleware for MCP

### Authentication Context

```python
# backend/app/mcp/middleware.py
"""
JWT authentication middleware for MCP tools.
Extracts user_id from JWT token and makes it available to tools.
"""
from typing import Optional
from fastapi import Request, HTTPException, status
from jwt import PyJWTError
from app.core.security import decode_jwt, verify_jwt_payload
import logging

logger = logging.getLogger(__name__)

# Thread-local storage for user context
import contextvars
_user_id_context: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    'user_id', default=None
)


def get_current_user_id() -> Optional[str]:
    """
    Get the current user ID from context.
    Called by MCP tools to enforce user isolation.

    Returns:
        user_id if authenticated, None otherwise
    """
    return _user_id_context.get()


async def set_user_context_from_token(request: Request):
    """
    Extract user_id from JWT token and set in context.
    Called before MCP tool execution.

    Args:
        request: FastAPI request object

    Raises:
        HTTPException: If token is invalid or missing
    """
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = auth_header.split(" ")[1]

        # Verify and decode JWT
        payload = decode_jwt(token)

        # Extract user_id
        user_id = verify_jwt_payload(payload)

        # Set in context
        _user_id_context.set(user_id)

        logger.debug(f"Set user context for user_id: {user_id}")

    except (PyJWTError, ValueError) as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Missing or invalid authorization token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def clear_user_context():
    """Clear user context after tool execution."""
    _user_id_context.set(None)
```

## FastAPI Integration

### Expose MCP Server via FastAPI

```python
# backend/app/api/routes/mcp.py
"""
FastAPI routes for MCP server integration.
Exposes MCP tools via HTTP with JWT authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from app.mcp.server import mcp
from app.mcp.middleware import set_user_context_from_token, clear_user_context
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mcp", tags=["mcp"])


@router.post("/tools/{tool_name}")
async def execute_mcp_tool(
    tool_name: str,
    request: Request,
):
    """
    Execute an MCP tool by name.

    Args:
        tool_name: Name of the tool to execute
        request: FastAPI request with JSON body and JWT token

    Returns:
        Tool execution result as JSON

    Example:
        POST /api/mcp/tools/add_task
        Authorization: Bearer <jwt_token>
        {
            "title": "Buy groceries",
            "priority": "high"
        }
    """
    # Set user context from JWT
    await set_user_context_from_token(request)

    try:
        # Get request body
        body = await request.json()

        # Execute MCP tool
        # Note: FastMCP provides a method to call tools by name
        if tool_name not in mcp._tools:
            raise HTTPException(
                status_code=404,
                detail=f"Tool '{tool_name}' not found"
            )

        # Call the tool
        tool = mcp._tools[tool_name]
        result = await tool(**body)

        return {
            "tool": tool_name,
            "result": result
        }

    except Exception as e:
        logger.error(f"Error executing MCP tool {tool_name}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Tool execution failed: {str(e)}"
        )

    finally:
        # Clear user context
        clear_user_context()


@router.get("/tools")
async def list_mcp_tools():
    """
    List all available MCP tools.

    Returns:
        List of tool definitions with schemas
    """
    tools = []

    for name, tool in mcp._tools.items():
        tools.append({
            "name": name,
            "description": tool.description,
            "input_schema": tool.input_schema,
        })

    return {"tools": tools}
```

### Update Main App

```python
# backend/app/main.py (add to existing)

# Include MCP Router
from app.api.routes.mcp import router as mcp_router

app.include_router(mcp_router)
```

## Tool Schema Definition (JSON Schema)

### Manual Schema Definition

```python
# backend/app/mcp/tools/schemas.py
"""
JSON Schema definitions for MCP tools.
Official MCP tool schema format.
"""

ADD_TASK_SCHEMA = {
    "name": "add_task",
    "description": "Create a new task for the authenticated user",
    "inputSchema": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200,
                "description": "Task title"
            },
            "description": {
                "type": "string",
                "maxLength": 1000,
                "description": "Optional task description"
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "default": "medium",
                "description": "Task priority level"
            }
        },
        "required": ["title"]
    }
}

LIST_TASKS_SCHEMA = {
    "name": "list_tasks",
    "description": "List tasks for the authenticated user",
    "inputSchema": {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["pending", "completed", "all"],
                "default": "all",
                "description": "Filter by completion status"
            },
            "limit": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1000,
                "default": 100,
                "description": "Maximum number of tasks to return"
            }
        }
    }
}

UPDATE_TASK_SCHEMA = {
    "name": "update_task",
    "description": "Update an existing task",
    "inputSchema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "Task ID (UUID) to update"
            },
            "title": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200,
                "description": "New task title"
            },
            "description": {
                "type": "string",
                "maxLength": 1000,
                "description": "New task description"
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "description": "New priority level"
            }
        },
        "required": ["task_id"]
    }
}

COMPLETE_TASK_SCHEMA = {
    "name": "complete_task",
    "description": "Mark a task as complete or incomplete",
    "inputSchema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "Task ID (UUID) to toggle"
            },
            "completed": {
                "type": "boolean",
                "description": "True to mark complete, False to mark incomplete"
            }
        },
        "required": ["task_id", "completed"]
    }
}

DELETE_TASK_SCHEMA = {
    "name": "delete_task",
    "description": "Delete a task permanently",
    "inputSchema": {
        "type": "object",
        "properties": {
            "task_id": {
                "type": "string",
                "description": "Task ID (UUID) to delete"
            }
        },
        "required": ["task_id"]
    }
}

# Export all schemas
ALL_TOOL_SCHEMAS = [
    ADD_TASK_SCHEMA,
    LIST_TASKS_SCHEMA,
    UPDATE_TASK_SCHEMA,
    COMPLETE_TASK_SCHEMA,
    DELETE_TASK_SCHEMA,
]
```

## Testing MCP Tools

### Unit Tests for Tool Execution

```python
# backend/tests/test_mcp_tools.py
"""Test MCP tool execution."""
import pytest
import json
from app.mcp.tools.todo_tools import register_add_task_tool
from app.mcp.server import mcp


@pytest.mark.asyncio
async def test_add_task_tool(db_session, auth_token):
    """Test add_task MCP tool execution."""
    # Register tool
    register_add_task_tool(mcp)

    # Execute tool
    result = await mcp._tools["add_task"](
        title="Test task",
        description="Test description",
        priority="high"
    )

    # Parse result
    result_data = json.loads(result)

    assert result_data["success"] is True
    assert "task_id" in result_data
    assert result_data["title"] == "Test task"
    assert result_data["priority"] == "high"


@pytest.mark.asyncio
async def test_list_tasks_tool(db_session, auth_token):
    """Test list_tasks MCP tool execution."""
    from app.mcp.tools.todo_tools import register_list_tasks_tool

    register_list_tasks_tool(mcp)

    result = await mcp._tools["list_tasks"](status="all", limit=10)

    result_data = json.loads(result)

    assert result_data["success"] is True
    assert "tasks" in result_data
    assert isinstance(result_data["count"], int)
```

### Integration Tests for FastAPI Endpoints

```python
# backend/tests/test_mcp_integration.py
"""Test MCP tool integration with FastAPI."""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_mcp_add_task_endpoint(auth_headers):
    """Test MCP tool execution via FastAPI endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/mcp/tools/add_task",
            headers=auth_headers,
            json={
                "title": "Buy groceries",
                "priority": "high"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["tool"] == "add_task"
        assert data["result"]["success"] is True


@pytest.mark.asyncio
async def test_mcp_list_tools_endpoint(auth_headers):
    """Test listing available MCP tools."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/api/mcp/tools",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "tools" in data
        assert len(data["tools"]) == 5  # 5 Todo tools
        tool_names = [t["name"] for t in data["tools"]]
        assert "add_task" in tool_names
        assert "list_tasks" in tool_names
```

## Configuration and Deployment

### Environment Variables

```bash
# backend/.env (add to existing)
# MCP Configuration
MCP_SERVER_NAME="hackathon-todo-server"
MCP_ENABLE_LOGGING=true
MCP_LOG_LEVEL=INFO
```

### Update Requirements

```txt
# backend/requirements.txt (add to existing)
mcp>=1.7.0
```

## Quality Assurance Checklist

- [ ] MCP Python SDK installed with correct version
- [ ] MCP server initialized with FastMCP
- [ ] All Todo tools registered with @mcp.tool() decorator
- [ ] Tool input/output schemas defined with Pydantic
- [ ] JWT authentication middleware integrated
- [ ] User isolation enforced (user_id from context)
- [ ] FastAPI endpoints created for tool execution
- [ ] Tool listing endpoint implemented
- [ ] Error handling with user-friendly messages
- [ ] Logging configured for tool execution
- [ ] Unit tests written for each tool
- [ ] Integration tests written for FastAPI endpoints
- [ ] Security testing for JWT enforcement
- [ ] Documentation updated with tool examples
- [ ] MCP server successfully registered with clients

## References and Further Reading

- [Official MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Official Documentation](https://modelcontextprotocol.io/docs/sdk)
- [Build an MCP Server](https://modelcontextprotocol.io/docs/develop/build-server)
- [MCP Tools Documentation](https://modelcontextprotocol.info/docs/concepts/tools/)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [Integrating MCP Servers with FastAPI](https://medium.com/@ruchi.awasthi63/integrating-mcp-servers-with-fastapi-2c6d0c9a4749)
- [fastapi_mcp GitHub](https://github.com/tadata-org/fastapi_mcp)
- [JSON Schema Specification](https://json-schema.org/specification)
- [Build Your First MCP Server](https://medium.com/data-science-collective/build-your-first-mcp-server-in-15-minutes-complete-code-d63f85c0ce79)
