"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import type { Task, UpdateTaskDto } from "@/types/task";

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onUpdate,
}: EditTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: UpdateTaskDto) => {
    if (!task) return;

    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // await apiClient.put(`/api/tasks/${task.id}`, data);

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });

      onOpenChange(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update your task details below.
          </DialogDescription>
        </DialogHeader>
        {task && (
          <TaskForm
            task={task}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
