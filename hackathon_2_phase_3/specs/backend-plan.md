# Backend & Integration Implementation Plan – Phase II Todo Web App

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md, @specs/api/rest-endpoints.md, @specs/database/schema.md, @specs/features/task-crud-backend.md, @specs/authentication-backend.md

---

## Executive Summary

This plan details the implementation of a production-ready FastAPI backend with SQLModel ORM, JWT authentication, and Neon PostgreSQL database integration for the Hackathon II Phase II Todo Full-Stack Web Application. The backend enforces strict multi-user isolation, stateless JWT verification, and seamless frontend integration via CORS.

**Core Principles:**
1. **User Isolation is Sacred** – Every database query filters by `user_id`
2. **Stateless Authentication** – JWT verification on every request, no sessions
3. **Security First** – Shared secret verification, user_id enforcement, CORS lockdown
4. **Neon-Native** – Serverless PostgreSQL with async connection pooling
5. **Spec-Driven Development** – All code implements specifications exactly

---

## 1. Backend Architecture Overview

### 1.1 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app creation, CORS, routers
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Environment variables, settings
│   │   ├── security.py         # JWT verification functions
│   │   └── errors.py           # Global exception handlers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py             # SQLModel Task class
│   │   └── user.py             # SQLModel User reference (read-only)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py             # Pydantic models (Create, Update, Response)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # FastAPI dependencies (get_current_user)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── tasks.py        # Task CRUD endpoints
│   │   │   └── health.py       # Health check endpoint
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── jwt.py          # JWT verification middleware (optional)
│   └── db/
│       ├── __init__.py
│       ├── session.py          # Async engine, session factory
│       └── init.py             # Database initialization
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   ├── test_auth.py            # JWT verification tests
│   ├── test_tasks.py           # CRUD endpoint tests
│   └── test_integration.py     # End-to-end tests
├── .env                        # Environment variables (never commit)
├── .env.example                # Environment variable template
├── .gitignore                  # Ignore .env, __pycache__, .pytest_cache
├── pyproject.toml              # Python dependencies (uv or pip)
├── requirements.txt            # Generated from pyproject.toml
└── README.md                   # Backend setup and run instructions
```

### 1.2 FastAPI Application Setup

**File:** `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
)
from fastapi.exceptions import RequestValidationError

# Create FastAPI application
app = FastAPI(
    title="Hackathon Todo API",
    description=(
        "RESTful API for multi-user Todo application with JWT authentication. "
        "Enforces strict user isolation and stateless authentication."
    ),
    version="1.0.0",
    docs_url="/docs",           # Swagger UI
    redoc_url="/redoc",         # ReDoc
    openapi_url="/openapi.json",
)

# CORS Middleware (MUST be registered before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Frontend dev server
        "http://localhost:3001",      # Alternate port
        "http://127.0.0.1:3000",      # Loopback
        settings.frontend_url,        # From env var
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,                     # Cache preflight for 10 min
)

# Global Exception Handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include Routers
from app.api.routes.tasks import router as tasks_router
from app.api.routes.health import router as health_router

app.include_router(tasks_router)
app.include_router(health_router)

# Root Endpoint
@app.get("/", tags=["root"])
async def root():
    return {
        "name": "Hackathon Todo API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "environment": settings.environment,
    }
```

### 1.3 Async Support Strategy

**Architecture Decision:** All endpoints use `async def` with async SQLModel sessions for optimal performance on Neon serverless PostgreSQL.

**Rationale:**
- Neon is designed for async workloads
- Prevents blocking the event loop during DB queries
- Better concurrency for multi-user scenarios
- FastAPI natively supports async endpoints

**Implementation Pattern:**
```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    # Async database query
    statement = select(Task).where(Task.user_id == user_id)
    result = await db.execute(statement)
    tasks = result.scalars().all()
    return {"tasks": tasks}
```

**Acceptance Criteria:**
- [ ] All route handlers use `async def`
- [ ] All database queries use `await db.execute()`
- [ ] Database session uses `AsyncSession` from SQLAlchemy
- [ ] Engine uses `create_async_engine()` with `postgresql+asyncpg://`

---

## 2. Database & Connection Setup

### 2.1 Environment Configuration

**File:** `backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # JWT / Authentication
    better_auth_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7

    # Frontend (CORS)
    frontend_url: str = "http://localhost:3000"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()

settings = get_settings()
```

### 2.2 Async Engine & Session Factory

**File:** `backend/app/db/session.py`

```python
from sqlmodel import SQLModel, create_engine, AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
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
```

