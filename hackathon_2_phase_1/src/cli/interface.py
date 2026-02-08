"""
CLI interface module for the todo application.

This module handles user interaction through the command line interface.
"""

from typing import Optional
try:
    from src.services.todo_manager import TodoManager
except ImportError:
    from services.todo_manager import TodoManager


def display_menu() -> None:
    """Display the main menu options to the user."""
    print("\n--- Todo Application ---")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Complete")
    print("6. Exit")
    print("------------------------")


def get_user_choice() -> str:
    """
    Get the user's menu choice.

    Returns:
        str: The user's menu choice
    """
    return input("Enter your choice (1-6): ").strip()


def get_valid_task_id(todo_manager: TodoManager) -> Optional[int]:
    """
    Get a valid task ID from the user.

    Args:
        todo_manager (TodoManager): The TodoManager instance to validate the ID against

    Returns:
        int: The valid task ID, or None if user cancels or enters invalid input
    """
    try:
        task_id_str = input("Enter task ID: ").strip()
        if task_id_str.lower() in ['q', 'quit', 'cancel']:
            return None
        task_id = int(task_id_str)
        if not todo_manager.task_exists(task_id):
            print(f"Error: Task with ID {task_id} does not exist.")
            return None
        return task_id
    except ValueError:
        print("Error: Please enter a valid number for task ID.")
        return None


def safe_int_input(prompt: str) -> Optional[int]:
    """
    Safely get an integer input from the user.

    Args:
        prompt (str): The prompt to display to the user

    Returns:
        int: The integer value, or None if invalid input
    """
    try:
        value_str = input(prompt).strip()
        if value_str.lower() in ['q', 'quit', 'cancel']:
            return None
        return int(value_str)
    except ValueError:
        print("Error: Please enter a valid number.")
        return None


def get_task_input(is_update: bool = False) -> tuple[Optional[str], Optional[str]]:
    """
    Get task title and description from user input.

    Args:
        is_update (bool): Whether this is for an update operation (allows empty inputs)

    Returns:
        tuple: A tuple containing title and description strings
    """
    title = input("Enter task title: ").strip()
    if not is_update and not title:
        print("Error: Title cannot be empty.")
        return None, None

    description = input("Enter task description: ").strip()

    return title, description


def add_task_flow(todo_manager: TodoManager) -> None:
    """
    Handle the flow for adding a new task.

    Args:
        todo_manager (TodoManager): The TodoManager instance to add the task to
    """
    print("\n--- Add New Task ---")
    title, description = get_task_input()

    if title is not None:
        try:
            new_task = todo_manager.add_task(title, description)
            print(f"Task added successfully! ID: {new_task.id}")
        except ValueError as e:
            print(f"Error adding task: {e}")


def view_tasks_flow(todo_manager: TodoManager) -> None:
    """
    Handle the flow for viewing all tasks.

    Args:
        todo_manager (TodoManager): The TodoManager instance to get tasks from
    """
    print("\n--- All Tasks ---")
    tasks = todo_manager.get_all_tasks()

    if not tasks:
        print("No tasks found.")
    else:
        for task in tasks:
            print(task)


def update_task_flow(todo_manager: TodoManager) -> None:
    """
    Handle the flow for updating a task.

    Args:
        todo_manager (TodoManager): The TodoManager instance to update the task in
    """
    print("\n--- Update Task ---")
    task_id = get_valid_task_id(todo_manager)
    if task_id is None:
        return

    print("Leave title or description empty to keep current value.")
    title_input, description_input = get_task_input(is_update=True)

    # Use None to indicate no change for optional parameters
    title = title_input if title_input else None
    description = description_input if description_input else None

    if title is not None or description is not None:
        try:
            if todo_manager.update_task(task_id, title=title, description=description):
                print(f"Task {task_id} updated successfully!")
            else:
                print(f"Failed to update task {task_id}.")
        except ValueError as e:
            print(f"Error updating task: {e}")
    else:
        print("No changes provided.")


def delete_task_flow(todo_manager: TodoManager) -> None:
    """
    Handle the flow for deleting a task.

    Args:
        todo_manager (TodoManager): The TodoManager instance to delete the task from
    """
    print("\n--- Delete Task ---")
    task_id = get_valid_task_id(todo_manager)
    if task_id is None:
        return

    confirm = input(f"Are you sure you want to delete task {task_id}? (y/N): ").strip().lower()
    if confirm in ['y', 'yes']:
        if todo_manager.delete_task(task_id):
            print(f"Task {task_id} deleted successfully!")
        else:
            print(f"Failed to delete task {task_id}.")
    else:
        print("Deletion cancelled.")


def mark_complete_flow(todo_manager: TodoManager) -> None:
    """
    Handle the flow for marking a task as complete.

    Args:
        todo_manager (TodoManager): The TodoManager instance to mark the task as complete
    """
    print("\n--- Mark Task Complete ---")
    task_id = get_valid_task_id(todo_manager)
    if task_id is None:
        return

    if todo_manager.mark_complete(task_id):
        print(f"Task {task_id} marked as complete!")
    else:
        print(f"Failed to mark task {task_id} as complete.")