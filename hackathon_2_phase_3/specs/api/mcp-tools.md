# MCP Tools Specification for Phase 3

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 2.3, @specs/database/schema.md, @specs/api/rest-endpoints.md

---

## Overview

Define all Model Context Protocol (MCP) tools for the Hackathon II Phase 3 Todo AI Chatbot. All tools use the Official MCP SDK for tool definitions and integrate with existing Phase 2 FastAPI backend endpoints. These tools enable AI agents to perform Todo CRUD operations on behalf of authenticated users via natural language commands.

**Base URL:** `http://localhost:8000/api/mcp` (configurable via `MCP_BASE_URL` env var)

**Authentication:** Bearer JWT token (verified from ChatKit session)

**Transport Protocol:** HTTP/JSON over MCP stdio or SSE

**Tool Execution:** Cohere API for function calling and orchestration

---

## 1. MCP Server Setup

### 1.1 Official MCP SDK Installation

**File:** `backend/pyproject.toml`

```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
sqlmodel = "^0.0.14"
pydantic = "^2.5.0"
pyjwt = "^2.8.0"
mcp = "^1.0.0"  # Official MCP SDK

[tool.poetry.dev-dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
```

**Installation:**
```bash
cd backend
poetry install
# or
pip install mcp fastapi sqlmodel pyjwt cohere
```

### 1.2 MCP Server Initialization

**File:** `backend/app/mcp/server.py`

```python
from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from mcp.server.stdio import stdio_server
from app.core.config import settings
from app.mcp.tools import todo_tools

# Create FastMCP server instance
mcp_server = FastMCP(
    name="hackathon-todo-mcp-server",
    version="1.0.0",
    description="MCP server for Todo CRUD operations with user isolation"
)

# Register all Todo tools
from app.mcp.tools.todo_tools import (
    add_task,
    list_tasks,
    get_task,
    update_task,
    delete_task,
    complete_task
)

# Register tools with MCP server
mcp_server.add_tool(add_task)
mcp_server.add_tool(list_tasks)
mcp_server.add_tool(get_task)
mcp_server.add_tool(update_task)
mcp_server.add_tool(delete_task)
mcp_server.add_tool(complete_task)

# Server entry point
if __name__ == "__main__":
    # Run with stdio transport (for local development)
    mcp_server.run(transport="stdio")

    # OR run with SSE transport (for production)
    # mcp_server.run(transport="sse", host="0.0.0.0", port=8001)
```

**Acceptance Criteria:**
- [ ] MCP server initialized with FastMCP
- [ ] Server name and version configured
- [ ] All 5 Todo tools registered
- [ ] Stdio transport works for local development
- [ ] SSE transport available for production

---

## 2. JWT Authentication for MCP Tools

### 2.1 Authentication Middleware

**File:** `backend/app/mcp/auth.py`

```python
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer()

async def verify_jwt_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT token and extract user_id.

    Args:
        request: FastAPI request object
        credentials: HTTP Bearer credentials

    Returns:
        user_id (str): Extracted from JWT payload

    Raises:
        HTTPException 401: Invalid or missing token
    """
    token = credentials.credentials

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload: missing user_id"
            )

        # Store user_id in request state for tool handlers
        request.state.user_id = user_id

        return user_id

    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(e)}"
        )
```

### 2.2 User Isolation Pattern

**All MCP tools MUST follow this pattern:**

```python
from app.mcp.auth import verify_jwt_token
from fastapi import Request

@mcp.tool()
async def add_task(
    request: Request,
    title: str,
    description: str = "",
    priority: str = "medium"
) -> dict:
    """
    Add a new task for the authenticated user.

    Args:
        request: FastAPI request (contains JWT-verified user_id)
        title: Task title (required)
        description: Task description (optional)
        priority: Task priority (low/medium/high, default: medium)

    Returns:
        Created task object with id, title, priority, etc.

    Raises:
        HTTPException 401: Invalid JWT token
        HTTPException 422: Validation error
    """
    # CRITICAL: Get user_id from request state (set by JWT middleware)
    user_id = request.state.user_id

    # Create task with user_id (enforces isolation)
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        priority=priority
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "completed": task.completed
    }
```

**Acceptance Criteria:**
- [ ] JWT verification middleware implemented
- [ ] user_id extracted from token and stored in request.state
- [ ] All MCP tools use request.state.user_id for operations
- [ ] Database queries always filter by user_id
- [ ] 401 error raised for invalid/missing tokens
- [ ] 403 error raised if user_id mismatch (path vs token)

---

## 3. MCP Tool Definitions

### 3.1 Tool: add_task

**Purpose:** Create a new task for the authenticated user.

**Tool Metadata:**
```python
@mcp.tool(
    name="add_task",
    description="Create a new task with title, description, and priority",
    category="todo_management"
)
```

