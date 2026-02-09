---
name: fastapi-jwt-middleware-neon
description: |
  This skill helps Claude Code generate specs and code patterns for FastAPI JWT authentication middleware that verifies tokens (using PyJWT), extracts user_id from payload, integrates with SQLModel/Neon PostgreSQL, enforces user_id filtering on all Todo endpoints, handles 401/403 errors, and uses shared secret from env var (BETTER_AUTH_SECRET). Tailored for Hackathon II Phase II multi-user Todo backend. This skill activates automatically when users mention FastAPI middleware, JWT verification, PyJWT, user authentication in FastAPI, Neon DB integration with auth, or securing Todo API endpoints.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# FastAPI JWT Middleware with Neon Skill

## Overview
This skill provides comprehensive guidance for implementing JWT authentication middleware in FastAPI with SQLModel and Neon PostgreSQL integration. It covers token verification, user extraction, data isolation, and secure API endpoint protection for multi-user applications.

## When to Use This Skill
- Implementing JWT authentication middleware in FastAPI applications
- Integrating PyJWT with Better Auth shared secrets
- Enforcing user isolation in SQLModel/Neon PostgreSQL databases
- Securing Todo API endpoints with user-scoped access
- Implementing 401/403 error handling for authentication failures
- Setting up environment-based secret management
- Creating dependency injection patterns for current user access

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing FastAPI setup, SQLModel models, Neon DB configuration, environment variable patterns |
| **Conversation** | User's specific JWT payload structure, Better Auth integration details, data isolation requirements |
| **Skill References** | FastAPI security patterns, PyJWT best practices, SQLModel querying patterns |
| **User Guidelines** | Project-specific security requirements, authentication flow preferences, team standards |

Ensure all required context is gathered before implementing.

## Step-by-Step Implementation

### 1. Dependencies Installation
```bash
pip install pyjwt[crypto]
pip install python-multipart  # for OAuth2
pip install psycopg2-binary  # for PostgreSQL connections
```

### 2. Environment Configuration
```env
# .env
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

### 3. JWT Utilities Module
```python
# utils/jwt_utils.py
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import HTTPException, status
from jwt.exceptions import InvalidTokenError
import os

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("BETTER_AUTH_SECRET environment variable is not set")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create JWT access token with expiration
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """
    Verify JWT token and return payload
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### 4. Database Models with User Association
```python
# models/todo.py
from sqlmodel import SQLModel, Field, Relationship, create_engine, Session
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import os

if TYPE_CHECKING:
    from models.user import User

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: "User" = Relationship(back_populates="todos")

# Create engine and session
engine = create_engine(DATABASE_URL, echo=False)
```

### 5. JWT Middleware Implementation
```python
# middleware/jwt_middleware.py
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
from utils.jwt_utils import verify_token

security = HTTPBearer()

class JWTMiddleware:
    """
    JWT Authentication Middleware for FastAPI
    """

    @staticmethod
    async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
        """
        Verify JWT token and extract user information
        """
        token = credentials.credentials

        payload = verify_token(token)

        # Extract user information from token
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Additional claims validation can be added here
        email = payload.get("email")

        return {
            "user_id": user_id,
            "email": email,
            "token_payload": payload
        }

# Dependency for route protection
async def get_current_user(request: Request) -> Dict:
    """
    Dependency to get current authenticated user
    """
    # Access the middleware instance or verify token directly
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.replace("Bearer ", "")
    payload = verify_token(token)

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user_id": user_id,
        "email": payload.get("email"),
        "payload": payload
    }
```

### 6. Database Session with User Context
```python
# database/session.py
from sqlmodel import Session, create_engine, select
from models.todo import Todo, engine
from typing import Generator, Optional
from fastapi import Depends
import os

DATABASE_URL = os.getenv("NEON_DATABASE_URL")
engine = create_engine(DATABASE_URL)

def get_session() -> Generator[Session, None, None]:
    """
    Get database session dependency
    """
    with Session(engine) as session:
        yield session

def get_user_filtered_session(current_user: dict = Depends(get_current_user)) -> Generator[Session, None, None]:
    """
    Get database session with user context for data isolation
    """
    with Session(engine) as session:
        # Store user context in session for potential use in queries
        session.current_user_id = current_user["user_id"]
        yield session
```

### 7. Protected Routes with User Filtering
```python
# routers/todo.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import Session, select, func
from models.todo import Todo, get_session
from middleware.jwt_middleware import get_current_user
from typing import List, Optional, Dict
from datetime import datetime

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/", response_model=List[Todo])
async def get_todos(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None
):
    """
    Get todos for the authenticated user only
    """
    query = select(Todo).where(Todo.user_id == current_user["user_id"])

    if completed is not None:
        query = query.where(Todo.completed == completed)

    query = query.offset(skip).limit(limit).order_by(Todo.created_at.desc())

    todos = session.exec(query).all()
    return todos

@router.get("/{todo_id}", response_model=Todo)
async def get_todo(
    todo_id: int,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific todo owned by the authenticated user
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not authorized to access this todo"
        )

    return todo

@router.post("/", response_model=Todo)
async def create_todo(
    todo_data: Todo,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new todo for the authenticated user
    """
    # Ensure the todo belongs to the current user
    todo = Todo(
        title=todo_data.title,
        description=todo_data.description,
        completed=todo_data.completed,
        user_id=current_user["user_id"]
    )

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo

