# specs/features/task-crud-backend.md

## Task CRUD Backend Feature Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md, @specs/database/schema.md, @specs/api/rest-endpoints.md

---

## Overview

Define the backend business logic and implementation for the 5 Basic CRUD features (Add, Delete, Update, View, Mark Complete) for the Hackathon II Phase II Todo Full-Stack Web Application. All operations enforce strict user isolation and JWT authentication.

**Technology Stack:**
- Framework: FastAPI (Python 3.13+)
- ORM: SQLModel (async)
- Database: Neon PostgreSQL
- Validation: Pydantic v2
- Authentication: PyJWT verification

---

## 1. User Stories & Acceptance Criteria

### 1.1 User Story 1: Add Task (Create)

**Story:** As a logged-in user, I want to create a new task with a title, description, and priority level so that I can track my to-do items.

**Acceptance Criteria:**
- [ ] User can create task with required field: title (1-200 chars)
- [ ] User can optionally add description (max 1000 chars)
- [ ] User can set priority level: low, medium, or high (default: medium)
- [ ] Task is automatically assigned to authenticated user (via JWT)
- [ ] Task has unique ID (UUID)
- [ ] Task has timestamps: created_at, updated_at
- [ ] Task's `completed` status defaults to `false`
- [ ] Validation errors return 400 with descriptive message
- [ ] Success returns 201 with created task object
- [ ] Other users cannot access this task (user isolation)

**Gherkin Scenario:**
```gherkin
Scenario: User creates a new task
  Given user "alice@example.com" is logged in
  When user sends POST request to "/api/alice_id/tasks" with body:
    """
    {
      "title": "Build authentication system",
      "description": "Implement Better Auth with JWT",
      "priority": "high"
    }
    """
  Then response status code is 201
  And response contains task object with:
    """
    {
      "id": "<uuid>",
      "user_id": "alice_id",
      "title": "Build authentication system",
      "description": "Implement Better Auth with JWT",
      "priority": "high",
      "completed": false,
      "created_at": "<timestamp>",
      "updated_at": "<timestamp>"
    }
    """
  And task belongs to user "alice_id"

Scenario: User creates task with invalid data
  Given user "alice@example.com" is logged in
  When user sends POST request to "/api/alice_id/tasks" with body:
    """
    {
      "title": ""
    }
    """
  Then response status code is 400
  And response contains error: "title is required (min_length=1, max_length=200)"
```

---

### 1.2 User Story 2: View Tasks (Read)

**Story:** As a logged-in user, I want to view all my tasks so that I can see what I need to do.

**Acceptance Criteria:**
- [ ] User can view list of their own tasks
- [ ] User cannot view tasks belonging to other users
- [ ] List includes task details: id, title, description, priority, completed, timestamps
- [ ] User can filter by completion status: pending, completed, all (default: all)
- [ ] User can sort by: created date, title, priority, updated date (default: created)
- [ ] User can set sort direction: ascending or descending (default: descending)
- [ ] User can paginate results with limit (default: 100, max: 1000) and offset (default: 0)
- [ ] Empty list returns 200 with empty array (not 404)
- [ ] Success returns 200 with array of tasks
- [ ] Response includes total count for pagination

**Gherkin Scenario:**
```gherkin
Scenario: User views their tasks
  Given user "alice@example.com" is logged in
  And user has 5 tasks
  When user sends GET request to "/api/alice_id/tasks"
  Then response status code is 200
  And response contains array of 5 tasks
  And each task belongs to user "alice_id"

Scenario: User filters by pending status
  Given user "alice@example.com" is logged in
  And user has 3 pending tasks and 2 completed tasks
  When user sends GET request to "/api/alice_id/tasks?status=pending"
  Then response status code is 200
  And response contains array of 3 tasks
  And all tasks have completed=false

Scenario: User tries to view another user's tasks
  Given user "alice@example.com" is logged in
  When user sends GET request to "/api/bob_id/tasks"
  Then response status code is 403
  And response contains error: "User ID mismatch"
```