**Input Schema (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Task title (required)"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "Task description (optional)"
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
```

**Implementation:**
**File:** `backend/app/mcp/tools/todo_tools.py`

```python
from mcp.server.fastmcp import FastMCP
from app.models.task import Task
from app.db.session import AsyncSessionLocal
from uuid import uuid4
from datetime import datetime

mcp = FastMCP(name="hackathon-todo-server")

@mcp.tool()
async def add_task(
    title: str,
    description: str = "",
    priority: str = "medium"
) -> dict:
    """
    Add a new task for the authenticated user.

    Args:
        title: Task title (required, 1-200 chars)
        description: Task description (optional, max 1000 chars)
        priority: Task priority (low/medium/high, default: medium)

    Returns:
        Created task object with id, title, priority, completed, created_at

    Example:
        >>> add_task(title="Review PR", description="Check authentication", priority="high")
        {
            "id": "abc123",
            "title": "Review PR",
            "description": "Check authentication",
            "priority": "high",
            "completed": false,
            "created_at": "2025-02-09T10:30:00Z"
        }

    Security:
        Uses user_id from JWT context (enforced by middleware).
        Task is automatically scoped to authenticated user.
    """
    # Get user_id from request context (set by auth middleware)
    from app.mcp.auth import get_current_user_id
    user_id = get_current_user_id()

    # Validate inputs
    if not title or len(title) > 200:
        raise ValueError("title must be 1-200 characters")

    if description and len(description) > 1000:
        raise ValueError("description must be max 1000 characters")

    if priority not in ["low", "medium", "high"]:
        raise ValueError("priority must be low, medium, or high")

    # Create task with user_id
    async with AsyncSessionLocal() as session:
        task = Task(
            id=str(uuid4()),
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            completed=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)

        return {
            "id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
```

**Output Schema (Success):**
```json
{
  "type": "object",
  "properties": {
    "id": {"type": "string", "description": "Unique task ID (UUID)"},
    "user_id": {"type": "string", "description": "Owner user ID"},
    "title": {"type": "string", "description": "Task title"},
    "description": {"type": "string", "description": "Task description"},
    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
    "completed": {"type": "boolean", "description": "Completion status"},
    "created_at": {"type": "string", "format": "date-time"},
    "updated_at": {"type": "string", "format": "date-time"}
  },
  "required": ["id", "user_id", "title", "priority", "completed", "created_at", "updated_at"]
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Missing or invalid JWT token"
}

// 422 Validation Error
{
  "error": "ValidationError",
  "message": "title must be 1-200 characters"
}

// 500 Server Error
{
  "error": "InternalServerError",
  "message": "Failed to create task"
}
```

**Acceptance Criteria:**
- [ ] Creates task with authenticated user's user_id
- [ ] Auto-generates unique UUID for id
- [ ] Sets completed to false by default
- [ ] Sets created_at and updated_at to current timestamp
- [ ] Validates title (required, min 1, max 200 chars)
- [ ] Validates description (optional, max 1000 chars)
- [ ] Validates priority enum (low/medium/high)
- [ ] Returns created task object with all fields
- [ ] Raises 401 if JWT token is missing/invalid
- [ ] Raises 422 if validation fails

---

### 3.2 Tool: list_tasks

**Purpose:** Retrieve all tasks belonging to the authenticated user with optional filtering.

**Tool Metadata:**
```python
@mcp.tool(
    name="list_tasks",
    description="List all tasks for the authenticated user, with optional status filtering",
    category="todo_management"
)
```

**Input Schema (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "completed", "all"],
      "default": "all",
      "description": "Filter by completion status"
    },
    "sort_by": {
      "type": "string",
      "enum": ["created_at", "title", "priority", "updated_at"],
      "default": "created_at",
      "description": "Sort field"
    },
    "order": {
      "type": "string",
      "enum": ["asc", "desc"],
      "default": "desc",
      "description": "Sort order (ascending/descending)"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 1000,
      "default": 100,
      "description": "Maximum number of results"
    }
  }
}
```

**Implementation:**
```python
@mcp.tool()
async def list_tasks(
    status: str = "all",
    sort_by: str = "created_at",
    order: str = "desc",
    limit: int = 100
) -> dict:
    """
    List all tasks for the authenticated user.

    Args:
        status: Filter by status (pending/completed/all)
        sort_by: Sort field (created_at/title/priority/updated_at)
        order: Sort order (asc/desc)
        limit: Max results (1-1000)

    Returns:
        List of task objects with total count

    Example:
        >>> list_tasks(status="pending", sort_by="priority", order="desc")
        {
            "tasks": [
                {"id": "abc123", "title": "Review PR", "priority": "high", "completed": false},
                {"id": "def456", "title": "Test API", "priority": "medium", "completed": false}
            ],
            "total": 2
        }

    Security:
        Returns only tasks belonging to authenticated user.
        User isolation enforced via user_id filter.
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select, col, desc
    user_id = get_current_user_id()

    # Build query with user isolation
    statement = select(Task).where(Task.user_id == user_id)

    # Apply status filter
    if status == "pending":
        statement = statement.where(Task.completed == False)
    elif status == "completed":
        statement = statement.where(Task.completed == True)

    # Apply sorting
    sort_column = getattr(Task, sort_by)
    if order == "desc":
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(sort_column)

    # Apply limit
    statement = statement.limit(limit)

    # Execute query
    async with AsyncSessionLocal() as session:
        result = await session.exec(statement)
        tasks = result.all()

        return {
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                }
                for task in tasks
            ],
            "total": len(tasks)
        }
```

**Output Schema (Success):**
```json
{
  "type": "object",
  "properties": {
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"},
          "description": {"type": "string"},
          "priority": {"type": "string", "enum": ["low", "medium", "high"]},
          "completed": {"type": "boolean"},
          "created_at": {"type": "string", "format": "date-time"},
          "updated_at": {"type": "string", "format": "date-time"}
        }
      }
    },
    "total": {"type": "integer", "description": "Total number of tasks returned"}
  },
  "required": ["tasks", "total"]
}
```

**Acceptance Criteria:**
- [ ] Returns only tasks belonging to authenticated user
- [ ] Filters by status parameter (pending/completed/all)
- [ ] Sorts by specified field (created_at/title/priority/updated_at)
- [ ] Supports sort order (asc/desc)
- [ ] Limits results to specified limit (max 1000)
- [ ] Returns empty array for new user
- [ ] Raises 401 if JWT token is missing/invalid

---

### 3.3 Tool: get_task

**Purpose:** Retrieve a single task by ID. Must belong to the authenticated user.

**Tool Metadata:**
```python
@mcp.tool(
    name="get_task",
    description="Get a single task by ID (must belong to authenticated user)",
    category="todo_management"
)
```

**Input Schema (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "description": "Task ID (UUID string)"
    }
  },
  "required": ["task_id"]
}
```

**Implementation:**
```python
@mcp.tool()
async def get_task(task_id: str) -> dict:
    """
    Get a single task by ID.

    Args:
        task_id: Task ID (UUID string)

    Returns:
        Task object with all fields

    Example:
        >>> get_task(task_id="abc123")
        {
            "id": "abc123",
            "title": "Review PR",
            "description": "Check authentication",
            "priority": "high",
            "completed": false,
            "created_at": "2025-02-09T10:30:00Z",
            "updated_at": "2025-02-09T10:30:00Z"
        }

    Security:
        Returns task only if it belongs to authenticated user.
        Raises error if task doesn't exist or belongs to different user.
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select
    from fastapi import HTTPException
    user_id = get_current_user_id()

    async with AsyncSessionLocal() as session:
        # Query task with user isolation
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id  # Critical: enforce ownership
        )
        result = await session.exec(statement)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or does not belong to this user"
            )

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
```

**Output Schema (Success):**
```json
{
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "title": {"type": "string"},
    "description": {"type": "string"},
    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
    "completed": {"type": "boolean"},
    "created_at": {"type": "string", "format": "date-time"},
    "updated_at": {"type": "string", "format": "date-time"}
  },
  "required": ["id", "title", "priority", "completed", "created_at", "updated_at"]
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "error": "NotFound",
  "message": "Task not found or does not belong to this user"
}
```

**Acceptance Criteria:**
- [ ] Returns task only if it belongs to authenticated user
- [ ] Returns 404 if task doesn't exist
- [ ] Returns 404 if task belongs to different user
- [ ] Raises 401 if JWT token is missing/invalid

---

### 3.4 Tool: update_task

**Purpose:** Update a task's fields. Only provided fields are updated (partial update). Task must belong to the authenticated user.

**Tool Metadata:**
```python
@mcp.tool(
    name="update_task",
    description="Update a task's fields (partial update supported)",
    category="todo_management"
)
```

**Input Schema (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "description": "Task ID (UUID string)"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "New task title (optional)"
    },
    "description": {
      "type": "string",
      "maxLength": 1000,
      "description": "New task description (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "New task priority (optional)"
    }
  },
  "required": ["task_id"]
}
```

**Implementation:**
```python
@mcp.tool()
async def update_task(
    task_id: str,
    title: str = None,
    description: str = None,
    priority: str = None
) -> dict:
    """
    Update a task's fields.

    Args:
        task_id: Task ID (UUID string)
        title: New task title (optional)
        description: New task description (optional)
        priority: New task priority (optional)

    Returns:
        Updated task object

    Example:
        >>> update_task(task_id="abc123", title="Updated: Review PR", priority="high")
        {
            "id": "abc123",
            "title": "Updated: Review PR",
            "priority": "high",
            "completed": false,
            "updated_at": "2025-02-09T11:30:00Z"
        }

    Security:
        Updates task only if it belongs to authenticated user.
        Enforces user isolation via user_id filter.
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select
    from fastapi import HTTPException
    user_id = get_current_user_id()

    async with AsyncSessionLocal() as session:
        # Query task with user isolation
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id  # Critical: enforce ownership
        )
        result = await session.exec(statement)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or does not belong to this user"
            )

        # Update only provided fields (partial update)
        if title is not None:
            if not title or len(title) > 200:
                raise ValueError("title must be 1-200 characters")
            task.title = title

        if description is not None:
            if len(description) > 1000:
                raise ValueError("description must be max 1000 characters")
            task.description = description

        if priority is not None:
            if priority not in ["low", "medium", "high"]:
                raise ValueError("priority must be low, medium, or high")
            task.priority = priority

        # Update timestamp
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
```

**Output Schema (Success):**
Same as `get_task` output schema.

**Acceptance Criteria:**
- [ ] Updates only provided fields (partial update)
- [ ] Updates updated_at timestamp
- [ ] Does NOT modify id, user_id, created_at, completed
- [ ] Validates all input fields
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Raises 401 if JWT token is missing/invalid

---

### 3.5 Tool: delete_task

**Purpose:** Permanently delete a task. Task must belong to the authenticated user.

**Tool Metadata:**
```python
@mcp.tool(
    name="delete_task",
    description="Permanently delete a task by ID",
    category="todo_management"
)
```

**Input Schema (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "description": "Task ID (UUID string)"
    }
  },
  "required": ["task_id"]
}
```

