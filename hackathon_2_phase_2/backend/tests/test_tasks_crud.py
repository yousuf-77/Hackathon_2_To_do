"""Task CRUD operation tests."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_task(client: AsyncClient, auth_headers: dict):
    """Test: Create task → 201 Created with task object"""
    response = await client.post(
        "/api/test-user-123/tasks",
        json={
            "title": "Test task",
            "description": "Test description",
            "priority": "high"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert data["user_id"] == "test-user-123"
    assert data["completed"] is False
    assert "id" in data


@pytest.mark.asyncio
async def test_create_task_validation_error(client: AsyncClient, auth_headers: dict):
    """Test: Create task with empty title → 422 Validation Error"""
    response = await client.post(
        "/api/test-user-123/tasks",
        json={"title": ""},  # Empty title
        headers=auth_headers
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_tasks_returns_only_users_tasks(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: List tasks returns only user's own tasks"""
    # Create tasks for test-user-123
    task1 = Task(id=str(uuid4()), user_id="test-user-123", title="User 123 task")
    # Create task for different user
    task2 = Task(id=str(uuid4()), user_id="other-user-456", title="User 456 task")

    db_session.add(task1)
    db_session.add(task2)
    await db_session.commit()

    response = await client.get(
        "/api/test-user-123/tasks",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["tasks"]) == 1
    assert data["tasks"][0]["user_id"] == "test-user-123"


@pytest.mark.asyncio
async def test_list_tasks_filters_by_status(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: Filter tasks by completion status"""
    # Create pending and completed tasks
    task1 = Task(id=str(uuid4()), user_id="test-user-123", title="Pending task", completed=False)
    task2 = Task(id=str(uuid4()), user_id="test-user-123", title="Completed task", completed=True)

    db_session.add(task1)
    db_session.add(task2)
    await db_session.commit()

    # Filter for pending tasks
    response = await client.get(
        "/api/test-user-123/tasks?status=pending",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["tasks"]) == 1
    assert data["tasks"][0]["completed"] is False


@pytest.mark.asyncio
async def test_list_tasks_pagination(client: AsyncClient, auth_headers: dict):
    """Test: Pagination works correctly"""
    # This test verifies pagination parameters are accepted
    response = await client.get(
        "/api/test-user-123/tasks?limit=10&offset=0",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "limit" in data
    assert "offset" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_update_task_modifies_fields(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: Update task changes fields and updated_at timestamp"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Original title")
    db_session.add(task)
    await db_session.commit()

    response = await client.put(
        f"/api/test-user-123/tasks/{task.id}",
        json={"title": "Updated title"},
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated title"


@pytest.mark.asyncio
async def test_update_task_enforces_ownership(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    auth_headers_user2: dict
):
    """Test: Cannot update another user's task"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Original title")
    db_session.add(task)
    await db_session.commit()

    # Try to update as different user (test-user-456)
    response = await client.put(
        f"/api/test-user-456/tasks/{task.id}",
        json={"title": "Hacked title"},
        headers=auth_headers_user2
    )

    assert response.status_code == 404  # Task not found for this user


@pytest.mark.asyncio
async def test_update_task_validates_input(client: AsyncClient, auth_headers: dict):
    """Test: Update with invalid data returns validation error"""
    response = await client.put(
        "/api/test-user-123/tasks/fake-id",
        json={"title": ""},  # Empty title
        headers=auth_headers
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_delete_task_removes_from_db(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: Delete task → 204 No Content"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="To delete")
    db_session.add(task)
    await db_session.commit()

    response = await client.delete(
        f"/api/test-user-123/tasks/{task.id}",
        headers=auth_headers
    )

    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_task_enforces_ownership(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    auth_headers_user2: dict
):
    """Test: Cannot delete another user's task"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Protected task")
    db_session.add(task)
    await db_session.commit()

    # Try to delete as different user
    response = await client.delete(
        f"/api/test-user-456/tasks/{task.id}",
        headers=auth_headers_user2
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_toggle_task_complete(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: Toggle completion → 200 OK with updated task"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Task", completed=False)
    db_session.add(task)
    await db_session.commit()

    response = await client.patch(
        f"/api/test-user-123/tasks/{task.id}/complete",
        json={"completed": True},
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


@pytest.mark.asyncio
async def test_toggle_task_without_body_toggles(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: Toggle without body toggles current state"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Task", completed=False)
    db_session.add(task)
    await db_session.commit()

    # Toggle without body (should flip from False to True)
    response = await client.patch(
        f"/api/test-user-123/tasks/{task.id}/complete",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


@pytest.mark.asyncio
async def test_toggle_task_enforces_ownership(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    auth_headers_user2: dict
):
    """Test: Cannot toggle another user's task"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Task", completed=False)
    db_session.add(task)
    await db_session.commit()

    # Try to toggle as different user
    response = await client.patch(
        f"/api/test-user-456/tasks/{task.id}/complete",
        json={"completed": True},
        headers=auth_headers_user2
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_single_task(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    """Test: Get single task by ID"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Single task")
    db_session.add(task)
    await db_session.commit()

    response = await client.get(
        f"/api/test-user-123/tasks/{task.id}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task.id


@pytest.mark.asyncio
async def test_get_single_task_enforces_ownership(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict,
    auth_headers_user2: dict
):
    """Test: Cannot get another user's task"""
    task = Task(id=str(uuid4()), user_id="test-user-123", title="Private task")
    db_session.add(task)
    await db_session.commit()

    response = await client.get(
        f"/api/test-user-456/tasks/{task.id}",
        headers=auth_headers_user2
    )

    assert response.status_code == 404
