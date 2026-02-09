# specs/authentication-backend.md

## Backend Authentication & JWT Verification Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 2, @specs/features/authentication-frontend.md

---

## Overview

Define the backend authentication architecture for the Hackathon II Phase II Todo Full-Stack Web Application using FastAPI with JWT verification middleware. This specification covers JWT token verification, user authorization, CORS configuration, and integration with the frontend's Better Auth JWT plugin.

**Architecture:**
- **Frontend:** Better Auth with JWT plugin (issues tokens)
- **Backend:** FastAPI with PyJWT (verifies tokens)
- **Shared Secret:** `BETTER_AUTH_SECRET` (must be identical)
- **Token Format:** JWT (HS256 algorithm)

**Skills to Use:**
- `fastapi-jwt-middleware-neon` – JWT verification middleware
- `better-auth-jwt-setup` – Frontend JWT issuance (reference)

---

## 1. Environment Variables

### 1.1 Required Variables

**File:** `backend/.env`

```bash
# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_Wo4kT5FNPYwI@ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (MUST match frontend BETTER_AUTH_SECRET)
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5

# JWT Configuration
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# API Configuration
API_BASE_URL=http://localhost:8000
API_VERSION=1.0.0

# Environment
ENVIRONMENT=development  # or production
```

**Validation Rules:**
- `BETTER_AUTH_SECRET`: Minimum 32 characters, cryptographically secure
- `FRONTEND_URL`: Must match frontend origin (for CORS)
- `JWT_ALGORITHM`: HS256 (HMAC-SHA256)
- `JWT_EXPIRATION_DAYS`: Token validity period (default: 7 days)

**Security Requirements:**
- [ ] Secrets stored in `.env` file (never commit to git)
- [ ] `.env.example` provided for other developers
- [ ] Production secrets use environment variables (not .env files)
- [ ] Secrets are rotated periodically (document in runbook)

---

## 2. JWT Verification Implementation

### 2.1 JWT Security Module

**File:** `backend/app/core/security.py`

```python
import os
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Environment variables
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRATION_DAYS = int(os.getenv("JWT_EXPIRATION_DAYS", "7"))

if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise ValueError(
        "BETTER_AUTH_SECRET must be set and at least 32 characters long. "
        "Current length: " + str(len(SECRET_KEY) if SECRET_KEY else 0)
    )


def decode_jwt(token: str) -> Dict[str, Any]:
    """
    Verify and decode JWT token.

    Args:
        token: JWT token string

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
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise PyJWTError("Token has expired")

    except jwt.InvalidTokenError as e:
        raise PyJWTError(f"Invalid token: {str(e)}")


def verify_jwt_payload(payload: Dict[str, Any]) -> str:
    """
    Extract user_id from JWT payload.

    Args:
        payload: Decoded JWT payload

    Returns:
        user_id as string

    Raises:
        ValueError: If user_id is missing from payload
    """
    # Better Auth JWT plugin uses 'sub' claim for user_id
    user_id = payload.get("sub") or payload.get("user_id")

    if not user_id:
        raise ValueError("Invalid token payload: missing user_id (sub claim)")

    return str(user_id)


def create_test_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token for testing purposes.

    WARNING: Only use this in development/testing. Production tokens
    must be issued by Better Auth on the frontend.

    Args:
        user_id: User ID to embed in token
        expires_delta: Optional custom expiration time

    Returns:
        JWT token string
    """
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError("Cannot create test tokens in production")

    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(days=EXPIRATION_DAYS))

    payload = {
        "sub": user_id,  # Standard JWT claim for subject (user_id)
        "iss": "hackathon-todo",  # Issuer (matches frontend config)
        "aud": "hackathon-todo-api",  # Audience (matches frontend config)
        "iat": now.timestamp(),  # Issued at
        "exp": expire.timestamp(),  # Expiration time
        "email": f"test-{user_id}@example.com",  # Additional claims
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
```

**Acceptance Criteria:**
- [ ] `decode_jwt()` verifies JWT signature with `BETTER_AUTH_SECRET`
- [ ] `decode_jwt()` raises `PyJWTError` for invalid/expired tokens
- [ ] `verify_jwt_payload()` extracts `user_id` from `sub` claim
- [ ] `create_test_token()` creates tokens for testing only
- [ ] Token expiration is enforced (default: 7 days)