**Implementation:**
```python
@mcp.tool()
async def delete_task(task_id: str) -> dict:
    """
    Delete a task permanently.

    Args:
        task_id: Task ID (UUID string)

    Returns:
        Deletion confirmation

    Example:
        >>> delete_task(task_id="abc123")
        {
            "deleted": true,
            "id": "abc123",
            "message": "Task deleted successfully"
        }

    Security:
        Deletes task only if it belongs to authenticated user.
        Enforces user isolation via user_id filter.
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select
    from fastapi import HTTPException
    user_id = get_current_user_id()

    async with AsyncSessionLocal() as session:
        # Query task with user isolation
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id  # Critical: enforce ownership
        )
        result = await session.exec(statement)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or does not belong to this user"
            )

        # Delete task
        await session.delete(task)
        await session.commit()

        return {
            "deleted": True,
            "id": task_id,
            "message": "Task deleted successfully"
        }
```

**Output Schema (Success):**
```json
{
  "type": "object",
  "properties": {
    "deleted": {"type": "boolean", "description": "True if deletion successful"},
    "id": {"type": "string", "description": "Deleted task ID"},
    "message": {"type": "string", "description": "Success message"}
  },
  "required": ["deleted", "id", "message"]
}
```

**Acceptance Criteria:**
- [ ] Deletes task only if it belongs to authenticated user
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Returns confirmation with deleted=true
- [ ] Raises 401 if JWT token is missing/invalid

