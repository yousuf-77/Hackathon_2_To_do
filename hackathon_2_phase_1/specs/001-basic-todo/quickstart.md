# Quickstart Guide: Basic Todo Functionality

## Prerequisites
- Python 3.13+
- uv package manager

## Setup
1. Navigate to the project directory
2. Install dependencies: `uv sync` (if any dependencies are added later)
3. Run the application: `python src/main.py`

## Running the Application
- Execute `python src/main.py` from the project root
- The CLI menu will appear with numbered options
- Follow the on-screen prompts to interact with the todo list

## Available Operations
1. Add Task - Create a new todo item
2. View Tasks - Display all current tasks
3. Update Task - Modify existing task details
4. Delete Task - Remove a task from the list
5. Mark Complete - Change task status to completed
6. Exit - Quit the application

## Data Persistence
- All data is stored in-memory only
- Data is lost when the application exits