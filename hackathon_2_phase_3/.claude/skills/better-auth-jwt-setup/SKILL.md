---
name: better-auth-jwt-setup
description: |
  This skill guides Claude Code to generate perfect spec-driven implementation steps and code skeletons for setting up Better Auth with JWT tokens in a Next.js frontend + FastAPI backend project. Covers enabling JWT in Better Auth config, issuing tokens on login, attaching Bearer token to API calls from frontend, verifying token in FastAPI middleware with shared secret, extracting user_id, and enforcing user-scoped data access. This skill activates automatically when users ask about Better Auth, JWT setup, authentication flow, token verification in FastAPI, shared secret configuration, or securing REST API endpoints for multi-user Todo app.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Better Auth JWT Setup Skill

## Overview
This skill provides comprehensive guidance for implementing Better Auth with JWT tokens in a Next.js + FastAPI application. It covers the complete authentication flow from initial configuration to secure API access with user isolation.

## When to Use This Skill
- Setting up Better Auth with JWT tokens in Next.js applications
- Implementing authentication flow with JWT token issuance
- Attaching JWT tokens to API calls from Next.js frontend
- Verifying JWT tokens in FastAPI backend middleware
- Configuring shared secrets between Better Auth and FastAPI
- Enforcing user-scoped data access in Todo applications
- Securing REST API endpoints for multi-user applications

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing auth configuration, Next.js setup, FastAPI structure, environment variable patterns |
| **Conversation** | User's specific requirements for auth flow, data isolation needs, existing auth patterns |
| **Skill References** | JWT best practices, Better Auth configuration patterns, FastAPI security middleware |
| **User Guidelines** | Project-specific conventions, security requirements, team standards |

Ensure all required context is gathered before implementing.

## Core Implementation Workflow

### 1. Better Auth Configuration with JWT

Configure Better Auth to enable JWT token generation and management:

```typescript
// lib/auth.ts (or wherever you configure Better Auth)
import { init } from "@better-auth/react";

export const auth = init({
  // ...other configuration
  jwt: {
    secret: process.env.BETTER_AUTH_SECRET!,
    expiresIn: "7d", // Token expiration
  },
  // Ensure JWT is enabled
  socialProviders: {
    // ...social providers if needed
  },
});
```

### 2. Environment Variables Setup

Configure shared secrets for JWT validation:

```env
# .env.local (frontend)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here

# .env (backend/FastAPI)
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=your-database-url
```

### 3. Next.js Frontend Integration

Implement JWT token handling in Next.js frontend:

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useAuth as useBetterAuth } from '@better-auth/react';

export const useAuthWithJWT = () => {
  const { signIn, signOut, session } = useBetterAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      setToken(session.accessToken);
      // Store token in localStorage or sessionStorage for API calls
      localStorage.setItem('auth_token', session.accessToken);
    }
  }, [session]);

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  return {
    signIn,
    signOut,
    session,
    token,
    makeAuthenticatedRequest,
  };
};
```

### 4. FastAPI Backend JWT Middleware

Implement JWT verification middleware in FastAPI:

```python
# middleware/jwt_auth.py
from fastapi import HTTPException, Request, Depends
from fastapi.security.http import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Dict, Optional
import os