---

### 1.3 User Story 3: Update Task (Update)

**Story:** As a logged-in user, I want to edit an existing task's title, description, or priority so that I can modify my to-do items.

**Acceptance Criteria:**
- [ ] User can update their own task by ID
- [ ] User can update any combination of: title, description, priority
- [ ] User cannot update tasks belonging to other users (403)
- [ ] User cannot update immutable fields: id, user_id, created_at, completed (use toggle endpoint)
- [ ] At least one field must be provided (400 if empty body)
- [ ] Validation rules apply (same as create)
- [ ] `updated_at` timestamp is automatically updated
- [ ] Success returns 200 with updated task object
- [ ] Task not found or doesn't belong to user returns 404

**Gherkin Scenario:**
```gherkin
Scenario: User updates their task
  Given user "alice@example.com" is logged in
  And user has task with id "task_123"
  When user sends PUT request to "/api/alice_id/tasks/task_123" with body:
    """
    {
      "title": "Updated title",
      "priority": "high"
    }
    """
  Then response status code is 200
  And task title is "Updated title"
  And task priority is "high"
  And task updated_at timestamp changed

Scenario: User tries to update another user's task
  Given user "alice@example.com" is logged in
  And user "bob" has task with id "task_456"
  When user sends PUT request to "/api/alice_id/tasks/task_456" with body:
    """
    {
      "title": "Hacked title"
    }
    """
  Then response status code is 404
  And response contains error: "Task not found or does not belong to this user"
```

---

### 1.4 User Story 4: Delete Task (Delete)

**Story:** As a logged-in user, I want to delete a task so that I can remove completed or unwanted items from my list.

**Acceptance Criteria:**
- [ ] User can delete their own task by ID
- [ ] User cannot delete tasks belonging to other users (403)
- [ ] Success returns 204 with no response body
- [ ] Task not found or doesn't belong to user returns 404
- [ ] Deletion is permanent (no soft delete)
- [ ] Cascade delete: if user is deleted, all their tasks are deleted

**Gherkin Scenario:**
```gherkin
Scenario: User deletes their task
  Given user "alice@example.com" is logged in
  And user has task with id "task_123"
  When user sends DELETE request to "/api/alice_id/tasks/task_123"
  Then response status code is 204
  And response body is empty
  And task is permanently deleted from database

Scenario: User tries to delete another user's task
  Given user "alice@example.com" is logged in
  And user "bob" has task with id "task_456"
  When user sends DELETE request to "/api/alice_id/tasks/task_456"
  Then response status code is 404
  And task "task_456" still exists in database
```

---

### 1.5 User Story 5: Mark Task as Complete (Toggle)

**Story:** As a logged-in user, I want to mark a task as complete or incomplete so that I can track my progress.

**Acceptance Criteria:**
- [ ] User can toggle completion status of their own task by ID
- [ ] User can set specific status (true/false) via request body
- [ ] If no body provided, toggles current status (false→true, true→false)
- [ ] User cannot toggle tasks belonging to other users (403)
- [ ] `updated_at` timestamp is automatically updated
- [ ] Success returns 200 with updated task object
- [ ] Task not found or doesn't belong to user returns 404

**Gherkin Scenario:**
```gherkin
Scenario: User marks task as complete
  Given user "alice@example.com" is logged in
  And user has task with id "task_123" and completed=false
  When user sends PATCH request to "/api/alice_id/tasks/task_123/complete" with body:
    """
    {
      "completed": true
    }
    """
  Then response status code is 200
  And task completed is true
  And task updated_at timestamp changed

Scenario: User toggles task completion without body
  Given user "alice@example.com" is logged in
  And user has task with id "task_123" and completed=false
  When user sends PATCH request to "/api/alice_id/tasks/task_123/complete"
  Then response status code is 200
  And task completed is true

Scenario: User toggles again
  Given task "task_123" has completed=true
  When user sends PATCH request to "/api/alice_id/tasks/task_123/complete"
  Then task completed is false
```

---

## 2. Pydantic Schemas