@router.put("/{todo_id}", response_model=Todo)
async def update_todo(
    todo_id: int,
    todo_update: Todo,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a todo owned by the authenticated user
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not authorized to update this todo"
        )

    # Update todo with new values
    for field, value in todo_update.dict(exclude_unset=True).items():
        if field not in ["id", "user_id"]:  # Prevent changing these fields
            setattr(todo, field, value)

    todo.updated_at = datetime.utcnow()
    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo

@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a todo owned by the authenticated user
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not authorized to delete this todo"
        )

    session.delete(todo)
    session.commit()

    return {"message": "Todo deleted successfully"}

@router.patch("/{todo_id}/toggle", response_model=Todo)
async def toggle_todo_completion(
    todo_id: int,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle completion status of a todo owned by the authenticated user
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Not authorized to modify this todo"
        )

    todo.completed = not todo.completed
    todo.updated_at = datetime.utcnow()
    session.add(todo)
    session.commit()
    session.refresh(todo)

    return todo

@router.get("/stats", response_model=Dict)
async def get_todo_stats(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get statistics for the authenticated user's todos
    """
    total_count = session.exec(
        select(func.count(Todo.id)).where(Todo.user_id == current_user["user_id"])
    ).one()

    completed_count = session.exec(
        select(func.count(Todo.id))
        .where(Todo.user_id == current_user["user_id"])
        .where(Todo.completed == True)
    ).one()

    pending_count = total_count - completed_count

    return {
        "total": total_count,
        "completed": completed_count,
        "pending": pending_count,
        "completion_rate": total_count and (completed_count / total_count) * 100 or 0
    }
```

### 8. Application Main with Middleware
```python
# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers.todo import router as todo_router
from middleware.jwt_middleware import get_current_user
from typing import Dict
import uvicorn
import os

app = FastAPI(title="Todo API with JWT Auth", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(todo_router)

@app.get("/")
async def root():
    return {"message": "Todo API with JWT Authentication"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """
    Get information about the current authenticated user
    """
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "authenticated": True
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
```

### 9. Custom Exception Handlers
```python
# middleware/exception_handlers.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions with consistent error format
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Exception",
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with consistent format
    """
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "status_code": 422
        }
    )

# Register exception handlers in main app
def register_exception_handlers(app):
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
```

## Security Considerations

### 1. Secret Management
```python
# utils/secrets.py
import os
from cryptography.fernet import Fernet

