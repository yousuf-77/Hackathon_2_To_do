# Todo Application

A CLI-based todo application built with Python 3.13 that allows users to manage tasks through a menu-driven interface. The application follows a modular design with in-memory storage and strong typing throughout.

## Features

- Add new tasks with auto-assigned IDs
- View all tasks with status indicators
- Update task details by ID
- Mark tasks as complete
- Delete tasks with confirmation
- Menu-driven interface for easy navigation
- Input validation and error handling

## Setup

### Prerequisites

- Python 3.13+
- uv package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install uv if you don't have it:
   ```bash
   pip install uv
   ```

3. Install project dependencies:
   ```bash
   uv sync
   ```

## How to Run

To start the application, run:

```bash
uv run src/main.py
```

Once running, you'll see a menu with the following options:
1. Add Task - Create a new todo item
2. View Tasks - Display all current tasks
3. Update Task - Modify existing task details
4. Delete Task - Remove a task from the list
5. Mark Complete - Change task status to completed
6. Exit - Quit the application

## Project Structure

```
src/
├── models/
│   └── task.py          # Task data model with typing
├── services/
│   └── todo_manager.py  # Business logic for todo operations
├── cli/
│   └── interface.py     # CLI menu and user interaction logic
└── main.py              # Application entry point with main loop
```

## Architecture

The application follows a modular design with clear separation of concerns:
- **Models**: Handle data representation (Task model)
- **Services**: Manage business logic (TodoManager)
- **CLI**: Handle user interface (Menu and interaction logic)

## Data Persistence

All data is stored in-memory only and will be cleared when the application exits. This is intentional as per the project requirements.

## Contributing

1. Make your changes
2. Run tests to ensure everything works
3. Submit a pull request