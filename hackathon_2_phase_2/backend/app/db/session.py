"""Database session management with async SQLAlchemy engine."""
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Convert DATABASE_URL to async format (replace postgresql:// with postgresql+asyncpg://)
ASYNC_DATABASE_URL = settings.database_url.replace(
    "postgresql://",
    "postgresql+asyncpg://",
)

# Create async engine
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.environment == "development",  # Log SQL in dev
    pool_size=10,                  # Max connections in pool
    max_overflow=20,               # Additional connections under load
    pool_pre_ping=True,            # Verify connections before use
    pool_recycle=3600,             # Recycle connections after 1 hour
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,        # Prevent accidental lazy loading
    autocommit=False,
    autoflush=True,
)


# Dependency for FastAPI routes
async def get_db() -> AsyncSession:
    """
    Yield database session with context manager.

    Usage:
        @router.get("/api/{user_id}/tasks")
        async def list_tasks(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session
