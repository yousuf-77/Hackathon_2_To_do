# API Contracts: Basic Todo Functionality

## CLI Commands Interface

### Add Task
- **Command**: Option 1 in main menu
- **Input**: title (string), description (string)
- **Process**: Creates new task with auto-incremented ID, status "Pending"
- **Output**: Confirmation message with assigned ID

### View Tasks
- **Command**: Option 2 in main menu
- **Input**: None
- **Process**: Retrieves all tasks from in-memory storage
- **Output**: Formatted list of all tasks with ID, status indicator, title, description

### Update Task
- **Command**: Option 3 in main menu
- **Input**: task ID (int), new title (string), new description (string)
- **Process**: Updates existing task by ID
- **Output**: Confirmation message or error if ID not found

### Delete Task
- **Command**: Option 4 in main menu
- **Input**: task ID (int)
- **Process**: Removes task from in-memory storage by ID
- **Output**: Confirmation message or error if ID not found

### Mark Complete
- **Command**: Option 5 in main menu
- **Input**: task ID (int)
- **Process**: Updates task status to "Completed" by ID
- **Output**: Confirmation message or error if ID not found

### Exit
- **Command**: Option 6 in main menu
- **Input**: None
- **Process**: Terminates the application loop
- **Output**: Goodbye message