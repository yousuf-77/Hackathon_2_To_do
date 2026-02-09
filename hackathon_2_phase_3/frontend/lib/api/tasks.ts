import { apiClient } from "../api-client";
import { authClient } from "../auth-client";
import type { Task, CreateTaskDto, UpdateTaskDto } from "@/types/task";

interface TaskListResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

async function getUserId(): Promise<string> {
  const session = await authClient.getSession();
  if (!session?.data?.user?.id) {
    throw new Error("User not authenticated");
  }
  return session.data.user.id;
}

export const tasksApi = {
  /**
   * Get all tasks for the current user
   */
  async getTasks(params?: {
    status?: "pending" | "completed" | "all";
    sort_by?: string;
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }): Promise<TaskListResponse> {
    const userId = await getUserId();

    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }
    if (params?.sort_by) {
      queryParams.append("sort_by", params.sort_by);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append("offset", params.offset.toString());
    }

    const query = queryParams.toString();
    return apiClient.get<TaskListResponse>(
      `/api/${userId}/tasks${query ? `?${query}` : ""}`
    );
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const userId = await getUserId();
    return apiClient.get<Task>(`/api/${userId}/tasks/${taskId}`);
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskDto): Promise<Task> {
    const userId = await getUserId();
    return apiClient.post<Task>(`/api/${userId}/tasks`, data);
  },

  /**
   * Update a task
   */
  async updateTask(taskId: string, data: UpdateTaskDto): Promise<Task> {
    const userId = await getUserId();
    return apiClient.put<Task>(`/api/${userId}/tasks/${taskId}`, data);
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskComplete(taskId: string, completed: boolean): Promise<Task> {
    const userId = await getUserId();
    return apiClient.patch<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
      completed,
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const userId = await getUserId();
    return apiClient.delete(`/api/${userId}/tasks/${taskId}`);
  },
};
