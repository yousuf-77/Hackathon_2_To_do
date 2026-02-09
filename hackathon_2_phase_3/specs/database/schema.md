# specs/database/schema.md

## Database Schema Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 2.4, @specs/api/rest-endpoints.md

---

## Overview

Define the database schema for the Hackathon II Phase II Todo Full-Stack Web Application using SQLModel (built on Pydantic + SQLAlchemy) with Neon PostgreSQL.

**Database Provider:** Neon Serverless PostgreSQL (PostgreSQL 16+)
**ORM:** SQLModel (async)
**Connection Pooling:** SQLAlchemy async engine with `asyncpg`
**Migrations:** Manual SQL or Alembic (TBD)

---

## 1. Database Connection

### 1.1 Environment Variables

**Required Variables:**
```bash
# .env (backend root)
DATABASE_URL=postgresql://neondb_owner:npg_Wo4kT5FNPYwI@ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Connection String Parameters:**
- `sslmode=require` – Enforce SSL/TLS connection
- `channel_binding=require` – Secure channel binding
- Pooler: Neon's connection pooler (recommended for serverless)

### 1.2 Async Engine Configuration

**File:** `backend/app/db/session.py`

```python
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Async engine for production
async_engine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=True,  # Log SQL queries (set False in production)
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
)

# Async session maker
AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Dependency for FastAPI
async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

**Acceptance Criteria:**
- [ ] Async engine configured with `postgresql+asyncpg://`
- [ ] Connection pooling enabled (pool_size=10, max_overflow=20)
- [ ] Session factory with `expire_on_commit=False`
- [ ] Dependency injection function for FastAPI routes

---

## 2. Tables & Models

### 2.1 Users Table (Managed by Better Auth)

**Note:** Better Auth manages the `user` table on the frontend. The backend only needs to reference `user_id` as a foreign key.

**Expected Schema (Frontend):**
```sql
-- Table: user (managed by Better Auth)
CREATE TABLE user (
    id VARCHAR(255) PRIMARY KEY,  -- UUID as string
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_email ON user(email);
```

**Backend Reference:**
```python
# File: backend/app/models/user.py
from sqlmodel import Field, SQLModel
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "user"  # Matches Better Auth table name

    id: str = Field(default=None, primary_key=True)  # UUID string
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: Optional[str] = Field(default=None)  # Read-only
    updated_at: Optional[str] = Field(default=None)  # Read-only
```

**Important:**
- Backend does **NOT** create/update/delete users
- Backend only references `user.id` as foreign key in tasks
- Better Auth handles all user CRUD operations

---

### 2.2 Tasks Table

**Schema:**
```sql
-- Table: task
CREATE TABLE task (
    id VARCHAR(255) PRIMARY KEY,  -- UUID string
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES user(id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_completed ON task(user_id, completed);
CREATE INDEX idx_task_created_at ON task(user_id, created_at DESC);

-- Composite index for user's pending tasks sorted by priority
CREATE INDEX idx_task_user_pending_priority
    ON task(user_id, completed, priority DESC)
    WHERE completed = FALSE;
```

**SQLModel:**
```python
# File: backend/app/models/task.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class TaskBase(SQLModel):
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium", max_length=10)  # low, medium, high
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    __tablename__ = "task"

    id: Optional[str] = Field(default=None, primary_key=True)  # UUID
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    # Relationship (optional, for JOIN queries)
    user: Optional["User"] = Relationship(back_populates="tasks")
```

**Field Descriptions:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | VARCHAR(255) | PRIMARY KEY | Unique task identifier (UUID string) |
| `user_id` | VARCHAR(255) | NOT NULL, FK, INDEX | Foreign key to `user.id` |
| `title` | VARCHAR(200) | NOT NULL | Task title (1-200 chars) |
| `description` | TEXT | NULLABLE | Task description (max 1000 chars) |
| `priority` | VARCHAR(10) | DEFAULT 'medium' | Priority level: 'low', 'medium', 'high' |
| `completed` | BOOLEAN | DEFAULT FALSE | Completion status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- `id`: Primary key, UUID v4 string format
- `user_id`: Foreign key to `user.id`, ON DELETE CASCADE
- `title`: Required, max 200 characters
- `priority`: ENUM check constraint (low/medium/high)

**Indexes:**
1. `idx_task_user_id` – Optimize user-scoped queries
2. `idx_task_completed` – Optimize status filtering
3. `idx_task_created_at` – Optimize sorting by date
4. `idx_task_user_pending_priority` – Composite for "pending tasks sorted by priority"

