"""Pydantic schemas for task validation and serialization."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# Request Schemas
class TaskBase(BaseModel):
    """Base task schema with common fields."""
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
    """Schema for creating a task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")

    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError('title cannot be empty or whitespace only')
        return v.strip() if v else v


class TaskToggleComplete(BaseModel):
    """Schema for toggling task completion."""
    completed: Optional[bool] = None  # If None, toggles current state


# Response Schemas
class TaskResponse(TaskBase):
    """Schema for task response."""
    id: str
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode


class TaskListResponse(BaseModel):
    """Schema for paginated task list."""
    tasks: list[TaskResponse]
    total: int
    limit: int
    offset: int
