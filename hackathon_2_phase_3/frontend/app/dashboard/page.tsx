"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task/task-list";
import { TaskTable } from "@/components/task/task-table";
import { AddTaskDialog } from "@/components/task/add-task-dialog";
import { TaskEditDialog } from "@/components/tasks/TaskEditDialog";
import { ChatWidget } from "@/components/chatkit/ChatWidget";
import { tasksApi } from "@/lib/api/tasks";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import type { Task } from "@/types/task";

export default function DashboardPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchAuthToken();
  }, []);

  // Real-time polling: refresh tasks every 2 seconds
  useEffect(() => {
    // Only start polling after initial load and if we have auth
    if (!isLoading && authToken) {
      const intervalId = setInterval(() => {
        // Silently refresh tasks in background (no loading state)
        silentFetchTasks();
      }, 2000); // 2-second polling for near real-time updates

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [isLoading, authToken]);

  const fetchAuthToken = async () => {
    try {
      // Get JWT token from /api/auth/token endpoint
      const response = await fetch('/api/auth/token');
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
          console.log("=== Auth token fetched successfully ===");
        }
      }
    } catch (error) {
      console.error("=== Failed to fetch auth token ===", error);
    }
  };

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

  // Silent fetch for polling (doesn't set loading state)
  const silentFetchTasks = async () => {
    try {
      const response = await tasksApi.getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      // Silently fail for polling errors to avoid annoying user
      console.debug("Silent fetch error:", error);
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
    setEditingTask(task);
  };

  const handleEditSave = async (updatedTask: Task) => {
    try {
      // Call API to update task
      await tasksApi.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        completed: updatedTask.completed,
      });

      // Optimistically update local state (functional form to avoid closure issues)
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));

      // Close dialog
      setEditingTask(null);

      toast({
        title: "Task updated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      // Re-fetch to ensure consistency
      fetchTasks();
    }
  };

  const handleEditCancel = () => {
    setEditingTask(null);
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

      {/* Phase 3: AI Chatbot Widget */}
      <ChatWidget
        key="chatbot-widget"
        apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/agent/chat`}
        authToken={authToken || undefined}
        initialOpen={true}
      />

      {/* Edit Task Dialog */}
      <TaskEditDialog
        task={editingTask}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
      />
    </div>
  );
}