---

### 3.6 Tool: complete_task

**Purpose:** Toggle or set the completion status of a task. Task must belong to the authenticated user.

**Tool Metadata:**
```python
@mcp.tool(
    name="complete_task",
    description="Mark a task as complete or incomplete",
    category="todo_management"
)
```

**Input Schema (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "string",
      "description": "Task ID (UUID string)"
    },
    "completed": {
      "type": "boolean",
      "description": "Desired completion status (true/false). If not provided, toggles current status."
    }
  },
  "required": ["task_id"]
}
```

**Implementation:**
```python
@mcp.tool()
async def complete_task(
    task_id: str,
    completed: bool = None
) -> dict:
    """
    Mark a task as complete or incomplete.

    Args:
        task_id: Task ID (UUID string)
        completed: Desired completion status (true/false). If None, toggles current status.

    Returns:
        Updated task object

    Example:
        >>> complete_task(task_id="abc123", completed=True)
        {
            "id": "abc123",
            "title": "Review PR",
            "completed": true,
            "updated_at": "2025-02-09T12:00:00Z"
        }

    Security:
        Updates task only if it belongs to authenticated user.
        Enforces user isolation via user_id filter.
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select
    from fastapi import HTTPException
    user_id = get_current_user_id()

    async with AsyncSessionLocal() as session:
        # Query task with user isolation
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id  # Critical: enforce ownership
        )
        result = await session.exec(statement)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or does not belong to this user"
            )

        # Set or toggle completed status
        if completed is None:
            task.completed = not task.completed  # Toggle
        else:
            task.completed = completed  # Set to specified value

        # Update timestamp
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }
```

**Output Schema (Success):**
Same as `get_task` output schema.

**Acceptance Criteria:**
- [ ] Toggles completed status if completed parameter not provided
- [ ] Sets completed to specified value if provided
- [ ] Updates updated_at timestamp
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Raises 401 if JWT token is missing/invalid

---

## 4. Integration with Phase 2 Backend

### 4.1 Reusing Existing Database Models

**File:** `backend/app/models/task.py` (from Phase 2)

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium", max_length=10)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    __tablename__ = "task"

    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="tasks")
```

**Key Points:**
- MCP tools use the same `Task` model as Phase 2 REST endpoints
- No migration needed – tools operate on existing database schema
- User isolation enforced via `user_id` foreign key
- All indexes and constraints from Phase 2 are preserved

### 4.2 Reusing JWT Verification

**File:** `backend/app/core/deps.py` (from Phase 2)

```python
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT and extract user_id.
    Shared between REST endpoints and MCP tools.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        request.state.user_id = user_id
        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 4.3 MCP Tool Endpoint Registration

**File:** `backend/app/api/mcp.py` (NEW for Phase 3)

```python
from fastapi import APIRouter, Depends, Request
from app.mcp.server import mcp_server
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/mcp", tags=["MCP Tools"])

@router.post("/tools/add_task")
async def mcp_add_task(
    request: Request,
    title: str,
    description: str = "",
    priority: str = "medium",
    _: str = Depends(get_current_user)  # Verify JWT
):
    """MCP tool endpoint: add_task"""
    from app.mcp.tools.todo_tools import add_task
    return await add_task(title=title, description=description, priority=priority)

@router.post("/tools/list_tasks")
async def mcp_list_tasks(
    request: Request,
    status: str = "all",
    sort_by: str = "created_at",
    order: str = "desc",
    limit: int = 100,
    _: str = Depends(get_current_user)  # Verify JWT
):
    """MCP tool endpoint: list_tasks"""
    from app.mcp.tools.todo_tools import list_tasks
    return await list_tasks(status=status, sort_by=sort_by, order=order, limit=limit)

# Register all other tools similarly...
```

**Acceptance Criteria:**
- [ ] MCP tools reuse Phase 2 Task model
- [ ] MCP tools use Phase 2 JWT verification
- [ ] MCP tools operate on same database as REST endpoints
- [ ] All tools enforce user isolation via user_id
- [ ] No database schema changes required

---

## 5. Error Handling and User Isolation

### 5.1 Error Taxonomy

**Error Response Format:**
```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  }
}
```

**Error Codes:**
```python
# Authentication Errors
class UnauthorizedError(Exception):
    """401 - Missing or invalid JWT token"""
    pass

class ForbiddenError(Exception):
    """403 - User ID mismatch or insufficient permissions"""
    pass

# Validation Errors
class ValidationError(Exception):
    """422 - Invalid input data"""
    pass

# Resource Errors
class NotFoundError(Exception):
    """404 - Task not found or doesn't belong to user"""
    pass