security = HTTPBearer()

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Verify JWT token and extract user information
    """
    token = credentials.credentials

    try:
        # Decode JWT token using shared secret
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user_id")

        return {
            "user_id": user_id,
            "email": email,
            "token": token
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication required")

# Dependency for route protection
async def get_current_user(request: Request) -> Dict:
    return verify_jwt_token(request.auth.credentials if hasattr(request, 'auth') else None)
```

### 5. Protected Route Implementation

Apply JWT authentication to FastAPI endpoints:

```python
# routers/todo.py
from fastapi import APIRouter, Depends
from middleware.jwt_auth import get_current_user
from models.todo import TodoCreate, TodoUpdate
from sqlmodel import Session, select
import os

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("/")
async def create_todo(todo: TodoCreate, current_user: dict = Depends(get_current_user)):
    """Create a todo item for the authenticated user"""
    with Session(os.getenv("DATABASE_URL")) as session:
        todo_item = Todo(
            title=todo.title,
            description=todo.description,
            user_id=current_user["user_id"],
            completed=False
        )
        session.add(todo_item)
        session.commit()
        session.refresh(todo_item)
        return todo_item

@router.get("/")
async def get_todos(current_user: dict = Depends(get_current_user)):
    """Get todos for the authenticated user only"""
    with Session(os.getenv("DATABASE_URL")) as session:
        statement = select(Todo).where(Todo.user_id == current_user["user_id"])
        todos = session.exec(statement).all()
        return todos

@router.put("/{todo_id}")
async def update_todo(todo_id: int, todo_update: TodoUpdate, current_user: dict = Depends(get_current_user)):
    """Update a todo item owned by the authenticated user"""
    with Session(os.getenv("DATABASE_URL")) as session:
        statement = select(Todo).where(Todo.id == todo_id).where(Todo.user_id == current_user["user_id"])
        todo = session.exec(statement).first()

        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found or access denied")

        # Update todo with new values
        for field, value in todo_update.dict(exclude_unset=True).items():
            setattr(todo, field, value)

        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
```

## Security Best Practices

### 1. Secret Management
- Store `BETTER_AUTH_SECRET` securely in environment variables
- Use different secrets for development and production
- Never commit secrets to version control
- Rotate secrets periodically

### 2. Token Security
- Set appropriate expiration times (e.g., 15 minutes for access tokens, 7 days for refresh tokens)
- Use HTTPS in production to prevent token interception
- Consider implementing token blacklisting for logout functionality
- Validate token audience and issuer if applicable

### 3. Data Isolation
- Always filter database queries by `user_id`
- Implement row-level security at the database level when possible
- Validate ownership before allowing modifications
- Log authentication-related events for audit trails

## Common Pitfalls to Avoid

### 1. Token Storage Issues
- ❌ Storing JWT tokens in plain cookies without proper security flags
- ✅ Store tokens in HTTP-only, secure cookies or memory
- ❌ Exposing tokens in client-side logs
- ✅ Sanitize logs to exclude sensitive token information

### 2. Authentication Bypass
- ❌ Forgetting to apply authentication middleware to routes
- ✅ Use dependency injection to enforce authentication consistently
- ❌ Not validating user ownership of resources
- ✅ Always verify the user owns the requested resource

### 3. Secret Exposure
- ❌ Hardcoding secrets in source code
- ✅ Use environment variables and secure vaults
- ❌ Using weak secrets
- ✅ Generate strong random secrets (at least 32 characters)

## Integration Patterns

### 1. Client-Side Authentication State Management
```typescript
// utils/auth-utils.ts
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    return Date.now() < exp * 1000; // Check if token is expired
  } catch {
    return false;
  }
};

export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};
```

### 2. Error Handling for Authentication
```python
# middleware/error_handlers.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

async def jwt_exception_handler(request: Request, exc: HTTPException):
    """
    Handle JWT authentication errors gracefully
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": "AUTH_ERROR"}
    )
```

## Testing Considerations

### 1. Authentication Flow Testing
- Test token issuance during login
- Verify token expiration handling
- Validate user isolation in data access
- Test authentication bypass attempts

### 2. JWT Verification Testing
- Test valid token verification
- Test expired token rejection
- Test malformed token handling
- Test invalid signature rejection

## References and Further Reading

- Better Auth Official Documentation: https://better-auth.com/docs
- FastAPI Security Documentation: https://fastapi.tiangolo.com/tutorial/security/
- JWT RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
- OAuth 2.0 Security Best Current Practice: https://tools.ietf.org/html/draft-ietf-oauth-security-topics

## Quality Assurance Checklist

- [ ] JWT configuration properly implemented in Better Auth
- [ ] Shared secret correctly configured in both frontend and backend
- [ ] JWT tokens issued upon successful authentication
- [ ] Bearer tokens attached to API requests from frontend
- [ ] FastAPI middleware validates JWT tokens properly
- [ ] User ID extracted from JWT token in backend
- [ ] Database queries filtered by user ID for data isolation
- [ ] Proper error handling for authentication failures
- [ ] Environment variables securely managed
- [ ] Security best practices followed (HTTPS, token expiration, etc.)
- [ ] All protected endpoints require valid JWT tokens
- [ ] Test coverage includes authentication flow validation