### 2.3 Database Initialization

**File:** `backend/app/db/init.py`

```python
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
```

**Usage:**
```bash
# Initialize database (idempotent)
python -m app.db.init

# Reset database (DEV ONLY - deletes all data)
python -m app.db.init --reset
```

### 2.4 Connection Pooling for Neon Serverless

**Neon-Specific Considerations:**

1. **Use Connection Pooler:**
   - Neon provides connection pooling via `pooler` in connection string
   - Current DATABASE_URL already uses pooler: `ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech`
   - This reduces cold starts and improves performance

2. **Pool Settings:**
   ```python
   async_engine = create_async_engine(
       ASYNC_DATABASE_URL,
       pool_size=10,        # Conservative for serverless
       max_overflow=20,     # Burst capacity
       pool_pre_ping=True,  # Detect stale connections
       pool_recycle=3600,   # Recycle before Neon timeout (5 min)
   )
   ```

3. **Retry Logic (Bonus):**
   ```python
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
   async def execute_query(session: AsyncSession, statement):
       result = await session.execute(statement)
       return result
   ```

**Acceptance Criteria:**
- [ ] DATABASE_URL uses Neon connection pooler
- [ ] Async engine configured with pooling settings
- [ ] Session factory uses `async_sessionmaker`
- [ ] `get_db()` dependency yields session with context manager
- [ ] Database initialization creates all tables idempotently
- [ ] Connection recycling < 5 minutes (Neon timeout)

---

## 3. Authentication & JWT Verification

### 3.1 JWT Security Functions

**File:** `backend/app/core/security.py`

```python
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.core.config import settings

# Load shared secret from environment
SECRET_KEY = settings.better_auth_secret
ALGORITHM = settings.jwt_algorithm
EXPIRATION_DAYS = settings.jwt_expiration_days

# Validate secret on startup
if len(SECRET_KEY) < 32:
    raise ValueError(
        f"BETTER_AUTH_SECRET must be at least 32 characters. "
        f"Current length: {len(SECRET_KEY)}"
    )

def decode_jwt(token: str) -> Dict[str, Any]:
    """
    Verify and decode JWT token issued by Better Auth.

    Args:
        token: JWT token string (from Authorization header)

    Returns:
        Decoded JWT payload as dictionary

    Raises:
        PyJWTError: If token is invalid, expired, or malformed
    """
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_signature": True,
                "require": ["sub", "exp", "iat"],  # Required claims
            }
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise PyJWTError("Token has expired")

    except jwt.InvalidTokenError as e:
        raise PyJWTError(f"Invalid token: {str(e)}")

def verify_jwt_payload(payload: Dict[str, Any]) -> str:
    """
    Extract and validate user_id from JWT payload.

    Better Auth uses 'sub' claim for user_id (standard JWT).

    Args:
        payload: Decoded JWT payload

    Returns:
        user_id as string

    Raises:
        ValueError: If user_id is missing from payload
    """
    user_id = payload.get("sub") or payload.get("user_id")

    if not user_id:
        raise ValueError(
            "Invalid token payload: missing user_id (sub claim)"
        )

    return str(user_id)

def create_test_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token for testing purposes only.

    WARNING: Only use in development/testing. Production tokens
    must be issued by Better Auth on the frontend.

    Args:
        user_id: User ID to embed in token
        expires_delta: Optional custom expiration time

    Returns:
        JWT token string
    """
    if settings.environment == "production":
        raise RuntimeError("Cannot create test tokens in production")

    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(days=EXPIRATION_DAYS))

    payload = {
        "sub": user_id,                      # Subject (user_id)
        "iss": "hackathon-todo",            # Issuer (matches frontend)
        "aud": "hackathon-todo-api",        # Audience (matches frontend)
        "iat": now.timestamp(),             # Issued at
        "exp": expire.timestamp(),          # Expiration
        "email": f"test-{user_id}@example.com",
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
```

### 3.2 FastAPI Authentication Dependencies