# Server Errors
class InternalServerError(Exception):
    """500 - Unexpected server error"""
    pass
```

### 5.2 User Isolation Guarantees

**CRITICAL SECURITY REQUIREMENTS:**

1. **JWT Verification:**
   - All MCP tools must verify JWT token before execution
   - Token must be signed with `BETTER_AUTH_SECRET`
   - Extract `user_id` from JWT payload
   - Store `user_id` in `request.state` for tool handlers

2. **Database Query Filtering:**
   - ALL database queries MUST include `WHERE user_id = ?`
   - Never query tasks without user filter
   - Use parameterized queries to prevent SQL injection

3. **Ownership Enforcement:**
   - For single-task operations (get, update, delete, complete):
     - Query must include both `task_id` AND `user_id`
     - Return 404 if task doesn't exist OR doesn't belong to user
   - Do NOT reveal whether task exists or belongs to different user

4. **Response Filtering:**
   - Never expose `user_id` field in responses to other users
   - Ensure responses only contain user's own data

**Isolation Pattern Examples:**

```python
# ✅ CORRECT - User-scoped query
statement = select(Task).where(Task.user_id == user_id)

# ❌ WRONG - Returns all users' tasks (SECURITY VIOLATION)
statement = select(Task)

# ✅ CORRECT - Ownership check
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id  # Critical: enforce ownership
)

# ❌ WRONG - No ownership check (SECURITY VIOLATION)
statement = select(Task).where(Task.id == task_id)
```

### 5.3 Error Handling Implementation

**File:** `backend/app/mcp/errors.py`

```python
from fastapi import HTTPException
from typing import Dict, Any

