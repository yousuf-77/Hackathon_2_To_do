# Data Model: Basic Todo Functionality

## Task Entity

### Fields
- **id**: int (auto-increment, unique identifier)
- **title**: str (required, task title)
- **description**: str (optional, task description)
- **status**: str (required, either "Pending" or "Completed")

### Validation Rules
- id: Must be a positive integer, auto-generated
- title: Must be a non-empty string
- description: Can be empty string or populated
- status: Must be either "Pending" or "Completed" (case-sensitive)

### State Transitions
- From "Pending" to "Completed" when marked complete
- No reverse transition (completed tasks remain completed)

## Todo List Collection

### Structure
- A Python list containing Task entities
- Maintains insertion order
- In-memory only, cleared when application exits

### Operations
- Add new Task to the list
- Retrieve Task by ID
- Update Task properties by ID
- Delete Task by ID
- List all Tasks