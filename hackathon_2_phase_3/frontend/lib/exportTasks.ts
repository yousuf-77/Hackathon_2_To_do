/**
 * Task export utilities for CSV and JSON formats
 * Phase 3: AI-Powered Todo Chatbot Enhancements
 */

import type { Task } from "@/types/task";

/**
 * Export format
 */
export type ExportFormat = "csv" | "json";

/**
 * Export options
 */
interface ExportOptions {
  /**
   * Include completed tasks
   * @default true
   */
  includeCompleted?: boolean;
  /**
   * Sort by field
   * @default "created_at"
   */
  sortBy?: "created_at" | "priority" | "title";
  /**
   * Sort order
   * @default "desc"
   */
  sortOrder?: "asc" | "desc";
}

/**
 * Convert tasks to CSV format
 *
 * @param tasks - Array of tasks to export
 * @returns CSV string
 *
 * @example
 * ```tsx
 * const tasks = [
 *   { id: '1', title: 'Buy groceries', completed: false, priority: 'high' }
 * ];
 * const csv = tasksToCSV(tasks);
 * downloadFile(csv, 'tasks.csv', 'text/csv');
 * ```
 */
export function tasksToCSV(tasks: Task[]): string {
  // CSV header
  const headers = [
    "ID",
    "Title",
    "Description",
    "Priority",
    "Status",
    "Created At",
    "Updated At",
  ];

  // Convert tasks to CSV rows
  const rows = tasks.map((task) => {
    return [
      task.id,
      escapeCSV(task.title),
      escapeCSV(task.description || ""),
      task.priority,
      task.completed ? "Completed" : "Pending",
      task.created_at ? new Date(task.created_at).toISOString() : "",
      task.updated_at ? new Date(task.updated_at).toISOString() : "",
    ].map(escapeCSV).join(",");
  });

  // Combine header and rows
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Escape CSV value
 */
function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert tasks to JSON format
 *
 * @param tasks - Array of tasks to export
 * @returns JSON string
 *
 * @example
 * ```tsx
 * const tasks = [
 *   { id: '1', title: 'Buy groceries', completed: false, priority: 'high' }
 * ];
 * const json = tasksToJSON(tasks);
 * downloadFile(json, 'tasks.json', 'application/json');
 * ```
 */
export function tasksToJSON(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2);
}

/**
 * Export tasks to file
 *
 * @param tasks - Array of tasks to export
 * @param format - Export format (csv or json)
 * @param filename - Filename (without extension)
 * @param options - Export options
 *
 * @example
 * ```tsx
 * function ExportButton({ tasks }) {
 *   const handleExport = () => {
 *     exportTasks(tasks, 'csv', 'my-tasks', {
 *       includeCompleted: true,
 *       sortBy: 'priority',
 *       sortOrder: 'desc'
 *     });
 *   };
 *
 *   return <button onClick={handleExport}>Export CSV</button>;
 * }
 * ```
 */
export function exportTasks(
  tasks: Task[],
  format: ExportFormat,
  filename: string = "tasks",
  options: ExportOptions = {}
): void {
  const {
    includeCompleted = true,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  // Filter tasks
  let filteredTasks = tasks;
  if (!includeCompleted) {
    filteredTasks = tasks.filter((task) => !task.completed);
  }

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "created_at":
        comparison =
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime();
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Convert to format
  let content: string;
  let mimeType: string;

  if (format === "csv") {
    content = tasksToCSV(filteredTasks);
    mimeType = "text/csv";
  } else {
    content = tasksToJSON(filteredTasks);
    mimeType = "application/json";
  }

  // Download file
  downloadFile(content, `${filename}.${format}`, mimeType);
}

/**
 * Trigger browser download
 *
 * @param content - File content
 * @param filename - Filename with extension
 * @param mimeType - MIME type
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  // Create blob
  const blob = new Blob([content], { type: mimeType });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV to tasks (for import functionality)
 *
 * @param csv - CSV string
 * @returns Array of tasks
 *
 * @example
 * ```tsx
 * function ImportButton() {
 *   const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0];
 *     if (!file) return;
 *
 *     const reader = new FileReader();
 *     reader.onload = (e) => {
 *       const csv = e.target?.result as string;
 *       const tasks = parseCSVToTasks(csv);
 *       // Import tasks...
 *     };
 *     reader.readAsText(file);
 *   };
 *
 *   return <input type="file" accept=".csv" onChange={handleImport} />;
 * }
 * ```
 */
export function parseCSVToTasks(csv: string): Partial<Task>[] {
  const lines = csv.trim().split("\n");

  // Skip header row
  const rows = lines.slice(1);

  return rows.map((row) => {
    // Parse CSV row (handle quoted values)
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of value
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Don't forget the last value
    if (current) {
      values.push(current.trim());
    }

    // Map to task object (CSV index matches header: ID, Title, Description, Priority, Status, Created At, Updated At)
    return {
      title: values[1] || "",
      description: values[2] || "",
      priority: (values[3] as Task["priority"]) || "medium",
      completed: values[4] === "Completed",
    };
  });
}

/**
 * Parse JSON to tasks (for import functionality)
 *
 * @param json - JSON string
 * @returns Array of tasks
 *
 * @example
 * ```tsx
 * function ImportButton() {
 *   const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0];
 *     if (!file) return;
 *
 *     const reader = new FileReader();
 *     reader.onload = (e) => {
 *       const json = e.target?.result as string;
 *       const tasks = parseJSONToTasks(json);
 *       // Import tasks...
 *     };
 *     reader.readAsText(file);
 *   };
 *
 *   return <input type="file" accept=".json" onChange={handleImport} />;
 * }
 * ```
 */
export function parseJSONToTasks(json: string): Partial<Task>[] {
  try {
    const tasks = JSON.parse(json);
    return tasks;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return [];
  }
}

export default {
  tasksToCSV,
  tasksToJSON,
  exportTasks,
  parseCSVToTasks,
  parseJSONToTasks,
};
