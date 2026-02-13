"use client";

/**
 * useTasks - SWR hook for real-time task synchronization
 * Phase 3: AI-Powered Todo Chatbot Enhancements
 *
 * Features:
 * - 30-second polling for real-time updates
 * - Auto-revalidation on focus/reconnect
 * - Shared cache across components
 * - Manual mutation support
 */

import useSWR, { mutate } from "swr";
import { tasksApi } from "@/lib/api/tasks";
import type { Task } from "@/types/task";

interface UseTasksOptions {
  /**
   * Polling interval in milliseconds
   * @default 2000 (2 seconds for near real-time sync)
   */
  refreshInterval?: number;
  /**
   * Revalidate on window focus
   * @default true
   */
  revalidateOnFocus?: boolean;
  /**
   * Revalidate on network reconnection
   * @default true
   */
  revalidateOnReconnect?: boolean;
}

interface UseTasksReturn {
  /**
   * Array of tasks
   */
  tasks: Task[];
  /**
   * Error object if request failed
   */
  error: Error | undefined;
  /**
   * Loading state
   */
  isLoading: boolean;
  /**
   * Validating state (true when revalidating)
   */
  isValidating: boolean;
  /**
   * Manual mutate function to update cache
   */
  mutate: typeof mutate;
  /**
   * Refetch tasks from server
   */
  refetch: () => void;
}

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<{ tasks: Task[] }> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * SWR hook for task management with real-time updates
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const { tasks, isLoading, error } = useTasks('user123', 'auth-token');
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {tasks.map(task => <li key={task.id}>{task.title}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useTasks(
  userId: string | null,
  authToken?: string,
  options: UseTasksOptions = {}
): UseTasksReturn {
  const {
    refreshInterval = 2000,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  // Use Next.js proxy to avoid browser CORS/connection issues
  // Only construct API URL if userId is available
  const apiUrl = userId ? `/api/${userId}/tasks` : null;

  // SWR fetcher wrapper with auth token
  const authFetcher = async (url: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Use SWR hook with configured options
  const { data, error, isLoading, isValidating, mutate: swrMutate } = useSWR(
    authToken ? apiUrl : null, // Only fetch when auth token is available
    authFetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  const tasks = data?.tasks || [];

  // Manual refetch function
  const refetch = () => {
    swrMutate();
  };

  return {
    tasks,
    error,
    isLoading,
    isValidating,
    mutate: swrMutate,
    refetch,
  };
}

/**
 * Global task cache key for cross-component synchronization
 */
export const TASKS_CACHE_KEY = (userId: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${baseURL}/api/${userId}/tasks`;
};

/**
 * Helper to invalidate task cache globally
 * Call this after any task mutation (create, update, delete)
 */
export function invalidateTasksCache(userId: string): void {
  mutate(TASKS_CACHE_KEY(userId));
  dispatchTaskUpdatedEvent();
}

/**
 * Dispatch task-updated event for cross-component communication
 * This allows the chatbot and task list to stay in sync
 */
export function dispatchTaskUpdatedEvent(detail?: {
  operation?: "add" | "update" | "delete" | "complete";
  taskId?: string;
}): void {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("task-updated", {
      detail: detail || { timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }
}

/**
 * Optimistic update helper
 * Updates cache immediately before server confirmation
 */
export function optimisticUpdateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): void {
  mutate(
    TASKS_CACHE_KEY(userId),
    (data: { tasks: Task[] } | undefined) => {
      if (!data) return data;

      return {
        ...data,
        tasks: data.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      };
    },
    false // Don't revalidate immediately (optimistic)
  );
  dispatchTaskUpdatedEvent({ operation: "update", taskId });
}

/**
 * Optimistic delete helper
 */
export function optimisticDeleteTask(userId: string, taskId: string): void {
  mutate(
    TASKS_CACHE_KEY(userId),
    (data: { tasks: Task[] } | undefined) => {
      if (!data) return data;

      return {
        ...data,
        tasks: data.tasks.filter((task) => task.id !== taskId),
      };
    },
    false // Don't revalidate immediately (optimistic)
  );
  dispatchTaskUpdatedEvent({ operation: "delete", taskId });
}

/**
 * Optimistic add helper
 */
export function optimisticAddTask(userId: string, newTask: Task): void {
  mutate(
    TASKS_CACHE_KEY(userId),
    (data: { tasks: Task[] } | undefined) => {
      const existingTasks = data?.tasks || [];
      return {
        tasks: [newTask, ...existingTasks],
      };
    },
    false // Don't revalidate immediately (optimistic)
  );
  dispatchTaskUpdatedEvent({ operation: "add", taskId: newTask.id });
}