---

### 2.2 FastAPI Dependency for JWT Verification

**File:** `backend/app/api/deps.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.core.security import decode_jwt, verify_jwt_payload
from app.db.session import get_session

# HTTP Bearer scheme (extracts "Authorization: Bearer <token>")
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
    # Extract token from Authorization header
    token = credentials.credentials

    try:
        # Verify and decode JWT
        payload = decode_jwt(token)

        # Extract user_id from payload
        user_id = verify_jwt_payload(payload)

        return user_id

    except Exception as e:
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

    Use this dependency to prevent users from accessing other users' resources.

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


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for database session.

    Yields:
        AsyncSession: Database session
    """
    async for session in get_session():
        yield session
```

**Acceptance Criteria:**
- [ ] `get_current_user` extracts Bearer token from Authorization header
- [ ] `get_current_user` verifies JWT signature and extracts user_id
- [ ] `get_current_user` raises 401 for invalid/missing tokens
- [ ] `get_current_user_enforce_path` enforces user_id match
- [ ] `get_current_user_enforce_path` raises 403 for mismatched user_ids
- [ ] Dependencies are composable (can chain them in routes)

---

### 2.3 Route Handler Usage

**Example:** Protected route with JWT verification

```python
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, get_current_user_enforce_path

router = APIRouter()

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user_enforce_path),
):
    """
    List tasks for authenticated user.

    Automatically verifies:
    1. JWT token is valid (get_current_user)
    2. user_id in path matches user_id in token (get_current_user_enforce_path)
    """
    # current_user_id is guaranteed to match user_id in path
    # No need to re-check user isolation
    return {"tasks": [...], "user_id": current_user_id}
```

**Shortcut:** Use both dependencies in one line

```python
@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    _: str = Depends(get_current_user_enforce_path),  # Validates and discards
):
    # user_id is validated, use it directly
    return {"tasks": [...], "user_id": user_id}
```

**Acceptance Criteria:**
- [ ] All `/api/` routes use `get_current_user` or `get_current_user_enforce_path`
- [ ] Routes with `user_id` path parameter use `get_current_user_enforce_path`
- [ ] JWT verification is enforced at dependency level (not in route logic)
- [ ] Route handlers can assume user is authenticated

---

## 3. CORS Configuration

### 3.1 CORS Middleware Setup

**File:** `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Hackathon Todo API",
    description="RESTful API for multi-user Todo application with JWT authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Get frontend URL from environment
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow specific origins (not "*" for security)
    allow_origins=[
        frontend_url,
        "http://localhost:3000",  # Development
        "http://localhost:3001",  # Alternate dev port
        "http://127.0.0.1:3000",  # Loopback
    ],
    # Allow credentials (cookies, authorization headers)
    allow_credentials=True,
    # Allow HTTP methods
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",  # Preflight
    ],
    # Allow HTTP headers
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "X-Requested-With",
    ],
    # Cache preflight response for 10 minutes
    max_age=600,
)

# Include routers
from app.api import tasks, health

app.include_router(tasks.router)
app.include_router(health.router)

@app.get("/")
async def root():
    return {
        "message": "Hackathon Todo API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
```

**Acceptance Criteria:**
- [ ] CORS middleware configured before routers
- [ ] `allow_origins` includes frontend URL (not "*" for security)
- [ ] `allow_credentials=True` (required for Authorization header)
- [ ] `allow_methods` includes all CRUD methods
- [ ] `allow_headers` includes Authorization and Content-Type
- [ ] Preflight caching enabled (max_age=600)

---

### 3.2 Preflight Request Handling

**OPTIONS Request Example:**
```http
OPTIONS /api/abc123/tasks HTTP/1.1
Host: localhost:8000
Origin: http://localhost:3000
Access-Control-Request-Method: GET
Access-Control-Request-Headers: Authorization
```

