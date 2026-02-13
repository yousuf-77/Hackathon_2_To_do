import { TaskCard } from "./task-card";
import type { Task } from "@/types/task";
import type { ReactNode } from "react";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string | ReactNode;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  emptyMessage = "No tasks found",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        {typeof emptyMessage === "string" ? (
          <p className="text-muted-foreground">{emptyMessage}</p>
        ) : (
          emptyMessage
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:hidden">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