class MCPError(Exception):
    """Base exception for MCP tool errors"""

    def __init__(self, message: str, details: Dict[str, Any] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class UnauthorizedError(MCPError):
    """401 - Missing or invalid JWT token"""
    pass

class ValidationError(MCPError):
    """422 - Invalid input data"""
    pass

class NotFoundError(MCPError):
    """404 - Task not found or doesn't belong to user"""
    pass

def handle_mcp_error(error: Exception) -> HTTPException:
    """Convert MCP error to HTTP exception"""

    if isinstance(error, UnauthorizedError):
        return HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": error.message,
                "details": error.details
            }
        )

    elif isinstance(error, ValidationError):
        return HTTPException(
            status_code=422,
            detail={
                "error": "ValidationError",
                "message": error.message,
                "details": error.details
            }
        )

    elif isinstance(error, NotFoundError):
        return HTTPException(
            status_code=404,
            detail={
                "error": "NotFound",
                "message": error.message,
                "details": error.details
            }
        )

    else:
        # Log unexpected errors
        logger.error(f"Unexpected error: {error}")
        return HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": "An unexpected error occurred",
                "details": {}
            }
        )
```

**Acceptance Criteria:**
- [ ] All errors return consistent JSON format
- [ ] 401 for missing/invalid JWT tokens
- [ ] 403 for user ID mismatches
- [ ] 404 for not found (including wrong user)
- [ ] 422 for validation errors
- [ ] 500 for unexpected errors (logged)
- [ ] User isolation enforced in all database queries
- [ ] No information leakage in error messages

---

## 6. Cohere API Integration for Tool Calling

### 6.1 Tool Orchestration with Cohere

**File:** `backend/app/agents/cohere_orchestrator.py`

```python
import cohere
from app.core.config import settings
from app.mcp.tools.todo_tools import (
    add_task,
    list_tasks,
    get_task,
    update_task,
    delete_task,
    complete_task
)

class CohereAgentOrchestrator:
    """
    Orchestrates MCP tool calling using Cohere API.
    """

    def __init__(self):
        self.co = cohere.Client(settings.COHERE_API_KEY)

        # Define tool schemas for Cohere
        self.tools = [
            {
                "name": "add_task",
                "description": "Create a new task with title, description, and priority",
                "parameter_definitions": {
                    "title": {
                        "type": "string",
                        "description": "Task title (required)",
                        "required": True
                    },
                    "description": {
                        "type": "string",
                        "description": "Task description (optional)",
                        "required": False
                    },
                    "priority": {
                        "type": "string",
                        "description": "Task priority (low/medium/high)",
                        "required": False
                    }
                }
            },
            # Define other tools similarly...
        ]

    async def process_message(self, user_message: str, user_id: str) -> str:
        """
        Process user message and call appropriate MCP tool.

        Args:
            user_message: Natural language message from user
            user_id: Authenticated user ID (from JWT)

        Returns:
            Natural language response from Cohere
        """
        # Call Cohere Chat API with tool definitions
        response = self.co.chat(
            message=user_message,
            tools=self.tools,
            tool_results=None  # Initial call
        )

        # Check if Cohere wants to call a tool
        if response.tool_calls:
            # Execute tool calls
            tool_results = []
            for tool_call in response.tool_calls:
                tool_name = tool_call.name
                tool_params = tool_call.parameters

                # Execute MCP tool with user_id context
                result = await self.execute_tool(tool_name, tool_params, user_id)
                tool_results.append({
                    "call": tool_call,
                    "result": result
                })

            # Send tool results back to Cohere
            response = self.co.chat(
                message=user_message,
                tools=self.tools,
                tool_results=tool_results
            )

        return response.text

    async def execute_tool(self, tool_name: str, params: dict, user_id: str) -> dict:
        """
        Execute MCP tool with user_id context.

        Args:
            tool_name: Name of tool to execute
            params: Tool parameters
            user_id: Authenticated user ID

        Returns:
            Tool execution result
        """
        # Set user_id in request context for tool
        from app.mcp.auth import set_user_context
        set_user_context(user_id)

        # Execute tool
        if tool_name == "add_task":
            return await add_task(**params)
        elif tool_name == "list_tasks":
            return await list_tasks(**params)
        elif tool_name == "get_task":
            return await get_task(**params)
        elif tool_name == "update_task":
            return await update_task(**params)
        elif tool_name == "delete_task":
            return await delete_task(**params)
        elif tool_name == "complete_task":
            return await complete_task(**params)
        else:
            raise ValueError(f"Unknown tool: {tool_name}")
```

### 6.2 Agent Chat Endpoint

**File:** `backend/app/api/agent.py`

```python
from fastapi import APIRouter, Depends, Request
from app.agents.cohere_orchestrator import CohereAgentOrchestrator
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/agent", tags=["Agent"])

