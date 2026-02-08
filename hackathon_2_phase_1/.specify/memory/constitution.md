# Phase I: Todo In-Memory Console App Constitution

## Core Principles

### I. In-Memory Architecture
Architecture MUST strictly use in-memory storage (Python lists/dicts). No external databases (SQL/NoSQL) are permitted. All data persistence is ephemeral and tied to application lifecycle.

### II. CLI Interface
Interface MUST be pure Command Line Interface using a main loop. No GUI or web interfaces allowed. All user interactions occur through terminal input/output.

### III. Python 3.13+ with uv Package Management
Tech stack MUST use Python 3.13+ managed by 'uv'. All dependencies and virtual environments are managed through uv. No other package managers allowed.

### IV. Strong Typing and Code Standards
Code MUST use strong typing (using `typing` module), follow PEP 8 compliance, and implement modular design (separate logic from UI). Type hints required for all functions and variables.

### V. Modular Design
Architecture MUST separate business logic from UI components. Core functionality resides in separate modules from presentation layer. Clear separation of concerns between data models, business logic, and user interface.

### VI. Project Structure
Source code MUST be organized in `src/` directory with entry point at `main.py`. All application modules are contained within the src directory. Entry point is the only executable at root level.

## Additional Constraints

Technology stack: Python 3.13+, uv package manager, standard library only (no external dependencies beyond what's needed for basic CLI functionality).

Performance standards: Application must handle typical todo operations (add, list, complete, delete) with minimal latency. Memory usage should be proportional to number of todos stored.

Testing requirements: Unit tests for all business logic modules. Integration tests for CLI interface functionality.

## Development Workflow

Development follows iterative approach with frequent testing. Each feature must be implemented with corresponding tests. Code reviews focus on adherence to architectural constraints and code quality standards.

Quality gates include: passing all unit and integration tests, type checking with mypy, PEP 8 compliance verification, and architectural constraint validation.

## Governance

All implementations must comply with the in-memory architecture constraint. Any deviation from the tech stack or structural requirements requires explicit constitutional amendment. All pull requests must verify compliance with these principles.

Code changes must maintain the separation between business logic and UI. New features must not violate the CLI-only interface requirement. Performance considerations must align with the in-memory design.

**Version**: 1.0.0 | **Ratified**: 2026-02-03 | **Last Amended**: 2026-02-03