**File:** `backend/app/api/deps.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.core.security import decode_jwt, verify_jwt_payload
from app.db.session import get_db

# HTTP Bearer scheme extracts "Authorization: Bearer <token>"
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verify JWT token and extract user_id.

    Use this dependency in protected routes to enforce authentication.

    Returns:
        str: user_id from JWT payload

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        # Verify and decode JWT
        payload = decode_jwt(token)

        # Extract user_id from payload
        user_id = verify_jwt_payload(payload)

        return user_id

    except (PyJWTError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Missing or invalid authorization token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_enforce_path(
    path_user_id: str,
    current_user_id: str = Depends(get_current_user),
) -> str:
    """
    Enforce that user_id in URL path matches user_id in JWT token.

    This prevents users from accessing other users' resources.

    Args:
        path_user_id: user_id from URL path parameter
        current_user_id: user_id from JWT token (injected by get_current_user)

    Returns:
        str: user_id (validated)

    Raises:
        HTTPException 403: If user_id in path doesn't match token
    """
    if current_user_id != path_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"User ID mismatch: token user_id ({current_user_id}) "
                f"does not match path user_id ({path_user_id})"
            ),
        )

    return current_user_id
```

### 3.3 OpenAPI Security Scheme

FastAPI automatically documents JWT authentication in Swagger UI:

```python
from fastapi.security import HTTPBearer

# This is already defined in deps.py
security = HTTPBearer()

# Usage in route handlers:
@router.get(
    "/api/{user_id}/tasks",
    dependencies=[Depends(security)],  # Adds "Authorize" button in Swagger
)
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ...
```

**Swagger UI:**
- Navigate to `http://localhost:8000/docs`
- Click "Authorize" button (padlock icon)
- Enter: `Bearer <your_jwt_token>`
- All requests will include Authorization header

**Acceptance Criteria:**
- [ ] `decode_jwt()` verifies JWT signature with `BETTER_AUTH_SECRET`
- [ ] `decode_jwt()` extracts `user_id` from `sub` claim
- [ ] `decode_jwt()` raises exception for invalid/expired tokens
- [ ] `get_current_user` dependency extracts Bearer token
- [ ] `get_current_user` returns user_id or raises 401
- [ ] `get_current_user_enforce_path` enforces user_id match
- [ ] `get_current_user_enforce_path` raises 403 on mismatch
- [ ] Swagger UI shows "Authorize" button
- [ ] Test tokens can be created for development only

---

## 4. API Routes Implementation Approach

### 4.1 Router Structure

**File:** `backend/app/api/routes/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, col, desc
from typing import Optional

from app.api.deps import get_db, get_current_user, get_current_user_enforce_path
from app.models.task import Task
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
)

# Create router with prefix
router = APIRouter(
    prefix="/api/{user_id}/tasks",
    tags=["tasks"],
)

# All routes are protected by default via dependencies
```

### 4.2 Dependency Injection Pattern

**Every route follows this pattern:**

```python
@router.get("")  # Maps to: GET /api/{user_id}/tasks
async def list_tasks(
    user_id: str,                                # Path parameter
    db: AsyncSession = Depends(get_db),          # Database session
    current_user_id: str = Depends(             # JWT verification + enforcement
        get_current_user_enforce_path
    ),
):
    # At this point:
    # - user_id is guaranteed to match current_user_id
    # - User is authenticated (JWT verified)
    # - Database session is ready

    # No need to re-check user isolation – dependency handles it

    statement = select(Task).where(Task.user_id == user_id)
    result = await db.execute(statement)
    tasks = result.scalars().all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=len(tasks),
    )
```

### 4.3 Path Parameter Validation

**Enforcement happens at dependency level:**

```python
# ✅ CORRECT: Use get_current_user_enforce_path
@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user_enforce_path),
):
    # user_id is validated to match token
    # No additional checks needed

# ❌ WRONG: Manual validation (redundant)
@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user),
):
    if current_user_id != user_id:  # Redundant!
        raise HTTPException(403)
```

### 4.4 Query Filtering & User Isolation

**CRITICAL: All queries MUST filter by user_id**

```python
@router.get("")
async def list_tasks(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_enforce_path),
    status_filter: Optional[str] = Query(None, pattern="^(pending|completed|all)$"),
    sort_by: str = Query("created_at", pattern="^(created_at|title|priority|updated_at)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    # Build base query with user isolation (NON-NEGOTIABLE)
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

    # Paginate
    statement = statement.limit(limit).offset(offset)

    # Execute (async)
    result = await db.execute(statement)
    tasks = result.scalars().all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=len(tasks),
        limit=limit,
        offset=offset,
    )
```

### 4.5 Pydantic Schemas

**File:** `backend/app/schemas/task.py`

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

# Request Schemas
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

# Response Schemas
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
- [ ] All routes use `async def`
- [ ] All routes use `get_current_user_enforce_path` dependency
- [ ] All database queries filter by `user_id`
- [ ] All requests use Pydantic schemas for validation
- [ ] All responses use Pydantic schemas for serialization
- [ ] Routes return appropriate HTTP status codes (200, 201, 204, 404)
- [ ] Error responses use JSON format: `{"detail": "..."}`

