"""FastAPI dependencies for authentication and database."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
from jwt import PyJWTError

from app.core.security import decode_jwt, verify_jwt_payload

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
    user_id: str,  # This will be injected from the path parameter
    current_user_id: str = Depends(get_current_user),
) -> str:
    """
    Enforce that user_id in URL path matches user_id in JWT token.

    This prevents users from accessing other users' resources.

    Args:
        user_id: user_id from URL path parameter
        current_user_id: user_id from JWT token (injected by get_current_user)

    Returns:
        str: user_id (validated)

    Raises:
        HTTPException 403: If user_id in path doesn't match token
    """
    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"User ID mismatch: token user_id ({current_user_id}) "
                f"does not match path user_id ({user_id})"
            ),
        )

    return current_user_id
