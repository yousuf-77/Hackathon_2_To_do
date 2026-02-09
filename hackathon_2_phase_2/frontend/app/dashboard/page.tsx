"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task/task-list";
import { TaskTable } from "@/components/task/task-table";
import { AddTaskDialog } from "@/components/task/add-task-dialog";
import { tasksApi } from "@/lib/api/tasks";
import { useToast } from "@/components/ui/use-toast";
import type { Task } from "@/types/task";

export default function DashboardPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await tasksApi.getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      toast({
        title: "Failed to load tasks",
        variant: "destructive",
      });
      // Set empty array on error
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      await tasksApi.toggleTaskComplete(id, !task.completed);

      setTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );

      toast({
        title: `Task marked as ${task.completed ? "incomplete" : "complete"}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));

      toast({
        title: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (task: Task) => {
    // TODO: Implement edit dialog
    toast({
      title: "Edit feature coming soon",
    });
  };

  const handleTaskAdded = () => {
    // Refresh the task list after adding a new task
    fetchTasks();
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
  };

  if (isLoading) {
    return null; // Loading skeleton will be shown by loading.tsx
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently</p>
        </div>
        <AddTaskDialog onTaskAdded={handleTaskAdded} />
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="text-3xl font-bold gradient-text">{stats.total}</p>
        </div>
        <div className="glass-card p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Active</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-neon-blue">{stats.active}</p>
            <Badge variant="outline" className="bg-neon-blue/20 text-neon-blue border-neon-blue/50">
              Active
            </Badge>
          </div>
        </div>
        <div className="glass-card p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-neon-green">{stats.completed}</p>
            <Badge variant="outline" className="bg-neon-green/20 text-neon-green border-neon-green/50">
              Done
            </Badge>
          </div>
        </div>
      </div>

      {/* Task list/table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        <TaskList
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No tasks yet. Create your first task!"
        />
        <TaskTable
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