### 2.1 Request Schemas

**File:** `backend/app/schemas/task.py`

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    """Base task schema with common fields"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: str = Field("medium", pattern="^(low|medium|high)$")

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('title cannot be empty or whitespace only')
        return v.strip()

class TaskCreate(TaskBase):
    """Schema for creating a task"""
    pass

class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError('title cannot be empty or whitespace only')
        return v.strip() if v else v

    @field_validator('priority')
    @classmethod
    def priority_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ['low', 'medium', 'high']:
            raise ValueError('priority must be low, medium, or high')
        return v

class TaskToggleComplete(BaseModel):
    """Schema for toggling task completion"""
    completed: Optional[bool] = None  # If None, toggles current state
```

### 2.2 Response Schemas

```python
class TaskResponse(TaskBase):
    """Schema for task response"""
    id: str
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode

class TaskListResponse(BaseModel):
    """Schema for paginated task list"""
    tasks: list[TaskResponse]
    total: int
    limit: int
    offset: int
```

**Acceptance Criteria:**
- [ ] All schemas defined with Pydantic v2
- [ ] Validation rules enforced (min/max length, enum values)
- [ ] Custom validators for title (not empty, stripped)
- [ ] Response schemas match API contract from @specs/api/rest-endpoints.md

---

## 3. Route Handlers

### 3.1 File Structure

```
backend/app/api/
├── __init__.py
├── deps.py        # Dependencies (JWT verification)
├── tasks.py       # Task routes
└── health.py      # Health check endpoint
```

### 3.2 Task Routes

**File:** `backend/app/api/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select, col, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import uuid4
from datetime import datetime

from app.db.session import get_session
from app.api.deps import get_current_user
from app.models.task import Task
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskToggleComplete,
    TaskResponse,
    TaskListResponse,
)

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])

# ============================================================================
# GET /api/{user_id}/tasks - List user's tasks
# ============================================================================
@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, pattern="^(pending|completed|all)$"),
    sort_by: str = Query("created_at", pattern="^(created_at|title|priority|updated_at)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """
    List all tasks for the authenticated user.

    - **user_id**: User ID (must match JWT token)
    - **status**: Filter by status (pending, completed, all)
    - **sort_by**: Sort field (created_at, title, priority, updated_at)
    - **order**: Sort direction (asc, desc)
    - **limit**: Max results (1-1000)
    - **offset**: Pagination offset
    """
    # Enforce user isolation (middleware already does this, but double-check)
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    # Build query
    statement = select(Task).where(Task.user_id == user_id)

    # Filter by completion status
    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    # Sort
    sort_column = col(Task).c[sort_by]
    if order == "desc":
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(sort_column)

    # Get total count before pagination
    count_statement = select(Task).where(Task.user_id == user_id)
    if status_filter == "pending":
        count_statement = count_statement.where(Task.completed == False)
    elif status_filter == "completed":
        count_statement = count_statement.where(Task.completed == True)
    count_result = await session.exec(count_statement)
    total = len(count_result.all())

    # Apply pagination
    statement = statement.limit(limit).offset(offset)
    result = await session.exec(statement)
    tasks = result.all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        total=total,
        limit=limit,
        offset=offset,
    )


# ============================================================================
# POST /api/{user_id}/tasks - Create task
# ============================================================================
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
):
    """
    Create a new task for the authenticated user.

    - **user_id**: User ID (must match JWT token)
    - **task_data**: Task data (title required, description optional, priority optional)
    """
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    # Create task with UUID
    task = Task(
        id=str(uuid4()),
        user_id=user_id,
        **task_data.model_dump(),
    )

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskResponse.model_validate(task)


# ============================================================================
# GET /api/{user_id}/tasks/{task_id} - Get single task
# ============================================================================
@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: str,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
):
    """
    Get a single task by ID.

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    """
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.exec(statement)
    task = result.first_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or does not belong to this user"
        )

    return TaskResponse.model_validate(task)


# ============================================================================
# PUT /api/{user_id}/tasks/{task_id} - Update task
# ============================================================================
@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: str,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
):
    """
    Update a task's fields (partial update).

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    - **task_data**: Fields to update (all optional)
    """
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    # Ensure at least one field is provided
    if not task_data.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided"
        )

    # Get task (enforce ownership)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.exec(statement)
    task = result.first_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or does not belong to this user"
        )

    # Update only provided fields
    for field, value in task_data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    # Update timestamp
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return TaskResponse.model_validate(task)


# ============================================================================
# DELETE /api/{user_id}/tasks/{task_id} - Delete task
# ============================================================================
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: str,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
):
    """
    Delete a task permanently.

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    """
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    # Get task (enforce ownership)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.exec(statement)
    task = result.first_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or does not belong to this user"
        )

    await session.delete(task)
    await session.commit()

    return None


# ============================================================================
# PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion
# ============================================================================
@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_complete(
    user_id: str,
    task_id: str,
    toggle_data: Optional[TaskToggleComplete] = None,
    session: AsyncSession = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
):
    """
    Toggle or set task completion status.

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    - **toggle_data**: Optional {"completed": true/false}
    """
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch"
        )

    # Get task (enforce ownership)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.exec(statement)
    task = result.first_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or does not belong to this user"
        )

    # Toggle or set completion status
    if toggle_data and toggle_data.completed is not None:
        task.completed = toggle_data.completed
    else:
        task.completed = not task.completed  # Toggle

    # Update timestamp
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return TaskResponse.model_validate(task)
```

**Acceptance Criteria:**
- [ ] All 5 CRUD endpoints implemented
- [ ] All routes use dependency injection for JWT verification
- [ ] All routes enforce user isolation (double-check ownership)
- [ ] All routes return appropriate HTTP status codes
- [ ] All routes use Pydantic schemas for validation
- [ ] All routes handle errors with HTTPException

---

## 4. Dependency Injection

### 4.1 JWT Verification Dependency

**File:** `backend/app/api/deps.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWTError
import os

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verify JWT token and extract user_id.

    Returns:
        str: user_id from JWT payload

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        # Decode JWT (implementation in @specs/authentication-backend.md)
        from app.core.security import decode_jwt
        payload = decode_jwt(token)
        user_id = payload.get("sub") or payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing user_id"
            )

        return user_id

    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
```

**Acceptance Criteria:**
- [ ] Extracts Bearer token from Authorization header
- [ ] Verifies JWT signature with BETTER_AUTH_SECRET
- [ ] Decodes payload and extracts user_id
- [ ] Raises 401 if token is missing, invalid, or expired
- [ ] Returns user_id as string for route handlers

---

## 5. Error Handling

### 5.1 HTTPException Responses

All errors use FastAPI's `HTTPException` with consistent format:

```python
# 400 Bad Request - Validation error
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Validation error: title is required (min_length=1, max_length=200)"
)

# 401 Unauthorized - Invalid token
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Missing or invalid authorization token"
)

# 403 Forbidden - User ID mismatch
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="User ID mismatch: token user_id does not match path user_id"
)

# 404 Not Found - Task not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Task not found or does not belong to this user"
)
```

### 5.2 Global Exception Handler

**File:** `backend/app/core/errors.py`

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """Handle Pydantic validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )

async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

async def general_exception_handler(
    request: Request,
    exc: Exception,
):
    """Handle unexpected errors"""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
```

**Register in main.py:**
```python
from fastapi import FastAPI
from app.core.errors import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
)
from fastapi.exceptions import RequestValidationError

app = FastAPI()
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)
```

**Acceptance Criteria:**
- [ ] Validation errors return 422 with detailed error messages
- [ ] HTTP exceptions return consistent JSON format
- [ ] Unexpected errors return 500 with generic message
- [ ] Errors are logged for debugging

---

## 6. Testing Strategy

### 6.1 Unit Tests

**File:** `backend/tests/test_tasks_crud.py`

```python
import pytest
from httpx import AsyncClient
from sqlmodel import Session
from app.models.task import Task
from app.models.user import User

@pytest.mark.asyncio
async def test_create_task(client: AsyncClient, session: Session, auth_headers: dict):
    """Test creating a task"""
    response = await client.post(
        "/api/user_123/tasks",
        json={
            "title": "Test task",
            "description": "Test description",
            "priority": "high"
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert data["user_id"] == "user_123"
    assert data["completed"] is False
    assert "id" in data
    assert "created_at" in data

@pytest.mark.asyncio
async def test_create_task_validation_error(client: AsyncClient, auth_headers: dict):
    """Test creating a task with invalid data"""
    response = await client.post(
        "/api/user_123/tasks",
        json={"title": ""},  # Empty title
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert "title" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_list_tasks(client: AsyncClient, auth_headers: dict, session: Session):
    """Test listing user's tasks"""
    # Create test tasks
    task1 = Task(id="1", user_id="user_123", title="Task 1", completed=False)
    task2 = Task(id="2", user_id="user_123", title="Task 2", completed=True)
    session.add(task1)
    session.add(task2)
    await session.commit()

    response = await client.get(
        "/api/user_123/tasks",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["tasks"]) == 2

@pytest.mark.asyncio
async def test_update_task(client: AsyncClient, auth_headers: dict, session: Session):
    """Test updating a task"""
    task = Task(id="1", user_id="user_123", title="Old title")
    session.add(task)
    await session.commit()

    response = await client.put(
        "/api/user_123/tasks/1",
        json={"title": "New title"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New title"

@pytest.mark.asyncio
async def test_delete_task(client: AsyncClient, auth_headers: dict, session: Session):
    """Test deleting a task"""
    task = Task(id="1", user_id="user_123", title="To delete")
    session.add(task)
    await session.commit()

    response = await client.delete(
        "/api/user_123/tasks/1",
        headers=auth_headers,
    )

    assert response.status_code == 204

@pytest.mark.asyncio
async def test_toggle_task_complete(client: AsyncClient, auth_headers: dict, session: Session):
    """Test toggling task completion"""
    task = Task(id="1", user_id="user_123", title="Task", completed=False)
    session.add(task)
    await session.commit()

    response = await client.patch(
        "/api/user_123/tasks/1/complete",
        json={"completed": True},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True

@pytest.mark.asyncio
async def test_user_isolation(client: AsyncClient, session: Session, auth_headers_user1: dict):
    """Test that users cannot access each other's tasks"""
    # Create task for user_1
    task = Task(id="1", user_id="user_1", title="User 1 task")
    session.add(task)
    await session.commit()

    # Try to access as user_2
    response = await client.get(
        "/api/user_2/tasks/1",
        headers=auth_headers_user2,  # Different user
    )

    assert response.status_code == 404
```

**Acceptance Criteria:**
- [ ] Unit tests for all 5 CRUD operations
- [ ] Unit tests for validation errors
- [ ] Unit tests for user isolation
- [ ] Unit tests for authentication/authorization
- [ ] Tests use pytest-asyncio for async routes
- [ ] Tests use httpx for async HTTP client

---

## 7. Cross-References

**Related Specifications:**
- @constitution.md Section 1.3 – Core features (5 CRUD operations)
- @constitution.md Section 2.4 – User isolation enforcement
- @specs/api/rest-endpoints.md – API endpoint contracts
- @specs/database/schema.md – Task model and queries
- @specs/authentication-backend.md – JWT verification dependency

**Skills to Use:**
- `fastapi-jwt-middleware-neon` – JWT verification middleware
- `sqlmodel-user-isolation` – Enforce user_id filtering

**Implementation Files:**
- `backend/app/api/tasks.py` – Task route handlers
- `backend/app/schemas/task.py` – Pydantic schemas
- `backend/app/models/task.py` – SQLModel Task class
- `backend/app/api/deps.py` – JWT verification dependency
- `backend/app/core/errors.py` – Error handlers

---

**End of specs/features/task-crud-backend.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