---

## 5. Frontend-Backend Integration Points

### 5.1 CORS Configuration

**Already configured in `backend/app/main.py`:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # Frontend Next.js dev server
        "http://localhost:3001",    # Alternate port
        settings.frontend_url,      # From env var
    ],
    allow_credentials=True,         # Required for Authorization header
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,                   # Cache preflight for 10 minutes
)
```

**Preflight Request Flow:**
```http
OPTIONS /api/abc123/tasks HTTP/1.1
Host: localhost:8000
Origin: http://localhost:3000
Access-Control-Request-Method: GET
Access-Control-Request-Headers: Authorization

HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
```

### 5.2 JWT Request/Response Flow

**Frontend → Backend:**

1. **Frontend (Better Auth)** issues JWT token on signup/signin
2. **Frontend API client** attaches token to all requests:
   ```typescript
   // frontend/lib/api-client.ts
   const response = await fetch("http://localhost:8000/api/abc123/tasks", {
     headers: {
       "Authorization": `Bearer ${token}`,
       "Content-Type": "application/json",
     },
   });
   ```

3. **Backend FastAPI** verifies token via `get_current_user` dependency
4. **Backend** returns only user's own data (user_id filtering)

**Backend → Frontend:**

**Success Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": "task-123",
      "user_id": "abc123",
      "title": "Build authentication",
      "description": "Implement JWT",
      "priority": "high",
      "completed": false,
      "created_at": "2025-02-08T12:00:00Z",
      "updated_at": "2025-02-08T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Missing or invalid authorization token: Token has expired"
}
```

**Error Response (403 Forbidden):**
```json
{
  "detail": "User ID mismatch: token user_id (abc123) does not match path user_id (xyz789)"
}
```

**Frontend Error Handling:**
```typescript
// frontend/lib/api-client.ts
if (response.status === 401) {
  // Token expired or invalid → redirect to login
  window.location.href = "/login";
  throw new Error("Unauthorized");
}

if (response.status === 403) {
  // User ID mismatch → should not happen in normal flow
  console.error("Authorization error:", await response.json());
  throw new Error("Forbidden");
}
```

### 5.3 API Base URLs

**Development:**
- Frontend: `http://localhost:3000` (Next.js dev server)
- Backend: `http://localhost:8000` (FastAPI dev server)

**Production:**
- Frontend: Deployed to Vercel (e.g., `https://hackathon-todo.vercel.app`)
- Backend: Deployed to Railway/Fly.io (e.g., `https://hackathon-todo-api.railway.app`)

**Environment Variables:**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5

# Backend (.env)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
FRONTEND_URL=http://localhost:3000
```

**Acceptance Criteria:**
- [ ] CORS allows frontend origin only (not "*" wildcard)
- [ ] Frontend sends `Authorization: Bearer <token>` header
- [ ] Backend verifies JWT signature with shared secret
- [ ] Backend returns 401 if token is invalid/expired
- [ ] Backend returns 403 if user_id mismatch
- [ ] Frontend redirects to `/login` on 401
- [ ] Error responses use consistent JSON format

---

## 6. Environment & Tooling

### 6.1 Required Python Packages

**File:** `backend/pyproject.toml`

```toml
[project]
name = "hackathon-todo-backend"
version = "1.0.0"
description = "FastAPI backend for Hackathon II Todo app"
requires-python = ">=3.13"