@router.post("/chat")
async def agent_chat(
    request: Request,
    message: str,
    user_id: str = Depends(get_current_user)
):
    """
    Process natural language message and call MCP tools.

    Args:
        request: FastAPI request
        message: User message
        user_id: Authenticated user ID (from JWT)

    Returns:
        Agent response
    """
    orchestrator = CohereAgentOrchestrator()
    response = await orchestrator.process_message(message, user_id)

    return {
        "response": response,
        "user_id": user_id
    }
```

**Acceptance Criteria:**
- [ ] Cohere API initialized with COHERE_API_KEY
- [ ] Tool schemas defined for Cohere
- [ ] Agent processes natural language messages
- [ ] Agent calls appropriate MCP tools
- [ ] MCP tools executed with user_id context
- [ ] Natural language responses generated
- [ ] JWT verification required for agent endpoint

---

## 7. Code Examples for MCP Tool Decorators

### 7.1 Basic Tool Definition

```python
from mcp.server.fastmcp import FastMCP
from app.models.task import Task
from app.db.session import AsyncSessionLocal

mcp = FastMCP(name="hackathon-todo-server")

@mcp.tool()
async def add_task(title: str, description: str = "", priority: str = "medium") -> dict:
    """
    Add a new task for the authenticated user.

    Args:
        title: Task title (required, 1-200 chars)
        description: Task description (optional, max 1000 chars)
        priority: Task priority (low/medium/high, default: medium)

    Returns:
        Created task object

    Example:
        >>> add_task(title="Buy groceries", priority="high")
        {
            "id": "abc123",
            "title": "Buy groceries",
            "priority": "high",
            "completed": false
        }
    """
    from app.mcp.auth import get_current_user_id
    user_id = get_current_user_id()

    async with AsyncSessionLocal() as session:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)

        return {
            "id": task.id,
            "title": task.title,
            "priority": task.priority,
            "completed": task.completed
        }
```

### 7.2 Tool with Advanced Validation

```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, validator

class UpdateTaskInput(BaseModel):
    """Input model for update_task with validation"""
    task_id: str = Field(..., description="Task ID (UUID)")
    title: str = Field(None, min_length=1, max_length=200)
    description: str = Field(None, max_length=1000)
    priority: str = Field(None, regex="^(low|medium|high)$")

    @validator('title')
    def validate_title(cls, v):
        if v and not v.strip():
            raise ValueError("title cannot be empty or whitespace")
        return v.strip()