**Acceptance Criteria:**
- [ ] Task model defined with all fields
- [ ] Foreign key to `user.id` with CASCADE delete
- [ ] Indexes created on `user_id`, `completed`, `created_at`
- [ ] Composite index for user's pending tasks
- [ ] Check constraint on `priority` values

---

## 3. Database Initialization

### 3.1 Create Tables

**File:** `backend/app/db/init.py`

```python
import asyncio
from sqlmodel import SQLModel
from app.db.session import async_engine
from app.models.user import User
from app.models.task import Task

async def init_db():
    """Create all tables (idempotent)"""
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def reset_db():
    """Drop and recreate all tables (DEV ONLY)"""
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())
```

**Usage:**
```bash
# Create tables (idempotent)
python -m app.db.init

# Reset database (DEV ONLY)
python -m app.db.init --reset
```

**Acceptance Criteria:**
- [ ] Tables are created idempotently
- [ ] Foreign keys are enforced
- [ ] Indexes are created
- [ ] Default values are set

---

## 4. Migration Strategy

### 4.1 Option A: Manual SQL (Simple)

**Approach:** Use raw SQL for schema changes in Phase II

**Migration Files:**
```
backend/migrations/
├── 001_initial_schema.sql
├── 002_add_priority_index.sql
└── 003_add_description_length.sql
```

**Example:**
```sql
-- File: backend/migrations/001_initial_schema.sql
CREATE TABLE IF NOT EXISTS task (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
CREATE INDEX IF NOT EXISTS idx_task_completed ON task(user_id, completed);
```

**Run Migration:**
```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

**Acceptance Criteria:**
- [ ] SQL migrations in versioned files
- [ ] Migrations are idempotent (IF NOT EXISTS)
- [ ] Migration history is tracked

---

### 4.2 Option B: Alembic (Recommended for Production)

**Approach:** Use Alembic for automated migrations

**Setup:**
```bash
cd backend
alembic init alembic
```

**Configuration:** `alembic.ini`
```ini
[alembic]
sqlalchemy.url = postgresql://neondb_owner:...@ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech/neondb

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

**Env:** `alembic/env.py`
```python
from logging.config import fileConfig
from sqlalchemy import pool
from sqlmodel import SQLModel
from alembic import context
import sys
import os

sys.path.insert(0, os.getcwd())

from app.db.session import async_engine
from app.models import User, Task  # Import all models

config = context.config
fileConfig(config.config_file_name)
target_metadata = SQLModel.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    async def run_async_migration():
        async with async_engine.connect() as conn:
            await conn.run_sync(do_run_migrations)

    def do_run_migrations(connection):
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

    asyncio.run(run_async_migration())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Create Migration:**
```bash
alembic revision --autogenerate -m "Initial schema"
```

**Run Migration:**
```bash
alembic upgrade head
```

**Acceptance Criteria:**
- [ ] Alembic configured
- [ ] Initial migration created
- [ ] Migrations can be upgraded/downgraded
- [ ] Auto-generation works

---

## 5. Query Patterns

### 5.1 User-Scoped Queries

**CRITICAL:** All queries MUST filter by `user_id`

```python
# ✅ CORRECT
from sqlmodel import select
from app.models.task import Task

async def get_user_tasks(session: AsyncSession, user_id: str):
    """Get all tasks for a specific user"""
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.exec(statement)
    return result.all()

# ❌ WRONG – Returns all users' tasks (SECURITY VIOLATION)
async def get_all_tasks(session: AsyncSession):
    statement = select(Task)
    result = await session.exec(statement)
    return result.all()
```

### 5.2 Pagination

```python
async def get_user_tasks_paginated(
    session: AsyncSession,
    user_id: str,
    limit: int = 100,
    offset: int = 0,
):
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .limit(limit)
        .offset(offset)
    )
    result = await session.exec(statement)
    return result.all()
```

### 5.3 Filtering & Sorting

```python
from sqlmodel import col, desc

async def get_user_tasks_filtered(
    session: AsyncSession,
    user_id: str,
    completed: bool | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
):
    statement = select(Task).where(Task.user_id == user_id)

    # Filter by completion status
    if completed is not None:
        statement = statement.where(Task.completed == completed)

    # Sort
    sort_column = col(Task).c[sort_by]
    if order == "desc":
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(sort_column)

    result = await session.exec(statement)
    return result.all()
```

### 5.4 Create Task

```python
from uuid import uuid4