dependencies = [
    # FastAPI & ASGI Server
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",

    # Database & ORM
    "sqlmodel>=0.0.22",
    "sqlalchemy>=2.0.0",

    # Async PostgreSQL Driver
    "asyncpg>=0.30.0",
    "psycopg[binary]>=3.2.0",

    # Authentication
    "pyjwt>=2.9.0",
    "python-multipart>=0.0.17",  # Required for form data
    "python-jose[cryptography]>=3.3.0",  # Alternative JWT lib

    # Environment & Config
    "pydantic>=2.10.0",
    "pydantic-settings>=2.6.0",
    "python-dotenv>=1.0.0",

    # Validation & Serialization
    "email-validator>=2.1.0",

    # Testing (dev)
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "httpx>=0.28.0",  # Async HTTP client for testing

    # Code Quality (dev)
    "ruff>=0.8.0",
    "black>=24.0.0",
    "mypy>=1.9.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### 6.2 Alternative: requirements.txt

```bash
# Generate from pyproject.toml using pip-compile or uv
pip install fastapi uvicorn[standard] sqlmodel asyncpg pyjwt python-dotenv pytest pytest-asyncio httpx
```

### 6.3 Environment File

**File:** `backend/.env` (NEVER commit to git)

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_Wo4kT5FNPYwI@ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (MUST match frontend)
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5

# JWT Configuration
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Environment
ENVIRONMENT=development
```

**File:** `backend/.env.example` (Commit to git)

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:password@host-neon.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (MUST match frontend, minimum 32 characters)
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# JWT Configuration
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Environment
ENVIRONMENT=development
```

### 6.4 Running the Backend

**Development:**
```bash
cd backend

# Option 1: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using uv (modern Python package manager)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 3: Using Python module
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Verify Server:**
```bash
# Health check
curl http://localhost:8000/health

# OpenAPI docs
open http://localhost:8000/docs
```

### 6.5 Environment Loading

**File:** `backend/app/core/config.py` (already shown in section 2.1)

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str
    better_auth_secret: str
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

**Usage:**
```python
from app.core.config import settings

# Access settings
print(f"Database: {settings.database_url}")
print(f"Secret length: {len(settings.better_auth_secret)}")
print(f"Environment: {settings.environment}")
```

**Acceptance Criteria:**
- [ ] All dependencies listed in pyproject.toml or requirements.txt
- [ ] .env file exists with required variables
- [ ] .env.example provided for other developers
- [ ] BETTER_AUTH_SECRET matches frontend (identical)
- [ ] Server starts with `uvicorn app.main:app --reload`
- [ ] Server listens on http://localhost:8000
- [ ] OpenAPI docs available at http://localhost:8000/docs

---

## 7. Testing & Debugging Strategy

### 7.1 Local Testing with Swagger UI

**Access Swagger UI:**
1. Start backend: `uvicorn app.main:app --reload --port 8000`
2. Navigate to: `http://localhost:8000/docs`
3. Click "Authorize" button (padlock icon)
4. Enter test token: `Bearer <test_jwt_token>`
5. Execute requests via UI

**Generate Test Token:**
```python
# In Python REPL
from app.core.security import create_test_token
token = create_test_token("test-user-123")
print(token)  # Copy this token

# Or via CLI
python -c "from app.core.security import create_test_token; print(create_test_token('test-user-123'))"
```

### 7.2 Test Cases

**File:** `backend/tests/test_auth_flow.py`

```python
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI
from app.core.security import create_test_token
from app.main import app

@pytest.mark.asyncio
async def test_valid_token_matching_user_id():
    """Test: Valid token + matching user_id → 200 OK"""
    token = create_test_token("user-abc")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/user-abc/tasks",
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 200

@pytest.mark.asyncio
async def test_invalid_token():
    """Test: Invalid token → 401 Unauthorized"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/user-abc/tasks",
            headers={"Authorization": "Bearer invalid.token.here"}
        )

    assert response.status_code == 401
    assert "detail" in response.json()

@pytest.mark.asyncio
async def test_user_id_mismatch():
    """Test: Valid token but wrong user_id in path → 403 Forbidden"""
    token = create_test_token("user-abc")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/user-xyz/tasks",  # Different user_id
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 403
    assert "User ID mismatch" in response.json()["detail"]

@pytest.mark.asyncio
async def test_no_token():
    """Test: No Authorization header → 403 (HTTPBearer requirement)"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/user-abc/tasks")

    assert response.status_code == 403  # HTTPBearer raises this

@pytest.mark.asyncio
async def test_expired_token():
    """Test: Expired token → 401 Unauthorized"""
    from datetime import timedelta

    # Create token that expired 1 day ago
    token = create_test_token("user-abc", expires_delta=timedelta(days=-1))

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/user-abc/tasks",
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()
```

### 7.3 CRUD Operation Tests

**File:** `backend/tests/test_tasks_crud.py`

```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task
from app.core.security import create_test_token

@pytest.mark.asyncio
async def test_create_task(db: AsyncSession):
    """Test: Create task → 201 Created with task object"""
    token = create_test_token("user-123")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/user-123/tasks",
            json={
                "title": "Test task",
                "description": "Test description",
                "priority": "high"
            },
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert data["user_id"] == "user-123"
    assert data["completed"] is False
    assert "id" in data

@pytest.mark.asyncio
async def test_list_tasks_filters_by_user_id(db: AsyncSession):
    """Test: List tasks returns only user's own tasks"""
    # Create tasks for user-123
    task1 = Task(id="1", user_id="user-123", title="User 123 task")
    # Create task for user-456
    task2 = Task(id="2", user_id="user-456", title="User 456 task")

    db.add(task1)
    db.add(task2)
    await db.commit()

    token = create_test_token("user-123")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/user-123/tasks",
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 200
    data = response.json()
    assert len(data["tasks"]) == 1
    assert data["tasks"][0]["user_id"] == "user-123"

@pytest.mark.asyncio
async def test_update_task_enforces_ownership(db: AsyncSession):
    """Test: Cannot update another user's task"""
    task = Task(id="1", user_id="user-123", title="Original title")
    db.add(task)
    await db.commit()

    # Try to update as user-456
    token = create_test_token("user-456")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.put(
            "/api/user-456/tasks/1",  # Different user_id
            json={"title": "Hacked title"},
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 404  # Task not found for this user

@pytest.mark.asyncio
async def test_delete_task(db: AsyncSession):
    """Test: Delete task → 204 No Content"""
    task = Task(id="1", user_id="user-123", title="To delete")
    db.add(task)
    await db.commit()

    token = create_test_token("user-123")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.delete(
            "/api/user-123/tasks/1",
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 204

@pytest.mark.asyncio
async def test_toggle_task_complete(db: AsyncSession):
    """Test: Toggle completion → 200 OK with updated task"""
    task = Task(id="1", user_id="user-123", title="Task", completed=False)
    db.add(task)
    await db.commit()

    token = create_test_token("user-123")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.patch(
            "/api/user-123/tasks/1/complete",
            json={"completed": True},
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True
```

### 7.4 Debugging Tools

**SQL Query Logging:**
```python
# In app/db/session.py
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # Log all SQL queries to console
)
```

**Request Logging Middleware:**
```python
# In app/main.py
import logging

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response
```

**Test Database Connection:**
```bash
# From backend directory
python -c "
import asyncio
from app.db.session import async_engine

async def test():
    async with async_engine.connect() as conn:
        result = await conn.execute(text('SELECT 1'))
        print('Database connection successful!')

asyncio.run(test())
"
```

**Acceptance Criteria:**
- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] Test tokens can be generated for development
- [ ] All test cases pass (valid token, invalid token, user_id mismatch, no token, expired token)
- [ ] CRUD tests pass (create, read, update, delete, toggle)
- [ ] User isolation tests pass (users cannot access each other's data)
- [ ] SQL logging works in development mode
- [ ] Database connection test succeeds

---

## 8. Risks, Mitigations & Best Practices

### 8.1 Security Risks

**Risk 1: Secret Leakage**

**Threat:** `BETTER_AUTH_SECRET` committed to git or exposed in logs

**Mitigation:**
- Add `.env` to `.gitignore`
- Use `.env.example` without actual secrets
- Never log the secret or full JWT payload
- Use environment variables in production (not .env files)
- Rotate secrets if leaked (document in runbook)

```bash
# .gitignore
.env
__pycache__/
*.pyc
.pytest_cache/
.ruff_cache/
```

**Risk 2: JWT Token Theft**

**Threat:** Attacker steals JWT token via XSS or network sniffing

**Mitigation:**
- Use HTTPS in production (encrypts traffic)
- Set short token expiration (7 days default)
- Frontend stores token in HTTP-only cookie (Better Auth default)
- Implement token refresh if extending expiration (future)
- Log all 403/401 errors for anomaly detection

**Risk 3: User ID Bypass**

**Threat:** Attacker tries to access other users' data by modifying user_id in path

**Mitigation:**
- **CRITICAL:** Use `get_current_user_enforce_path` dependency on ALL routes
- Double-check user ownership in database queries
- Log all 403 errors for security monitoring
- Consider rate limiting for repeated violations (bonus)

```python
# NEVER do this – vulnerable to bypass
@router.get("/api/{user_id}/tasks")
async def list_tasks(user_id: str):  # No auth check!
    return await get_tasks(user_id)  # Returns any user's data

# ALWAYS do this – secure
@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user_enforce_path),  # Enforces match
):
    return await get_tasks(user_id)  # Safe: user_id validated
```

**Risk 4: SQL Injection**

**Threat:** Attacker injects malicious SQL via user input

**Mitigation:**
- Use SQLModel/SQLAlchemy parameterized queries (default protection)
- Never concatenate user input into SQL strings
- Validate all input with Pydantic schemas
- Use stored procedures if complex queries (bonus)

```python
# ❌ VULNERABLE – SQL injection
query = f"SELECT * FROM task WHERE user_id = '{user_id}'"  # Don't do this!

# ✅ SECURE – Parameterized query
statement = select(Task).where(Task.user_id == user_id)  # Do this!
```

### 8.2 Neon Serverless Risks

**Risk 5: Connection Timeouts**

**Threat:** Neon closes idle connections after 5 minutes, causing errors

**Mitigation:**
- Set `pool_recycle=3600` (recycle connections before timeout)
- Enable `pool_pre_ping=True` (detect stale connections)
- Use Neon connection pooler (already in DATABASE_URL)
- Implement retry logic for transient errors (bonus)

```python
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_recycle=3600,      # Recycle after 1 hour (< 5 min timeout)
    pool_pre_ping=True,     # Verify connections before use
)
```

**Risk 6: Cold Starts**

**Threat:** First request after inexperience is slow (Neon spins up compute)

**Mitigation:**
- Use Neon's autoscaling (automatic)
- Use connection pooler (reduces cold starts)
- Implement request warming (bonus: cron job every 4 min)
- Acceptable for hackathon (not production-critical)

**Risk 7: Connection Pool Exhaustion**

**Threat:** Too many concurrent requests exhaust connection pool

**Mitigation:**
- Set conservative `pool_size=10` and `max_overflow=20`
- Use async/await (non-blocking, better concurrency)
- Implement rate limiting (bonus: 100 req/min per user)
- Monitor pool metrics in production (bonus: Prometheus)

### 8.3 JWT-Specific Risks

**Risk 8: Token Expiration Clock Skew**

**Threat:** System clock differences cause valid tokens to appear expired

**Mitigation:**
- Add small leeway to expiration check (default: 0)
- Use NTP to sync system clocks
- Clear error message instructs user to re-authenticate

```python
# In decode_jwt()
payload = jwt.decode(
    token,
    SECRET_KEY,
    algorithms=[ALGORITHM],
    leeway=10,  # Allow 10 seconds clock skew
    options={"verify_exp": True},
)
```

**Risk 9: Token Replay Attacks**

**Threat:** Attacker captures and reuses valid token

**Mitigation:**
- Use HTTPS (prevents network sniffing)
- Short expiration (7 days)
- Store tokens in HTTP-only cookies (Better Auth default)
- Implement token blacklist if compromised (future: Redis)
- Implement token rotation (future: refresh tokens)

### 8.4 Best Practices Checklist

**Security:**
- [ ] `.env` in `.gitignore`
- [ ] Secrets never logged or printed
- [ ] All routes use `get_current_user_enforce_path`
- [ ] All database queries filter by `user_id`
- [ ] HTTPS enabled in production
- [ ] CORS allows only frontend origin
- [ ] Input validation via Pydantic schemas

**Performance:**
- [ ] Async/await used throughout
- [ ] Connection pooling configured
- [ ] Indexes on `user_id`, `completed`, `created_at`
- [ ] Query pagination (limit/offset)
- [ ] SELECT only required fields (not `SELECT *`)

**Code Quality:**
- [ ] Type hints on all functions
- [ ] Docstrings on all public functions
- [ ] Error handling with specific exceptions
- [ ] Logging for debugging (not for secrets)
- [ ] Tests for all critical paths

**Operational:**
- [ ] Health check endpoint (`/health`)
- [ ] Graceful shutdown (SIGTERM handling)
- [ ] Structured logging (JSON format)
- [ ] Error tracking (Sentry, optional)
- [ ] Metrics collection (Prometheus, optional)

**Acceptance Criteria:**
- [ ] All risks identified with mitigations
- [ ] Security checklist complete
- [ ] Performance optimizations documented
- [ ] Best practices followed in implementation

---

## 9. Next Steps After Plan

### 9.1 Create Ordered Task List

**Command:**
```bash
/sp.tasks
```

**Input:** This plan (`specs/backend-plan.md`)

**Output:** `specs/tasks.md` with dependency-ordered tasks:

**Phases:**
1. **Phase 1: Setup & Configuration** (5 tasks)
   - Create backend directory structure
   - Configure environment variables
   - Install dependencies
   - Setup database connection
   - Initialize database tables

2. **Phase 2: Authentication & JWT** (4 tasks)
   - Implement JWT security functions
   - Create authentication dependencies
   - Add JWT verification to OpenAPI
   - Write authentication tests

3. **Phase 3: Database Models & Schemas** (3 tasks)
   - Create SQLModel Task class
   - Create Pydantic schemas
   - Test database operations

4. **Phase 4: API Routes** (6 tasks)
   - Create task router structure
   - Implement GET /api/{user_id}/tasks
   - Implement POST /api/{user_id}/tasks
   - Implement PUT /api/{user_id}/tasks/{task_id}
   - Implement DELETE /api/{user_id}/tasks/{task_id}
   - Implement PATCH /api/{user_id}/tasks/{task_id}/complete

5. **Phase 5: CORS & Integration** (3 tasks)
   - Configure CORS middleware
   - Test frontend-backend connection
   - Test JWT flow end-to-end

6. **Phase 6: Testing & Polish** (4 tasks)
   - Write integration tests
   - Add error handlers
   - Test with Swagger UI
   - Performance optimization

**Total: 25 tasks** (estimated 2-3 hours implementation time)

### 9.2 Implementation Execution

**Option A: Automated Implementation**
```bash
/sp.implement @specs/tasks.md
```

**This will:**
- Use FastAPI-SQLModel-Engineer agent for backend code
- Use Better-Auth-JWT-Specialist agent for auth setup
- Generate all files according to specs
- Run tests to verify functionality

**Option B: Manual Step-by-Step**

Execute tasks in order from `specs/tasks.md`:

```bash
# Step 1: Setup
cd backend
mkdir -p app/{core,models,schemas,api/routes,db}
touch app/__init__.py app/core/__init__.py ...

# Step 2: Dependencies
uv add fastapi uvicorn sqlmodel asyncpg pyjwt python-dotenv

# Step 3: Database
python -m app.db.init

# Step 4: Run server
uvicorn app.main:app --reload --port 8000

# Step 5: Test
open http://localhost:8000/docs
```

### 9.3 Verification Checklist

**After implementation:**

**Backend:**
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All tables created in Neon
- [ ] Swagger UI accessible at /docs
- [ ] Health check returns 200 OK

**Authentication:**
- [ ] Valid token allows access (200 OK)
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] User ID mismatch returns 403
- [ ] No token returns 401/403