def get_secret_key():
    """
    Get secret key from environment or generate a new one (for development)
    """
    secret = os.getenv("BETTER_AUTH_SECRET")
    if not secret:
        raise ValueError("BETTER_AUTH_SECRET environment variable is required")

    # Ensure the secret is of proper length for algorithms
    if len(secret) < 32:
        raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters long")

    return secret
```

### 2. Token Validation Best Practices
```python
# utils/token_validator.py
from datetime import datetime, timezone
from typing import Dict
import jwt
from fastapi import HTTPException, status
from utils.jwt_utils import SECRET_KEY, ALGORITHM

def validate_token_payload(payload: Dict) -> bool:
    """
    Additional validation for JWT payload beyond PyJWT
    """
    # Check if token has required claims
    required_claims = ["user_id", "exp"]
    for claim in required_claims:
        if claim not in payload:
            return False

    # Check expiration
    exp = payload.get("exp")
    if exp:
        if isinstance(exp, (int, float)):
            if datetime.now(timezone.utc).timestamp() > exp:
                return False
        else:
            return False

    # Check for additional security claims if needed
    # iat (issued at), nbf (not before), etc.

    return True

def secure_verify_token(token: str) -> Dict:
    """
    Enhanced token verification with additional security checks
    """
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": False,
                "verify_iat": False,
                "verify_aud": False,
                "verify_iss": False,
            }
        )

        # Additional validation
        if not validate_token_payload(payload):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: failed additional validation",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### 3. SQL Injection Prevention
All database queries use SQLModel's parameterized queries, which automatically prevent SQL injection. The user filtering is implemented using proper WHERE clauses with bound parameters.

## Error Handling Patterns

### 1. Consistent Error Responses
```python
# utils/error_responses.py
from fastapi import HTTPException, status
from typing import Dict, Any

def unauthorized_error(detail: str = "Not authenticated"):
    """
    Standardized 401 Unauthorized error
    """
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )

def forbidden_error(detail: str = "Access forbidden"):
    """
    Standardized 403 Forbidden error
    """
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )

def not_found_error(resource: str = "Resource"):
    """
    Standardized 404 Not Found error
    """
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} not found",
    )
```

### 2. Rate Limiting (Optional Enhancement)
```python
# middleware/rate_limiter.py
from functools import wraps
from fastapi import HTTPException, status
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, max_requests: int = 100, window: int = 60):
        self.max_requests = max_requests
        self.window = window
        self.requests = defaultdict(list)

    def is_allowed(self, user_id: str) -> bool:
        now = time.time()
        # Clean old requests
        self.requests[user_id] = [req_time for req_time in self.requests[user_id] if now - req_time < self.window]

        if len(self.requests[user_id]) >= self.max_requests:
            return False

        self.requests[user_id].append(now)
        return True

rate_limiter = RateLimiter(max_requests=50, window=60)  # 50 requests per minute
```

## Quality Assurance Checklist

- [ ] JWT middleware properly implemented with PyJWT
- [ ] Token verification with BETTER_AUTH_SECRET from environment
- [ ] User ID extraction from JWT payload
- [ ] User-scoped data access enforced in all Todo endpoints
- [ ] 401/403 error handling implemented consistently
- [ ] SQLModel models properly configured with user relationships
- [ ] Neon PostgreSQL connection established and tested
- [ ] Environment variables properly configured
- [ ] Dependency injection patterns implemented correctly
- [ ] Security best practices followed (secret management, token validation)
- [ ] Error responses are consistent and informative
- [ ] All endpoints properly protected with authentication
- [ ] Data isolation verified (users can only access their own data)
- [ ] Token expiration handling implemented
- [ ] CORS configuration properly set up

## References and Further Reading

- FastAPI Security Documentation: https://fastapi.tiangolo.com/tutorial/security/
- PyJWT Documentation: https://pyjwt.readthedocs.io/
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- Neon PostgreSQL Documentation: https://neon.tech/docs
- OAuth2 Specification: https://oauth.net/2/
- JWT RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html