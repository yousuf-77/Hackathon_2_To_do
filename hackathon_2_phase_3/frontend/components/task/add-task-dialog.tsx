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
import { Plus, Sparkles } from "lucide-react";
import { TaskForm } from "./task-form";
import { tasksApi } from "@/lib/api/tasks";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
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
        description: "Your task has been added to the list.",
      });

      setOpen(false);
      onTaskAdded?.(); // Refresh the task list
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button className="neon-glow group">
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            Add Task
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add New Task
          </DialogTitle>
          <DialogDescription>
            Create a new task to track your work. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
