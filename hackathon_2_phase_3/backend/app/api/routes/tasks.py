"""Task CRUD endpoints with JWT authentication."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import uuid4
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user, get_current_user_enforce_path
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
    session: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user_enforce_path),
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
    # Build query with user isolation (NON-NEGOTIABLE)
    statement = select(Task).where(Task.user_id == user_id)

    # Filter by completion status
    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    # Get total count before pagination
    count_statement = select(Task).where(Task.user_id == user_id)
    if status_filter == "pending":
        count_statement = count_statement.where(Task.completed == False)
    elif status_filter == "completed":
        count_statement = count_statement.where(Task.completed == True)
    count_result = await session.execute(count_statement)
    total = len(count_result.all())

    # Sort
    sort_column = getattr(Task, sort_by)
    if order == "desc":
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(sort_column)

    # Apply pagination
    statement = statement.limit(limit).offset(offset)
    result = await session.scalars(statement)
    tasks = list(result.all())

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
    session: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user_enforce_path),
):
    """
    Create a new task for the authenticated user.

    - **user_id**: User ID (must match JWT token)
    - **task_data**: Task data (title required, description optional, priority optional)
    """
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
    session: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user_enforce_path),
):
    """
    Get a single task by ID.

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    """
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.scalars(statement)
    task = result.first()

    if task is None:
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
    session: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user_enforce_path),
):
    """
    Update a task's fields (partial update).

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    - **task_data**: Fields to update (all optional)
    """
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
    result = await session.scalars(statement)
    task = result.first()

    if task is None:
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
    session: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user_enforce_path),
):
    """
    Delete a task permanently.

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    """
    # Get task (enforce ownership)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.scalars(statement)
    task = result.first()

    if task is None:
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
    session: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_user_enforce_path),
):
    """
    Toggle or set task completion status.

    - **user_id**: User ID (must match JWT token)
    - **task_id**: Task ID (UUID)
    - **toggle_data**: Optional {"completed": true/false}
    """
    # Get task (enforce ownership)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )
    result = await session.scalars(statement)
    task = result.first()

    if task is None:
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
