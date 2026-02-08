"""
Unit tests for TodoManager service.
"""

import pytest
from src.models.task import Task
from src.services.todo_manager import TodoManager


class TestTodoManager:
    """Test suite for TodoManager class."""

    def test_add_task_creates_new_task(self):
        """Test that add_task creates a new task with correct attributes."""
        todo_manager = TodoManager()
        title = "Test Task"
        description = "Test Description"

        task = todo_manager.add_task(title, description)

        assert isinstance(task, Task)
        assert task.id == 1
        assert task.title == title
        assert task.description == description
        assert task.status == "Pending"

    def test_add_task_auto_assigns_id(self):
        """Test that add_task auto-assigns incrementing IDs."""
        todo_manager = TodoManager()

        task1 = todo_manager.add_task("Task 1")
        task2 = todo_manager.add_task("Task 2")

        assert task1.id == 1
        assert task2.id == 2

    def test_add_task_defaults_status_to_pending(self):
        """Test that add_task defaults status to 'Pending'."""
        todo_manager = TodoManager()

        task = todo_manager.add_task("Test Task")

        assert task.status == "Pending"

    def test_get_task_by_id_returns_correct_task(self):
        """Test that get_task_by_id returns the correct task."""
        todo_manager = TodoManager()
        task = todo_manager.add_task("Test Task")

        retrieved_task = todo_manager.get_task_by_id(task.id)

        assert retrieved_task is not None
        assert retrieved_task.id == task.id
        assert retrieved_task.title == task.title

    def test_get_task_by_id_returns_none_for_invalid_id(self):
        """Test that get_task_by_id returns None for invalid ID."""
        todo_manager = TodoManager()

        retrieved_task = todo_manager.get_task_by_id(999)

        assert retrieved_task is None

    def test_get_all_tasks_returns_all_tasks(self):
        """Test that get_all_tasks returns all tasks."""
        todo_manager = TodoManager()
        task1 = todo_manager.add_task("Task 1")
        task2 = todo_manager.add_task("Task 2")

        all_tasks = todo_manager.get_all_tasks()

        assert len(all_tasks) == 2
        assert task1 in all_tasks
        assert task2 in all_tasks

    def test_update_task_updates_attributes(self):
        """Test that update_task updates task attributes."""
        todo_manager = TodoManager()
        task = todo_manager.add_task("Old Title", "Old Description")

        result = todo_manager.update_task(task.id, title="New Title", description="New Description")

        assert result is True
        assert task.title == "New Title"
        assert task.description == "New Description"

    def test_update_task_returns_false_for_invalid_id(self):
        """Test that update_task returns False for invalid ID."""
        todo_manager = TodoManager()

        result = todo_manager.update_task(999, title="New Title")

        assert result is False

    def test_mark_complete_changes_status(self):
        """Test that mark_complete changes task status to 'Completed'."""
        todo_manager = TodoManager()
        task = todo_manager.add_task("Test Task")

        result = todo_manager.mark_complete(task.id)

        assert result is True
        assert task.status == "Completed"

    def test_mark_complete_returns_false_for_invalid_id(self):
        """Test that mark_complete returns False for invalid ID."""
        todo_manager = TodoManager()

        result = todo_manager.mark_complete(999)

        assert result is False

    def test_delete_task_removes_task(self):
        """Test that delete_task removes the task from the collection."""
        todo_manager = TodoManager()
        task = todo_manager.add_task("Test Task")

        result = todo_manager.delete_task(task.id)

        assert result is True
        assert todo_manager.get_task_by_id(task.id) is None
        assert len(todo_manager.get_all_tasks()) == 0

    def test_delete_task_returns_false_for_invalid_id(self):
        """Test that delete_task returns False for invalid ID."""
        todo_manager = TodoManager()

        result = todo_manager.delete_task(999)

        assert result is False