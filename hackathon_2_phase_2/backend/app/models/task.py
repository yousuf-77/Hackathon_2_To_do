"""Task model for todo items."""
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.user import User


class TaskBase(SQLModel):
    """Base task schema with common fields."""
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default="medium", max_length=10)  # low, medium, high
    completed: bool = Field(default=False)


class Task(TaskBase, table=True):
    """
    Task model for todo items.

    All tasks are scoped to a user via user_id foreign key.
    """
    __tablename__ = "task"

    id: Optional[str] = Field(default=None, primary_key=True)  # UUID
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    # Relationship (optional, for JOIN queries)
    user: Optional["User"] = Relationship(back_populates="tasks")