**Response:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Content-Length: 0
```

**Acceptance Criteria:**
- [ ] Preflight OPTIONS requests return 200 OK
- [ ] Response includes all required CORS headers
- [ ] Preflight response is cached (max_age header)
- [ ] Preflight requests don't require authentication (skip JWT check)

---

## 4. Frontend Integration

### 4.1 JWT Token Format

**Frontend (Better Auth) → Backend (FastAPI)**

Better Auth JWT plugin issues tokens with this payload structure:

```json
{
  "sub": "user-uuid-string",        // Subject (user_id)
  "iss": "hackathon-todo",          // Issuer
  "aud": "hackathon-todo-api",      // Audience
  "iat": 1708000000,                // Issued at (Unix timestamp)
  "exp": 1708600000,                // Expiration (Unix timestamp)
  "email": "user@example.com"       // Additional claims
}
```

**Backend Verification:**
```python
# backend/app/core/security.py
def decode_jwt(token: str) -> Dict[str, Any]:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    # Extract user_id from 'sub' claim (standard JWT)
    user_id = payload.get("sub")

    # Verify issuer and audience (optional but recommended)
    if payload.get("iss") != "hackathon-todo":
        raise PyJWTError("Invalid token issuer")

    if payload.get("aud") != "hackathon-todo-api":
        raise PyJWTError("Invalid token audience")

    return payload
