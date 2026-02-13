"use client";

/**
 * TaskEditDialog - Edit existing tasks with full field support
 * Phase 1: Core Fixes (T009-T013)
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";

interface TaskEditDialogProps {
  /**
   * Task to edit (null = dialog closed)
   */
  task: Task | null;
  /**
   * Callback when task is saved
   */
  onSave: (task: Task) => Promise<void>;
  /**
   * Callback when dialog is cancelled
   */
  onCancel: () => void;
}

export function TaskEditDialog({
  task,
  onSave,
  onCancel,
}: TaskEditDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority as "low" | "medium" | "high");
      setCompleted(task.completed);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task) return;

    // Validate title
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        completed,
      });

      toast({
        title: "Task updated successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setCompleted(false);
    } catch (error) {
      toast({
        title: "Failed to update task",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCompleted(false);
    onCancel();
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={task !== null} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[500px] glass-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update your task details below. All fields are optional except title.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="bg-slate-900/50 border-cyan-500/30"
                maxLength={200}
                disabled={isSaving}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                className="bg-slate-900/50 border-cyan-500/30 min-h-[100px]"
                maxLength={1000}
                disabled={isSaving}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-slate-900/50 border-cyan-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">☕ Low</SelectItem>
                  <SelectItem value="medium">⚡ Medium</SelectItem>
                  <SelectItem value="high">🔥 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Completed */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-completed"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                disabled={isSaving}
                className="w-4 h-4 rounded border-cyan-500/30 bg-slate-900/50"
              />
              <Label htmlFor="edit-completed" className="cursor-pointer">
                Mark as completed
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-cyan-500/30 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
