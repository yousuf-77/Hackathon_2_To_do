"""Pytest configuration and fixtures."""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from typing import AsyncGenerator

from app.main import app
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.core.security import create_test_token
from sqlmodel import SQLModel


# Test database URL (can use same Neon DB for testing)
# Note: asyncpg doesn't support sslmode in URL, SSL is enabled by default for Neon
TEST_DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_Wo4kT5FNPYwI@ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech/neondb"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async with TestSessionLocal() as session:
        yield session
        # Cleanup: rollback all changes to keep DB clean
        await session.rollback()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test HTTP client."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers() -> dict:
    """Create authorization headers for test user."""
    token = create_test_token("test-user-123")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_user2() -> dict:
    """Create authorization headers for second test user."""
    token = create_test_token("test-user-456")
    return {"Authorization": f"Bearer {token}"}
