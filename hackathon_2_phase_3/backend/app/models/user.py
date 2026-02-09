"""User model (read-only reference to Better Auth users)."""
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List


class User(SQLModel, table=True):
    """
    User model (read-only reference to Better Auth users).

    Note: Backend does NOT create/update/delete users.
    Better Auth handles all user CRUD operations on the frontend.
    Backend only references user.id as foreign key in tasks.
    """
    __tablename__ = "user"  # Matches Better Auth table name

    id: str = Field(default=None, primary_key=True)  # UUID string
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: Optional[str] = Field(default=None)  # Read-only
    updated_at: Optional[str] = Field(default=None)  # Read-only

    # Relationship to tasks
    tasks: List["Task"] = Relationship(back_populates="user")