@mcp.tool()
async def update_task(task_id: str, **kwargs) -> dict:
    """
    Update a task's fields.

    Args:
        task_id: Task ID (UUID string)
        **kwargs: Fields to update (title, description, priority)

    Returns:
        Updated task object

    Example:
        >>> update_task(task_id="abc123", title="Updated title", priority="high")
        {
            "id": "abc123",
            "title": "Updated title",
            "priority": "high"
        }
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select
    from fastapi import HTTPException
    user_id = get_current_user_id()

    # Validate input
    input_data = UpdateTaskInput(task_id=task_id, **kwargs)

    async with AsyncSessionLocal() as session:
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        result = await session.exec(statement)
        task = result.first()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Update fields
        for field, value in kwargs.items():
            if value is not None:
                setattr(task, field, value)

        await session.commit()
        await session.refresh(task)

        return task.dict()
```

### 7.3 Tool with Error Handling

```python
from mcp.server.fastmcp import FastMCP
from app.mcp.errors import ValidationError, NotFoundError

@mcp.tool()
async def complete_task(task_id: str, completed: bool = None) -> dict:
    """
    Mark a task as complete or incomplete.

    Args:
        task_id: Task ID (UUID string)
        completed: Desired completion status (true/false). If None, toggles.

    Returns:
        Updated task object

    Raises:
        NotFoundError: If task not found or doesn't belong to user
        ValidationError: If input is invalid
    """
    from app.mcp.auth import get_current_user_id
    from sqlmodel import select

    user_id = get_current_user_id()

    async with AsyncSessionLocal() as session:
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        result = await session.exec(statement)
        task = result.first()

        if not task:
            raise NotFoundError(
                "Task not found or does not belong to this user",
                details={"task_id": task_id}
            )

        # Toggle or set completed status
        if completed is None:
            task.completed = not task.completed
        else:
            task.completed = completed

        await session.commit()
        await session.refresh(task)

        return task.dict()
```

---

## 8. Acceptance Criteria (All Tools)

### 8.1 Security Requirements
- [ ] All tools verify JWT token before execution
- [ ] User ID extracted from JWT payload
- [ ] All database queries filtered by user_id
- [ ] Ownership checks for single-task operations
- [ ] No SQL injection vulnerabilities (parameterized queries)
- [ ] No data leakage between users
- [ ] Error messages don't reveal sensitive information

### 8.2 Functional Requirements
- [ ] `add_task` creates task with user_id
- [ ] `list_tasks` returns only user's tasks
- [ ] `get_task` returns task only if owned by user
- [ ] `update_task` updates only user's tasks
- [ ] `delete_task` deletes only user's tasks
- [ ] `complete_task` updates only user's tasks

### 8.3 Validation Requirements
- [ ] Title required (min 1, max 200 chars)
- [ ] Description optional (max 1000 chars)
- [ ] Priority enum validation (low/medium/high)
- [ ] Task ID UUID validation
- [ ] Proper error messages for validation failures

### 8.4 Integration Requirements
- [ ] Tools use Phase 2 Task model
- [ ] Tools use Phase 2 JWT verification
- [ ] Tools operate on Phase 2 database
- [ ] Cohere API integration for tool calling
- [ ] Agent chat endpoint functional

### 8.5 Documentation Requirements
- [ ] All tools documented with docstrings
- [ ] Input/output schemas defined (JSON Schema)
- [ ] Error responses documented
- [ ] Code examples provided
- [ ] Security patterns documented

---

## 9. Testing Checklist

### 9.1 Unit Tests (Per Tool)
- [ ] Tool executes successfully with valid input
- [ ] Tool validates required fields
- [ ] Tool validates field constraints (min/max length, enum)
- [ ] Tool returns correct output schema
- [ ] Tool raises appropriate errors for invalid input

### 9.2 Integration Tests
- [ ] Tool connects to database successfully
- [ ] Tool creates/reads/updates/deletes tasks in database
- [ ] Tool enforces user isolation (user_id filter)
- [ ] Tool JWT verification works correctly
- [ ] Tool handles database errors gracefully

### 9.3 Security Tests
- [ ] Missing JWT token returns 401
- [ ] Invalid JWT token returns 401
- [ ] Expired JWT token returns 401
- [ ] User cannot access another user's tasks
- [ ] SQL injection attempts are blocked
- [ ] Error messages don't leak information

### 9.4 End-to-End Tests
- [ ] Add task → list tasks → verify task exists
- [ ] Add task → get task → verify correct task
- [ ] Add task → update task → verify changes
- [ ] Add task → complete task → verify completed
- [ ] Add task → delete task → verify deletion
- [ ] Multi-user test: User A cannot see User B's tasks

### 9.5 Agent Orchestration Tests
- [ ] Cohere API processes natural language
- [ ] Agent calls correct MCP tool
- [ ] MCP tool executes with user_id context
- [ ] Agent generates natural language response
- [ ] Agent handles tool errors gracefully

---

## 10. Cross-References

**Related Specifications:**
- @constitution.md Section 2.3 – JWT authentication and authorization
- @constitution.md Section 3.3 – MCP tool definitions and patterns
- @specs/database/schema.md – Task model schema and database queries
- @specs/api/rest-endpoints.md – Phase 2 REST endpoints (for reference)
- @specs/features/ai-chatbot/spec.md – AI chatbot feature specification

**Implementation Files:**
- `backend/app/mcp/server.py` – MCP server initialization
- `backend/app/mcp/tools/todo_tools.py` – MCP tool implementations
- `backend/app/mcp/auth.py` – JWT authentication for MCP tools
- `backend/app/mcp/errors.py` – Error handling utilities
- `backend/app/agents/cohere_orchestrator.py` – Cohere agent orchestration
- `backend/app/api/agent.py` – Agent chat endpoint
- `backend/app/api/mcp.py` – MCP tool HTTP endpoints
- `backend/app/models/task.py` – Task model (from Phase 2)
- `backend/app/core/deps.py` – JWT verification (from Phase 2)

**Environment Variables Required:**
```bash
# From Phase 2
DATABASE_URL=postgresql://...  # Neon DB
BETTER_AUTH_SECRET=...         # Shared secret
JWT_ALGORITHM=HS256

# New for Phase 3
COHERE_API_KEY=...             # Cohere API key
MCP_BASE_URL=http://localhost:8000/api/mcp
```

---

## 11. Deployment Considerations

### 11.1 Local Development
```bash
# Start MCP server with stdio transport
cd backend
python -m app.mcp.server

# Test MCP tool
curl -X POST http://localhost:8000/api/mcp/tools/add_task \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "priority": "high"}'
```

### 11.2 Production Deployment
- MCP server runs with SSE transport for production
- Use Railway or Fly.io for backend deployment
- Configure COHERE_API_KEY in production environment
- Enable HTTPS for all MCP endpoints
- Monitor tool execution logs and errors

### 11.3 Observability
- Log all MCP tool executions with user_id
- Monitor tool execution latency (p95 < 500ms)
- Track error rates per tool
- Alert on authentication failures
- Monitor Cohere API usage and costs

---

**End of specs/api/mcp-tools.md**

**Version:** 1.0 | **Last Updated:** 2026-02-09 | **Status:** Draft
