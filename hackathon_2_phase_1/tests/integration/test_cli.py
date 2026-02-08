"""
Integration tests for CLI interface.
"""

import io
import sys
from unittest.mock import patch
from src.services.todo_manager import TodoManager
from src.cli.interface import add_task_flow, view_tasks_flow


class TestCLIIntegration:
    """Integration test suite for CLI functionality."""

    def test_add_task_flow_integration(self):
        """Test that add_task_flow integrates properly with TodoManager."""
        todo_manager = TodoManager()

        # Mock user input for title and description
        inputs = iter(["New Task Title", "New Task Description"])

        def mock_input(prompt):
            return next(inputs)

        with patch('builtins.input', mock_input):
            add_task_flow(todo_manager)

        # Verify the task was added to the manager
        tasks = todo_manager.get_all_tasks()
        assert len(tasks) == 1
        task = tasks[0]
        assert task.title == "New Task Title"
        assert task.description == "New Task Description"
        assert task.status == "Pending"
        assert task.id == 1  # Auto-incremented ID

    def test_add_task_flow_empty_title_validation(self):
        """Test that add_task_flow handles empty title validation."""
        todo_manager = TodoManager()

        # Mock user input with empty title
        inputs = iter(["", "Test Description"])

        def mock_input(prompt):
            return next(inputs)

        # Capture printed output
        captured_output = io.StringIO()
        sys.stdout = captured_output

        try:
            with patch('builtins.input', mock_input):
                add_task_flow(todo_manager)
        finally:
            sys.stdout = sys.__stdout__  # Restore original stdout

        # Verify no task was added due to validation error
        tasks = todo_manager.get_all_tasks()
        assert len(tasks) == 0

        # Verify error message was printed
        output = captured_output.getvalue()
        assert "Error: Title cannot be empty" in output

    def test_view_tasks_flow_integration(self):
        """Test that view_tasks_flow integrates properly with TodoManager."""
        todo_manager = TodoManager()

        # Add some tasks to the manager
        task1 = todo_manager.add_task("Task 1", "Description 1")
        task2 = todo_manager.add_task("Task 2", "Description 2")

        # Capture printed output
        captured_output = io.StringIO()
        sys.stdout = captured_output

        try:
            view_tasks_flow(todo_manager)
        finally:
            sys.stdout = sys.__stdout__  # Restore original stdout

        # Verify the output contains the expected tasks
        output = captured_output.getvalue()
        assert "Task 1" in output
        assert "Task 2" in output
        assert "Description 1" in output
        assert "Description 2" in output
        assert "[ ]" in output  # Pending status indicator

    def test_mark_complete_flow_integration(self):
        """Test that mark_complete_flow integrates properly with TodoManager."""
        todo_manager = TodoManager()

        # Add a task to the manager
        task = todo_manager.add_task("Test Task", "Test Description")
        assert task.status == "Pending"  # Initially pending

        # Mock user input for task ID
        inputs = iter([str(task.id)])

        def mock_input(prompt):
            return next(inputs)

        # Capture printed output
        captured_output = io.StringIO()
        sys.stdout = captured_output

        try:
            with patch('builtins.input', mock_input):
                mark_complete_flow(todo_manager)
        finally:
            sys.stdout = sys.__stdout__  # Restore original stdout

        # Verify the task status was updated to completed
        assert task.status == "Completed"

        # Verify success message was printed
        output = captured_output.getvalue()
        assert "marked as complete" in output

    def test_update_task_flow_integration(self):
        """Test that update_task_flow integrates properly with TodoManager."""
        todo_manager = TodoManager()

        # Add a task to the manager
        task = todo_manager.add_task("Original Title", "Original Description")
        assert task.title == "Original Title"
        assert task.description == "Original Description"

        # Mock user input for task ID, new title, and new description
        inputs = iter([str(task.id), "Updated Title", "Updated Description"])

        def mock_input(prompt):
            return next(inputs)

        # Capture printed output
        captured_output = io.StringIO()
        sys.stdout = captured_output

        try:
            with patch('builtins.input', mock_input):
                update_task_flow(todo_manager)
        finally:
            sys.stdout = sys.__stdout__  # Restore original stdout

        # Verify the task was updated
        assert task.title == "Updated Title"
        assert task.description == "Updated Description"

        # Verify success message was printed
        output = captured_output.getvalue()
        assert "updated successfully" in output

    def test_delete_task_flow_integration(self):
        """Test that delete_task_flow integrates properly with TodoManager."""
        todo_manager = TodoManager()

        # Add a task to the manager
        task = todo_manager.add_task("Task to Delete", "Description to Delete")
        assert len(todo_manager.get_all_tasks()) == 1  # Verify task exists

        # Mock user input for task ID and confirmation
        inputs = iter([str(task.id), "y"])

        def mock_input(prompt):
            return next(inputs)

        # Capture printed output
        captured_output = io.StringIO()
        sys.stdout = captured_output

        try:
            with patch('builtins.input', mock_input):
                delete_task_flow(todo_manager)
        finally:
            sys.stdout = sys.__stdout__  # Restore original stdout

        # Verify the task was deleted
        assert len(todo_manager.get_all_tasks()) == 0

        # Verify success message was printed
        output = captured_output.getvalue()
        assert "deleted successfully" in output