"""
CSV Export utility for task API
"""

from typing import List
from app.models.task import Task


def tasks_to_csv(tasks: List[Task]) -> str:
    """
    Convert list of tasks to CSV format

    Args:
        tasks: List of task objects

    Returns:
        CSV string with header row
    """
    # CSV header
    headers = [
        "ID",
        "Title",
        "Description",
        "Priority",
        "Status",
        "Tags",
        "Due Date",
        "Created At",
        "Updated At",
    ]

    # Convert tasks to CSV rows
    rows = []
    for task in tasks:
        # Escape CSV values
        def escape(value: str) -> str:
            if value is None:
                return ""
            # If value contains comma, quote, or newline, wrap in quotes
            if "," in value or '"' in value or "\n" in value:
                return f'"{value.replace(chr(34), chr(34) + chr(34))}"'
            return value

        rows.append([
            escape(str(task.id)),
            escape(task.title),
            escape(task.description or ""),
            escape(task.priority),
            "Completed" if task.completed else "Pending",
            escape(";".join(task.tags or [])),
            escape(task.due_date.isoformat() if task.due_date else ""),
            escape(task.created_at.isoformat() if task.created_at else ""),
            escape(task.updated_at.isoformat() if task.updated_at else ""),
        ])

    # Combine header and rows
    csv_content = ",".join(headers) + "\n" + "\n".join(rows)

    return csv_content
