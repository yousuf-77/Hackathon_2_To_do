#!/usr/bin/env python3
"""
Main entry point for the Todo Application.

This module implements the main application loop with a menu-driven interface
that runs continuously until the user chooses to exit.
"""

import sys
import os
# Add the src directory to the path so imports work correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from src.services.todo_manager import TodoManager
    from src.cli.interface import (
        display_menu,
        get_user_choice,
        add_task_flow,
        view_tasks_flow,
        update_task_flow,
        delete_task_flow,
        mark_complete_flow
    )
except ImportError:
    # Fallback for when running from project root
    from services.todo_manager import TodoManager
    from cli.interface import (
        display_menu,
        get_user_choice,
        add_task_flow,
        view_tasks_flow,
        update_task_flow,
        delete_task_flow,
        mark_complete_flow
    )


def main():
    """
    Main application loop.

    This function implements the main loop with a menu-driven interface
    that runs continuously until the user chooses to exit.
    """
    print("Welcome to the Todo Application!")

    # Initialize the TodoManager
    todo_manager = TodoManager()

    while True:
        try:
            # Display the menu
            display_menu()

            # Get user choice
            choice = get_user_choice()

            # Process user choice
            if choice == "1":
                add_task_flow(todo_manager)
            elif choice == "2":
                view_tasks_flow(todo_manager)
            elif choice == "3":
                update_task_flow(todo_manager)
            elif choice == "4":
                delete_task_flow(todo_manager)
            elif choice == "5":
                mark_complete_flow(todo_manager)
            elif choice == "6":
                print("Thank you for using the Todo Application. Goodbye!")
                break
            else:
                print("Invalid choice. Please enter a number between 1 and 6.")

            # Pause to let user see results before showing menu again
            input("\nPress Enter to continue...")
        except KeyboardInterrupt:
            print("\n\nApplication interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            print("Please try again or contact support if the issue persists.")
            input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()