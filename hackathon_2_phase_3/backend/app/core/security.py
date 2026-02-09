"""JWT security functions for authentication."""
import os
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
            audience="hackathon-todo-api",  # Match the audience in create_test_token
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
