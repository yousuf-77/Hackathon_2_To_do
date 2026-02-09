"use client";

import { useState } from "react";
import { Check, Edit2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskTable({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const priorityColors = {
    low: "bg-neon-blue/20 text-neon-blue border-neon-blue/50",
    medium: "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50",
    high: "bg-neon-pink/20 text-neon-pink border-neon-pink/50",
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete.id);
      setShowDeleteDialog(false);
      setTaskToDelete(null);
    }
  };

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className={cn(task.completed && "opacity-60")}
              >
                <TableCell>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggleComplete(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "font-medium",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={priorityColors[task.priority]}
                  >
                    {task.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(task.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(task)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
