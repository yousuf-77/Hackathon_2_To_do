"""Simple authentication endpoint that works with Better Auth users."""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.db.session import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = int(os.getenv("JWT_EXPIRATION_DAYS", "7"))

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user_id: str
    email: str

def create_jwt_token(user_id: str, email: str) -> str:
    """Create JWT token for user."""
    expires_delta = timedelta(days=JWT_EXPIRATION_DAYS)
    expires = datetime.utcnow() + expires_delta
    
    payload = {
        "sub": user_id,
        "iss": "hackathon-todo",
        "aud": "hackathon-todo-api",
        "email": email,
        "iat": datetime.utcnow(),
        "exp": expires,
    }
    
    encoded_jwt = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(
    request: LoginRequest,
    session = Depends(get_db)
    """Simple login endpoint that returns JWT for valid user."""
    
    # Raw SQL query to find user by email (case-insensitive)
    from app.models.user import User
    user_result = await session.execute(
        f"SELECT id, email, name, password_hash FROM user WHERE email ILIKE %s",
        {"email": request.email}
    )
    user = user_result.fetchone()
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Verify password
    if user[3] != request.password:  # password_hash is column 3
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    token = create_jwt_token(str(user[0]), user[1])
    
    return TokenResponse(
        token=token,
        user_id=str(user[0]),
        email=user[1]
    )
