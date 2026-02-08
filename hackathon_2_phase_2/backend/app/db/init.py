"""Database initialization utilities."""
import asyncio
from sqlmodel import SQLModel
from app.db.session import async_engine
from app.models.task import Task
from app.models.user import User


async def init_db() -> None:
    """
    Create all database tables.

    This function is idempotent – safe to run multiple times.
    Uses SQLModel metadata.create_all() which respects IF NOT EXISTS.
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def reset_db() -> None:
    """
    Drop and recreate all tables.

    WARNING: This deletes all data! Only use in development.
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)


if __name__ == "__main__":
    import sys

    if "--reset" in sys.argv:
        print("Resetting database (dropping and recreating tables)...")
        asyncio.run(reset_db())
    else:
        print("Initializing database (creating tables if not exist)...")
        asyncio.run(init_db())

    print("Database initialization complete.")
