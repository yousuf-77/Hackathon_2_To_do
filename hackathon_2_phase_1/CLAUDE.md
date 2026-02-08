# Todo Application Development Guidelines

## Build/Run Commands

To run the application:
```bash
uv run src/main.py
```

## Style Guidelines

- **Type System**: Strictly typed Python 3.13
  - All functions must have type hints
  - Use appropriate type annotations from the `typing` module
  - Follow modern Python 3.13 typing syntax
  - Maintain strong typing throughout the codebase

- **Code Standards**:
  - Follow PEP 8 style guidelines
  - Use descriptive variable and function names
  - Keep functions focused and single-purpose
  - Maintain clear separation of concerns between modules
  - Write clear, concise comments where necessary

- **Architecture**:
  - Maintain modular design with clear separation between models, services, and CLI components
  - Keep business logic separate from user interface
  - Follow in-memory storage pattern as required by the constitution
  - Preserve CLI-only interface as specified

- **Error Handling**:
  - Implement comprehensive error handling
  - Provide clear user feedback for all operations
  - Validate all user inputs appropriately
  - Handle edge cases gracefully