"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/task/task-list";
import { TaskTable } from "@/components/task/task-table";
import { AddTaskDialog } from "@/components/task/add-task-dialog";
import { TaskEditDialog } from "@/components/tasks/TaskEditDialog";
import { ChatWidget } from "@/components/chatkit/ChatWidget";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { tasksApi } from "@/lib/api/tasks";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import type { Task } from "@/types/task";
import type { TaskPriority, TaskStatus, SortBy } from "@/components/tasks/TaskFilters";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Filter,
  Search,
  Zap,
  Target,
  Flame,
} from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority>("all");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      console.log("[Dashboard] Starting tasks fetch...");
      const response = await tasksApi.getTasks();
      console.log("[Dashboard] Tasks API response:", response);
      setTasks(response.tasks || []);
      console.log("[Dashboard] Tasks loaded:", response.tasks?.length || 0);
    } catch (error) {
      console.error("[Dashboard] Failed to fetch tasks:", error);
      toast({
        title: "Failed to load tasks",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      // Set empty array on error
      setTasks([]);
    } finally {
      console.log("[Dashboard] Setting isLoading to false");
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

  // Priority order for sorting
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  // Filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description?.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter === "pending") {
      filtered = filtered.filter((t) => !t.completed);
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((t) => t.completed);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    // Apply tag filter (tasks don't have tags yet, but keeping for future)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((task) => {
        // This will work when tasks have tags field
        const taskTags = (task as any).tags || [];
        return selectedTags.some((tag) => taskTags.includes(tag));
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "created_at") {
        // Newest first
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "due_date") {
        // Tasks don't have due_date yet, default to created_at
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "priority") {
        // High priority first
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, selectedTags]);

  // Get available tags (for future use)
  const availableTags: string[] = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      const taskTags = (task as any).tags || [];
      taskTags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [tasks]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  if (isLoading) {
    return null; // Loading skeleton will be shown by loading.tsx
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30"
              >
                <LayoutDashboard className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  className="text-4xl font-bold gradient-text"
                  animate={{ backgroundPosition: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  Tasks
                </motion.h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neon-pink" />
                  Manage your tasks efficiently
                </p>
              </div>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AddTaskDialog onTaskAdded={handleTaskAdded} />
          </motion.div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Total Tasks */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative glass-card p-6 space-y-3 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total Tasks</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-2 bg-cyan-500/10 rounded-full"
              >
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </motion.div>
            </div>
            <motion.p
              className="text-4xl font-bold text-cyan-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 200, damping: 10 }}
            >
              {stats.total}
            </motion.p>
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Active Tasks */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative glass-card p-6 space-y-3 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Flame className="w-5 h-5 text-neon-blue" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Active</p>
              </div>
              <Badge
                variant="outline"
                className="bg-neon-blue/20 text-neon-blue border-neon-blue/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
              >
                Active
              </Badge>
            </div>
            <motion.p
              className="text-4xl font-bold text-neon-blue"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 200, damping: 10, delay: 0.1 }}
            >
              {stats.active}
            </motion.p>
            <div className="h-1 bg-gradient-to-r from-neon-blue to-transparent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neon-blue"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.active / stats.total) * 100 || 0}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative glass-card p-6 space-y-3 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-neon-green" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Completed</p>
              </div>
              <Badge
                variant="outline"
                className="bg-neon-green/20 text-neon-green border-neon-green/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]"
              >
                Done
              </Badge>
            </div>
            <motion.p
              className="text-4xl font-bold text-neon-green"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 200, damping: 10, delay: 0.2 }}
            >
              {stats.completed}
            </motion.p>
            <div className="h-1 bg-gradient-to-r from-neon-green to-transparent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neon-green"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Search and Sort Filters */}
      <motion.div variants={itemVariants}>
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
        />
      </motion.div>

      {/* Task list/table */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-semibold">Your Tasks</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50"
          >
            <Search className="w-4 h-4" />
            Showing {filteredAndSortedTasks.length} of {stats.total} tasks
          </motion.div>
        </div>
        <TaskList
          tasks={filteredAndSortedTasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-6 bg-slate-800/50 rounded-full border border-slate-700/50"
              >
                <Circle className="w-16 h-16 text-slate-600" />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "No tasks match your filters"
                    : "No tasks yet"}
                </p>
                <p className="text-sm text-slate-500">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first task to get started!"}
                </p>
              </div>
            </div>
          }
        />
        <TaskTable
          tasks={filteredAndSortedTasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>

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
    </motion.div>
  );
}
