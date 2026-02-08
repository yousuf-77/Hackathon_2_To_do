"""
Task data model for the todo application.

This module defines the Task class with proper typing as required by the constitution.
"""

from typing import Union


class Task:
    """
    Represents a single todo item with ID, Title, Description, and Status.

    Attributes:
        id (int): Unique identifier for the task (auto-incremented)
        title (str): Task title (non-empty string)
        description (str): Task description (can be empty)
        status (str): Task status ("Pending" or "Completed")
    """

    def __init__(self, task_id: int, title: str, description: str = "", status: str = "Pending"):
        """
        Initialize a Task instance.

        Args:
            task_id (int): Unique identifier for the task
            title (str): Task title
            description (str): Task description (defaults to empty string)
            status (str): Task status (defaults to "Pending")

        Raises:
            ValueError: If title is empty or status is not valid
        """
        self.id = task_id
        self.title = self._validate_title(title)
        self.description = description
        self.status = self._validate_status(status)

    def _validate_title(self, title: str) -> str:
        """Validate that the title is a non-empty string."""
        if not isinstance(title, str) or not title.strip():
            raise ValueError("Title must be a non-empty string")
        return title.strip()

    def _validate_description(self, description: str) -> str:
        """Validate that the description is a string."""
        if not isinstance(description, str):
            raise ValueError("Description must be a string")
        return description

    def _validate_status(self, status: str) -> str:
        """Validate that the status is either 'Pending' or 'Completed'."""
        if status not in ["Pending", "Completed"]:
            raise ValueError("Status must be either 'Pending' or 'Completed'")
        return status

    def toggle_completion(self) -> None:
        """Toggle the task status between Pending and Completed."""
        if self.status == "Pending":
            self.status = "Completed"
        # Note: According to spec, no reverse transition (completed remains completed)

    def update_details(self, title: Union[str, None] = None, description: Union[str, None] = None) -> None:
        """
        Update task details.

        Args:
            title (str, optional): New title for the task
            description (str, optional): New description for the task
        """
        if title is not None:
            self.title = self._validate_title(title)
        if description is not None:
            self.description = self._validate_description(description)

    def __repr__(self) -> str:
        """String representation of the Task."""
        return f"Task(id={self.id}, title='{self.title}', description='{self.description}', status='{self.status}')"

    def __str__(self) -> str:
        """Human-readable string representation of the Task."""
        status_indicator = "x" if self.status == "Completed" else " "
        return f"[{status_indicator}] {self.id}. {self.title} - {self.description}"