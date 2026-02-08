"""
TodoManager service for managing todo tasks in memory.

This module implements the business logic for todo operations using in-memory storage
as required by the constitution.
"""

from typing import List, Optional
try:
    from src.models.task import Task
except ImportError:
    from models.task import Task


class TodoManager:
    """
    Manages the collection of tasks in memory.

    This class handles all business logic for task operations including:
    - Adding new tasks with auto-incremented IDs
    - Retrieving tasks by ID
    - Updating task details
    - Deleting tasks
    - Listing all tasks
    """

    def __init__(self):
        """Initialize the TodoManager with an empty task list and ID counter."""
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """
        Add a new task with auto-incremented ID and default "Pending" status.

        Args:
            title (str): Title of the new task
            description (str): Description of the new task (optional)

        Returns:
            Task: The newly created task object
        """
        new_task = Task(task_id=self._next_id, title=title, description=description, status="Pending")
        self._tasks.append(new_task)
        self._next_id += 1
        return new_task

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by its ID.

        Args:
            task_id (int): ID of the task to retrieve

        Returns:
            Task: The task object if found, None otherwise
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks in the collection.

        Returns:
            List[Task]: List of all tasks
        """
        return self._tasks.copy()  # Return a copy to prevent external modification

    def update_task(self, task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> bool:
        """
        Update a task's title and/or description.

        Args:
            task_id (int): ID of the task to update
            title (str, optional): New title for the task
            description (str, optional): New description for the task

        Returns:
            bool: True if the task was found and updated, False otherwise
        """
        task = self.get_task_by_id(task_id)
        if task:
            task.update_details(title=title, description=description)
            return True
        return False

    def mark_complete(self, task_id: int) -> bool:
        """
        Mark a task as complete.

        Args:
            task_id (int): ID of the task to mark as complete

        Returns:
            bool: True if the task was found and marked complete, False otherwise
        """
        task = self.get_task_by_id(task_id)
        if task and task.status != "Completed":
            task.toggle_completion()
            return True
        return False

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by its ID.

        Args:
            task_id (int): ID of the task to delete

        Returns:
            bool: True if the task was found and deleted, False otherwise
        """
        task = self.get_task_by_id(task_id)
        if task:
            self._tasks.remove(task)
            return True
        return False

    def get_next_id(self) -> int:
        """
        Get the next available task ID without incrementing the counter.

        Returns:
            int: The next available task ID
        """
        return self._next_id

    def task_exists(self, task_id: int) -> bool:
        """
        Check if a task with the given ID exists.

        Args:
            task_id (int): ID to check for existence

        Returns:
            bool: True if a task with the ID exists, False otherwise
        """
        return self.get_task_by_id(task_id) is not None