**CRUD Operations:**
- [ ] Create task works (201)
- [ ] List tasks returns only user's tasks (200)
- [ ] Get single task works (200)
- [ ] Update task works (200)
- [ ] Delete task works (204)
- [ ] Toggle completion works (200)

**Integration:**
- [ ] CORS preflight succeeds (200)
- [ ] Frontend can call backend (no CORS errors)
- [ ] JWT token verified on every request
- [ ] User isolation enforced (users see only their data)

**Testing:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Test coverage > 80%
- [ ] No security vulnerabilities

---

## 10. Cross-References

**Related Specifications:**
- @constitution.md – Supreme law for all implementation
- @specs/api/rest-endpoints.md – Detailed API endpoint contracts
- @specs/database/schema.md – Database schema and models
- @specs/features/task-crud-backend.md – CRUD business logic
- @specs/authentication-backend.md – JWT verification implementation
- @specs/features/authentication-frontend.md – Frontend JWT issuance

**Skills to Use:**
- `fastapi-jwt-middleware-neon` – Complete JWT verification middleware pattern
- `better-auth-jwt-setup` – Frontend JWT issuance (reference)
- `sqlmodel-user-isolation` – User-scoped database queries

**Agents to Invoke:**
- `FastAPI-SQLModel-Engineer` – Generate backend code from specs
- `Better-Auth-JWT-Specialist` – Implement JWT verification
- `Integration-and-Tester-Agent` – Test frontend-backend integration

---

## 11. Success Criteria

**Backend is complete when:**
- ✅ All 25 tasks from `specs/tasks.md` are implemented
- ✅ Server runs on http://localhost:8000 without errors
- ✅ Database tables created in Neon PostgreSQL
- ✅ All authentication tests pass (valid/invalid/expired tokens)
- ✅ All CRUD operations work (create/read/update/delete/toggle)
- ✅ User isolation enforced (users see only their data)
- ✅ CORS configured for frontend origin
- ✅ Swagger UI documents all endpoints
- ✅ Test coverage > 80%
- ✅ No security vulnerabilities
- ✅ Frontend can successfully call backend with JWT

**Ready for Hackathon II judging when:**
- ✅ Judge can signup/login via frontend
- ✅ Judge can create tasks and see only their tasks
- ✅ Judge cannot access other users' tasks (403 error)
- ✅ JWT token verified on every API request
- ✅ Cyberpunk theme renders correctly
- ✅ All 5 CRUD features work end-to-end
- ✅ Demo shows multi-user isolation

---

**End of specs/backend-plan.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
