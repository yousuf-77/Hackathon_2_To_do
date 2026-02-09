"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskForm } from "./task-form";
import { tasksApi } from "@/lib/api/tasks";
import { useToast } from "@/components/ui/use-toast";
import type { CreateTaskDto, UpdateTaskDto } from "@/types/task";

interface AddTaskDialogProps {
  onTaskAdded?: () => void;
}

export function AddTaskDialog({ onTaskAdded }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: CreateTaskDto | UpdateTaskDto) => {
    try {
      setIsLoading(true);
      // This is AddTaskDialog, so data should always be CreateTaskDto
      await tasksApi.createTask(data as CreateTaskDto);

      toast({
        title: "Task created successfully",
      });

      setOpen(false);
      onTaskAdded?.(); // Refresh the task list
    } catch (error) {
      toast({
        title: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="neon-glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task to track your work.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
