"""
MCP Todo CRUD Tools for Phase 3 Chatbot
Secure, JWT-authenticated tools with real database integration
"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import select, Session
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from app.mcp.server import mcp, get_request_context
from app.models import Task
from app.db.session import AsyncSessionLocal


@mcp.tool()
async def add_task(
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
) -> dict:
    """Add a new task for the authenticated user

    Args:
        title: Task title (required, max 200 chars)
        description: Task description (optional, max 1000 chars)
        priority: Task priority - 'low', 'medium', or 'high' (default: 'medium')

    Returns:
        Created task with id, title, description, priority, completed status, and timestamps

    Raises:
        ValueError: If user is not authenticated or priority is invalid
    """
    async with AsyncSessionLocal() as session:
        try:
            # Get authenticated user_id from JWT context
            user_id = get_request_context().get_user_id()

            # Validate priority
            valid_priorities = ["low", "medium", "high"]
            if priority not in valid_priorities:
                raise ValueError(f"Invalid priority: {priority}. Must be one of {valid_priorities}")

            # Create new task with UUID
            task = Task(
                id=str(uuid4()),
                user_id=str(user_id),
                title=title,
                description=description,
                priority=priority,
                completed=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            # Save to database
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
                    "user_id": task.user_id,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                },
                "message": f"Task '{title}' created successfully",
            }

        except ValueError as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create task: {str(e)}",
            }
        except Exception as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error creating task: {str(e)}",
            }


@mcp.tool()
async def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
) -> dict:
    """List tasks for the authenticated user with optional filters

    Args:
        status: Filter by status - 'pending' or 'completed' (optional)
        priority: Filter by priority - 'low', 'medium', or 'high' (optional)
        limit: Maximum number of tasks to return (default: 50, max: 100)

    Returns:
        List of tasks matching filters

    Raises:
        ValueError: If user is not authenticated or filters are invalid
    """
    async with AsyncSessionLocal() as session:
        try:
            # Get authenticated user_id from JWT context
            user_id = get_request_context().get_user_id()

            # Validate limit
            if limit < 1 or limit > 100:
                raise ValueError("Limit must be between 1 and 100")

            # Build query with user isolation (NON-NEGOTIABLE)
            statement = select(Task).where(Task.user_id == str(user_id))

            # Filter by status
            if status == "pending":
                statement = statement.where(Task.completed == False)
            elif status == "completed":
                statement = statement.where(Task.completed == True)

            # Filter by priority
            if priority and priority in ["low", "medium", "high"]:
                statement = statement.where(Task.priority == priority)

            # Order by created_at descending
            statement = statement.order_by(Task.created_at.desc())

            # Apply limit
            statement = statement.limit(limit)

            # Execute query
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
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                    }
                    for task in tasks
                ],
                "count": len(tasks),
                "filters": {
                    "status": status,
                    "priority": priority,
                    "limit": limit,
                },
                "message": f"Retrieved {len(tasks)} tasks",
            }

        except ValueError as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to list tasks: {str(e)}",
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error listing tasks: {str(e)}",
            }


@mcp.tool()
async def get_task(task_id: str) -> dict:
    """Get a specific task by ID for the authenticated user

    Args:
        task_id: Task ID (UUID string)

    Returns:
        Task details if found and belongs to user

    Raises:
        ValueError: If user is not authenticated or task not found
    """
    async with AsyncSessionLocal() as session:
        try:
            # Get authenticated user_id from JWT context
            user_id = get_request_context().get_user_id()

            # Build query with user isolation
            statement = select(Task).where(
                Task.id == task_id,
                Task.user_id == str(user_id),
            )

            result = await session.scalars(statement)
            task = result.first()

            if not task:
                raise ValueError(f"Task {task_id} not found")

            return {
                "success": True,
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                },
                "message": f"Retrieved task {task_id}",
            }

        except ValueError as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get task: {str(e)}",
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error getting task: {str(e)}",
            }


@mcp.tool()
async def update_task(
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    completed: Optional[bool] = None,
) -> dict:
    """Update an existing task for the authenticated user

    Args:
        task_id: Task ID (UUID string)
        title: New title (optional, max 200 chars)
        description: New description (optional, max 1000 chars)
        priority: New priority - 'low', 'medium', or 'high' (optional)
        completed: New completion status (optional)

    Returns:
        Updated task details

    Raises:
        ValueError: If user is not authenticated, task not found, or invalid values
    """
    async with AsyncSessionLocal() as session:
        try:
            # Get authenticated user_id from JWT context
            user_id = get_request_context().get_user_id()

            # Validate priority if provided
            if priority is not None and priority not in ["low", "medium", "high"]:
                raise ValueError("Invalid priority: must be 'low', 'medium', or 'high'")

            # Get task with user isolation
            statement = select(Task).where(
                Task.id == task_id,
                Task.user_id == str(user_id),
            )

            result = await session.scalars(statement)
            task = result.first()

            if not task:
                raise ValueError(f"Task {task_id} not found")

            # Update fields
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if priority is not None:
                task.priority = priority
            if completed is not None:
                task.completed = completed

            # Update timestamp
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
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                },
                "message": f"Task {task_id} updated successfully",
            }

        except ValueError as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update task: {str(e)}",
            }
        except Exception as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error updating task: {str(e)}",
            }


@mcp.tool()
async def delete_task(task_id: str) -> dict:
    """Delete a task for the authenticated user

    Args:
        task_id: Task ID (UUID string)

    Returns:
        Success message

    Raises:
        ValueError: If user is not authenticated or task not found
    """
    async with AsyncSessionLocal() as session:
        try:
            # Get authenticated user_id from JWT context
            user_id = get_request_context().get_user_id()

            # Get task with user isolation
            statement = select(Task).where(
                Task.id == task_id,
                Task.user_id == str(user_id),
            )

            result = await session.scalars(statement)
            task = result.first()

            if not task:
                raise ValueError(f"Task {task_id} not found")

            # Delete task
            await session.delete(task)
            await session.commit()

            return {
                "success": True,
                "task_id": task_id,
                "message": f"Task {task_id} deleted successfully",
            }

        except ValueError as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to delete task: {str(e)}",
            }
        except Exception as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error deleting task: {str(e)}",
            }


@mcp.tool()
async def complete_task(task_id: str) -> dict:
    """Mark a task as completed for the authenticated user

    Args:
        task_id: Task ID (UUID string)

    Returns:
        Updated task with completed=True status

    Raises:
        ValueError: If user is not authenticated or task not found
    """
    async with AsyncSessionLocal() as session:
        try:
            # Get authenticated user_id from JWT context
            user_id = get_request_context().get_user_id()

            # Get task with user isolation
            statement = select(Task).where(
                Task.id == task_id,
                Task.user_id == str(user_id),
            )

            result = await session.scalars(statement)
            task = result.first()

            if not task:
                raise ValueError(f"Task {task_id} not found")

            # Mark as completed
            task.completed = True
            task.updated_at = datetime.utcnow()

            await session.commit()
            await session.refresh(task)

            return {
                "success": True,
                "task": {
                    "id": task.id,
                    "completed": task.completed,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                },
                "message": f"Task {task_id} marked as completed",
            }

        except ValueError as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to complete task: {str(e)}",
            }
        except Exception as e:
            await session.rollback()
            return {
                "success": False,
                "error": str(e),
                "message": f"Unexpected error completing task: {str(e)}",
            }


# Export all tools for registration
__all__ = [
    "add_task",
    "list_tasks",
    "get_task",
    "update_task",
    "delete_task",
    "complete_task",
]