async def create_task(
    session: AsyncSession,
    user_id: str,
    task_data: TaskCreate,
):
    task = Task(
        id=str(uuid4()),  # Generate UUID
        user_id=user_id,
        **task_data.dict(),
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

### 5.5 Update Task

```python
async def update_task(
    session: AsyncSession,
    task_id: str,
    user_id: str,
    task_data: TaskUpdate,
):
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,  # Critical: enforce ownership
    )
    result = await session.exec(statement)
    task = result.first()

    if not task:
        return None  # Task not found or doesn't belong to user

    # Update only provided fields
    for field, value in task_data.dict(exclude_unset=True).items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(task)
    return task
```

### 5.6 Delete Task

```python
async def delete_task(
    session: AsyncSession,
    task_id: str,
    user_id: str,
):
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,  # Critical: enforce ownership
    )
    result = await session.exec(statement)
    task = result.first()

    if not task:
        return False  # Task not found or doesn't belong to user

    await session.delete(task)
    await session.commit()
    return True
```

---

## 6. Database Constraints

### 6.1 Check Constraints

**Priority ENUM:**
```sql
ALTER TABLE task
ADD CONSTRAINT chk_priority
CHECK (priority IN ('low', 'medium', 'high'));
```

**Title Length:**
```sql
ALTER TABLE task
ADD CONSTRAINT chk_title_length
CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200);
```

### 6.2 Trigger: Update Timestamp

**Automatically update `updated_at` on row modification:**

```sql
-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: task_updated_at
CREATE TRIGGER task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 7. Performance Optimization

### 7.1 Connection Pooling

**Configuration:**
```python
async_engine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    pool_size=10,        # Max connections in pool
    max_overflow=20,     # Additional connections under load
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,   # Recycle connections after 1 hour
)
```

### 7.2 Query Optimization

**Use EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM task
WHERE user_id = 'abc123'
  AND completed = FALSE
ORDER BY priority DESC;
```

**Expected Output:**
```
Index Scan using idx_task_user_pending_priority on task  (cost=0.28..8.30 rows=10)
  Index Cond: (user_id = 'abc123')
  Filter: (completed = FALSE)
```

### 7.3 N+1 Query Prevention

**Use Eager Loading (JOIN):**
```python
from sqlmodel import selectinload

# Eager load user relationship
statement = select(Task).options(selectinload(Task.user))
result = await session.exec(statement)
tasks = result.all()
```

---

## 8. Backup & Recovery

### 8.1 Neon Automatic Backups

Neon provides automated backups:
- **Point-in-Time Recovery (PITR):** Restore any point within 7 days
- **Branching:** Create database branches for testing
- **Retention:** 7 days (free tier)

**Restore from Backup:**
```bash
# Via Neon CLI
neon databases restore neondb --timestamp 2025-02-08T12:00:00Z

# Via Dashboard
1. Go to Neon dashboard
2. Select database
3. Click "Restore"
4. Choose timestamp
```

### 8.2 Export Data

**Dump to SQL:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Dump to CSV:**
```sql
COPY task TO '/tmp/tasks.csv' CSV HEADER;
```

---

## 9. Cross-References

**Related Specifications:**
- @constitution.md Section 2.4 – User isolation enforcement
- @constitution.md Section 3.3 – Database principles
- @specs/api/rest-endpoints.md – API endpoints that use these models
- @specs/features/task-crud-backend.md – CRUD operations
- @specs/authentication-backend.md – User model references

**Implementation Files:**
- `backend/app/models/user.py` – User model (read-only reference)
- `backend/app/models/task.py` – Task model
- `backend/app/db/session.py` – Database connection
- `backend/app/db/init.py` – Database initialization
- `backend/app/crud/task.py` – CRUD query functions

---

## 10. Testing Checklist

### 10.1 Schema Tests
- [ ] Tables created successfully
- [ ] Foreign keys enforced (user_id)
- [ ] Indexes created (user_id, completed, created_at)
- [ ] Check constraints work (priority, title length)

### 10.2 Query Tests
- [ ] User-scoped queries return only user's tasks
- [ ] Pagination works (limit, offset)
- [ ] Filtering works (completed status)
- [ ] Sorting works (created_at, title, priority)
- [ ] JOIN queries work (task with user)

### 10.3 CRUD Tests
- [ ] Create task generates UUID
- [ ] Create task sets defaults (completed=False)
- [ ] Update task modifies updated_at
- [ ] Delete task removes row
- [ ] Cascade delete works (delete user → delete tasks)

### 10.4 Performance Tests
- [ ] Connection pooling works
- [ ] Indexes used (check EXPLAIN)
- [ ] No N+1 queries
- [ ] Concurrent requests handled

---

**End of specs/database/schema.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
