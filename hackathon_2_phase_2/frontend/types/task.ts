export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
}
