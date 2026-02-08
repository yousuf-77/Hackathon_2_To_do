"""Authentication and authorization flow tests."""
import pytest
from httpx import AsyncClient
from app.core.security import create_test_token
from datetime import timedelta


@pytest.mark.asyncio
async def test_valid_token_allows_access(client: AsyncClient):
    """Test: Valid token + matching user_id → 200 OK"""
    token = create_test_token("user-abc")

    response = await client.get(
        "/api/user-abc/tasks",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_invalid_token_returns_401(client: AsyncClient):
    """Test: Invalid token → 401 Unauthorized"""
    response = await client.get(
        "/api/user-abc/tasks",
        headers={"Authorization": "Bearer invalid.token.here"}
    )

    assert response.status_code == 401
    assert "detail" in response.json()


@pytest.mark.asyncio
async def test_user_id_mismatch_returns_403(client: AsyncClient):
    """Test: Valid token but wrong user_id in path → 403 Forbidden"""
    token = create_test_token("user-abc")

    response = await client.get(
        "/api/user-xyz/tasks",  # Different user_id
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403
    assert "User ID mismatch" in response.json()["detail"]


@pytest.mark.asyncio
async def test_no_token_returns_403(client: AsyncClient):
    """Test: No Authorization header → 403 (HTTPBearer requirement)"""
    response = await client.get("/api/user-abc/tasks")

    assert response.status_code == 403  # HTTPBearer raises this


@pytest.mark.asyncio
async def test_expired_token_returns_401(client: AsyncClient):
    """Test: Expired token → 401 Unauthorized"""
    # Create token that expired 1 day ago
    token = create_test_token("user-abc", expires_delta=timedelta(days=-1))

    response = await client.get(
        "/api/user-abc/tasks",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()