```

**Acceptance Criteria:**
- [ ] Backend verifies JWT signature with shared secret
- [ ] Backend extracts user_id from `sub` claim
- [ ] Backend verifies `iss` (issuer) matches "hackathon-todo"
- [ ] Backend verifies `aud` (audience) matches "hackathon-todo-api"
- [ ] Backend enforces token expiration (`exp` claim)

---

### 4.2 Frontend API Client Integration

**Reference:** `frontend/lib/api-client.ts` (from @specs/features/authentication-frontend.md Section 3.2)

**Frontend Request:**
```typescript
// Frontend automatically attaches JWT token
const response = await fetch("http://localhost:8000/api/abc123/tasks", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

**Backend Processing:**
1. Middleware extracts `Authorization` header
2. Dependency verifies JWT signature
3. Dependency extracts user_id from token
4. Dependency enforces user_id match with path
5. Route handler executes with authenticated context

**Error Handling:**
```typescript
// Frontend handles 401 errors
if (response.status === 401) {
  // Token expired or invalid → redirect to login
  window.location.href = "/login";
}
```

**Acceptance Criteria:**
- [ ] Frontend sends `Authorization: Bearer <token>` header
- [ ] Backend extracts token from header
- [ ] Backend verifies token signature and expiration
- [ ] Backend returns 401 if token is invalid/expired
- [ ] Frontend redirects to `/login` on 401

---

## 5. Error Handling

### 5.1 Authentication Errors

**401 Unauthorized Scenarios:**

| Scenario | Error Message | Solution |
|----------|---------------|----------|
| Missing Authorization header | "Missing authorization token" | Frontend must include token |
| Invalid token signature | "Invalid token: Signature verification failed" | Token tampered, re-authenticate |
| Expired token | "Token has expired" | Token expired (>7 days), re-authenticate |
| Malformed token | "Invalid token: Not enough segments" | Token corrupted, re-authenticate |
| Missing user_id in payload | "Invalid token payload: missing user_id" | Frontend JWT config issue |

**Implementation:**
```python
# backend/app/core/errors.py
from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

async def auth_exception_handler(request: Request, exc: HTTPException):
    """Handle authentication errors with logging"""
    logger.warning(f"Auth failed: {exc.detail} - Path: {request.url.path}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": "AUTH_FAILED" if exc.status_code == 401 else "FORBIDDEN"
        },
    )
```

**Acceptance Criteria:**
- [ ] All auth errors return 401 with descriptive message
- [ ] Error messages are logged (for debugging)
- [ ] Errors include error code for frontend handling
- [ ] Stack traces not exposed to client (security)

---

### 5.2 Authorization Errors

**403 Forbidden Scenarios:**

| Scenario | Error Message | Solution |
|----------|---------------|----------|
| User ID mismatch | "User ID mismatch: token user_id (abc) does not match path user_id (xyz)" | Frontend bug or malicious attempt |
| Token user_id missing | "Invalid token payload: missing user_id" | Frontend JWT config issue |

**Implementation:**
```python
# backend/app/api/deps.py
async def get_current_user_enforce_path(
    path_user_id: str,
    current_user_id: str = Depends(get_current_user),
) -> str:
    if current_user_id != path_user_id:
        # Log security event
        logger.warning(
            f"User ID mismatch attempt: token={current_user_id}, "
            f"path={path_user_id}"
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"User ID mismatch: token user_id ({current_user_id}) "
                f"does not match path user_id ({path_user_id})"
            ),
        )

    return current_user_id
```

**Acceptance Criteria:**
- [ ] User ID mismatches return 403 (not 401)
- [ ] Security events are logged (audit trail)
- [ ] Error messages include both user_ids (for debugging)
- [ ] Rate limiting considered for repeated violations (bonus)

---

## 6. Testing

### 6.1 Unit Tests

**File:** `backend/tests/test_auth.py`

```python
import pytest
from jwt import encode
from app.core.security import decode_jwt, verify_jwt_payload, create_test_token
from app.api.deps import get_current_user

def test_decode_valid_token():
    """Test decoding a valid JWT token"""
    # Create test token
    token = create_test_token("user-123")

    # Decode
    payload = decode_jwt(token)

    assert payload["sub"] == "user-123"
    assert payload["iss"] == "hackathon-todo"

def test_decode_invalid_token():
    """Test decoding an invalid JWT token"""
    with pytest.raises(Exception) as exc_info:
        decode_jwt("invalid.token.here")

    assert "Invalid token" in str(exc_info.value)

def test_verify_jwt_payload_valid():
    """Test extracting user_id from valid payload"""
    payload = {
        "sub": "user-456",
        "iss": "hackathon-todo",
        "aud": "hackathon-todo-api",
    }

    user_id = verify_jwt_payload(payload)

    assert user_id == "user-456"

def test_verify_jwt_payload_missing_user_id():
    """Test payload without user_id"""
    payload = {
        "iss": "hackathon-todo",
        "aud": "hackathon-todo-api",
    }

    with pytest.raises(ValueError) as exc_info:
        verify_jwt_payload(payload)

    assert "missing user_id" in str(exc_info.value)
```

**Acceptance Criteria:**
- [ ] Unit tests for `decode_jwt()`
- [ ] Unit tests for `verify_jwt_payload()`
- [ ] Unit tests for `get_current_user()` dependency
- [ ] Unit tests for `get_current_user_enforce_path()` dependency
- [ ] Tests cover valid tokens, invalid tokens, expired tokens

---

### 6.2 Integration Tests

**File:** `backend/tests/test_auth_integration.py`

```python
import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI

@pytest.mark.asyncio
async def test_protected_route_with_valid_token(app: FastAPI):
    """Test accessing protected route with valid JWT"""
    # Create test token
    token = create_test_token("user-789")

    # Make request
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/user-789/tasks",
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 200

@pytest.mark.asyncio
async def test_protected_route_with_invalid_token(app: FastAPI):
    """Test accessing protected route with invalid JWT"""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get(
            "/api/user-789/tasks",
            headers={"Authorization": "Bearer invalid.token"}
        )

    assert response.status_code == 401
    assert "detail" in response.json()

@pytest.mark.asyncio
async def test_user_id_enforcement(app: FastAPI):
    """Test that user_id in path must match token"""
    token = create_test_token("user-123")

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        # Try to access user-456's tasks with user-123's token
        response = await client.get(
            "/api/user-456/tasks",  # Different user_id
            headers={"Authorization": f"Bearer {token}"}
        )

    assert response.status_code == 403
    assert "User ID mismatch" in response.json()["detail"]
```

**Acceptance Criteria:**
- [ ] Integration tests for protected routes
- [ ] Tests for valid token access
- [ ] Tests for invalid token rejection
- [ ] Tests for user ID mismatch detection
- [ ] Tests use ASGI transport for async FastAPI testing

---

## 7. Security Considerations

### 7.1 Secret Management

**Requirements:**
- [ ] `BETTER_AUTH_SECRET` is at least 32 characters (cryptographically secure)
- [ ] Secret is identical across frontend and backend
- [ ] Secret is never committed to git (use `.gitignore`)
- [ ] `.env.example` provided without actual secret
- [ ] Production secrets stored in environment variables (not .env files)

**Generation:**
```bash
# Generate cryptographically secure secret (32 bytes)
openssl rand -base64 32

# Output example:
# Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
```

**Rotation (Future Enhancement):**
- Document secret rotation procedure in runbook
- Support multiple active secrets (grace period)
- Re-issue tokens on rotation

---

### 7.2 Token Expiration

**Configuration:**
```bash
JWT_EXPIRATION_DAYS=7  # Token valid for 7 days
```

**Verification:**
```python
# backend/app/core/security.py
from datetime import datetime, timedelta

def decode_jwt(token: str) -> Dict[str, Any]:
    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        # Exp verification is automatic via 'exp' claim
    )

    # Optional: Check expiration manually
    exp = payload.get("exp")
    if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
        raise PyJWTError("Token has expired")

    return payload
```

**Acceptance Criteria:**
- [ ] Token expiration is enforced (default: 7 days)
- [ ] Expired tokens return 401 with "Token has expired"
- [ ] Expiration time is configurable via env var
- [ ] Frontend handles 401 by redirecting to login

---

### 7.3 Cross-Origin Security

**CORS Best Practices:**
- [ ] `allow_origins` uses specific URLs (not "*" for production)
- [ ] `allow_credentials=True` (required for Authorization header)
- [ ] Preflight caching enabled (max_age=600)
- [ ] Development origins allowed (localhost:3000, 127.0.0.1:3000)
- [ ] Production origin configured via `FRONTEND_URL` env var

**Acceptance Criteria:**
- [ ] CORS is configured before routers (middleware order)
- [ ] Only frontend origin is allowed (no wildcard)
- [ ] Credentials are supported (cookies, auth headers)
- [ ] Preflight requests are cached (performance)

---

## 8. Cross-References

**Related Specifications:**
- @constitution.md Section 2 – Security & authentication rules
- @constitution.md Section 2.2 – Shared secret configuration
- @specs/features/authentication-frontend.md – Frontend JWT issuance
- @specs/api/rest-endpoints.md – Protected API endpoints
- @specs/features/task-crud-backend.md – Route handler usage

**Skills to Use:**
- `fastapi-jwt-middleware-neon` – Complete JWT verification implementation
- `better-auth-jwt-setup` – Frontend JWT issuance (reference)

**Implementation Files:**
- `backend/app/core/security.py` – JWT verification functions
- `backend/app/api/deps.py` – FastAPI dependencies for auth
- `backend/app/main.py` – CORS middleware configuration
- `backend/.env` – Environment variables (secrets)

---

## 9. Development Workflow

### 9.1 Setup Steps

**1. Configure Environment Variables:**
```bash
cd backend
cp .env.example .env
# Edit .env with actual values
```

**2. Install Dependencies:**
```bash
pip install fastapi[all] uvicorn sqlmodel pyjwt asyncpg
# Or using uv:
uv pip install fastapi[all] uvicorn sqlmodel pyjwt asyncpg
```

**3. Verify JWT Configuration:**
```bash
python -c "
from app.core.security import decode_jwt, create_test_token
token = create_test_token('test-user')
print('Token:', token)
payload = decode_jwt(token)
print('Decoded:', payload)
"
```

**4. Run Development Server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**5. Test Authentication:**
```bash
# Test with valid token
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/user_123/tasks

# Test without token (should fail)
curl http://localhost:8000/api/user_123/tasks
```

---

### 9.2 Testing Checklist

**Authentication:**
- [ ] Valid token allows access to protected routes
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Missing token returns 401
- [ ] Token payload includes user_id

**Authorization:**
- [ ] User ID mismatch returns 403
- [ ] Valid user can access their own resources
- [ ] User cannot access other users' resources
- [ ] Security events are logged

**CORS:**
- [ ] Preflight OPTIONS request succeeds
- [ ] Frontend origin is allowed
- [ ] Other origins are rejected
- [ ] Authorization header is allowed
- [ ] Credentials are supported

**Integration:**
- [ ] Frontend can successfully call backend API
- [ ] Frontend handles 401 errors (redirects to login)
- [ ] JWT token is attached to all requests
- [ ] Token is verified on every request

---

**End of specs/authentication-backend.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
