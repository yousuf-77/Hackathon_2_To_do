"""
JWT Authentication Middleware for Phase 3 MCP Tools
Verifies JWT tokens and extracts user_id for request context
"""
import jwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import config

# Bearer token scheme
security = HTTPBearer(auto_error=False)


class JWTAuthError(Exception):
    """JWT authentication error"""

    def __init__(self, message: str, status_code: int = 401):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def verify_and_extract_user(token: str) -> Dict[str, Any]:
    """Verify JWT token and extract user payload

    Args:
        token: JWT bearer token

    Returns:
        Decoded token payload with user_id

    Raises:
        JWTAuthError: If token is invalid or expired
    """
    try:
        # Decode and verify token
        # Note: options={"verify_aud": False} to allow any audience
        payload = jwt.decode(
            token,
            config.BETTER_AUTH_SECRET,
            algorithms=[config.JWT_ALGORITHM],
            options={"verify_aud": False},  # Disable audience verification
        )

        # Extract user_id (required)
        user_id = payload.get("user_id") or payload.get("sub")
        if not user_id:
            raise JWTAuthError(
                "Invalid token payload: missing user_id",
                status.HTTP_401_UNAUTHORIZED,
            )

        return {
            "user_id": user_id,
            "exp": payload.get("exp"),
            "iat": payload.get("iat"),
        }

    except jwt.ExpiredSignatureError:
        raise JWTAuthError(
            "Token has expired",
            status.HTTP_401_UNAUTHORIZED,
        )
    except jwt.InvalidTokenError as e:
        raise JWTAuthError(
            f"Invalid token: {str(e)}",
            status.HTTP_401_UNAUTHORIZED,
        )
    except Exception as e:
        raise JWTAuthError(
            f"Authentication error: {str(e)}",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> Dict[str, Any]:
    """FastAPI dependency to get current authenticated user

    Args:
        credentials: HTTP Bearer credentials (auto-extracted)

    Returns:
        User payload with user_id

    Raises:
        HTTPException: If authentication fails
    """
    import logging
    logger = logging.getLogger(__name__)

    if credentials is None:
        logger.error("=== No credentials provided ===")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        logger.info(f"=== Received token: {credentials.credentials[:50]}...")
        return verify_and_extract_user(credentials.credentials)
    except JWTAuthError as e:
        logger.error(f"=== JWT Error: {e.message} ===")
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message,
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(token: str) -> int:
    """Extract user_id from JWT token (synchronous version)

    Args:
        token: JWT bearer token

    Returns:
        User ID (integer)

    Raises:
        JWTAuthError: If token is invalid or missing user_id
    """
    payload = verify_and_extract_user(token)
    user_id = payload.get("user_id")

    if not user_id:
        raise JWTAuthError(
            "Invalid token payload: missing user_id",
            status.HTTP_401_UNAUTHORIZED,
        )

    # Convert to int if it's a string
    try:
        return int(user_id)
    except (ValueError, TypeError):
        raise JWTAuthError(
            f"Invalid user_id format: {user_id}",
            status.HTTP_401_UNAUTHORIZED,
        )
