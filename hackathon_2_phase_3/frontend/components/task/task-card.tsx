"use client";

import { useState } from "react";
import { Check, Edit2, Trash2, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const priorityColors = {
    low: "bg-neon-blue/20 text-neon-blue border-neon-blue/50",
    medium: "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50",
    high: "bg-neon-pink/20 text-neon-pink border-neon-pink/50",
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowDeleteDialog(false);
  };

  const createdDate = new Date(task.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2, scale: 1.01 }}
      >
        <Card
          className={cn(
            "group hover:shadow-lg hover:shadow-primary/20 transition-all duration-200",
            task.completed && "opacity-60"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleComplete(task.id)}
                  className="mt-1"
                />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title and badge */}
                <div className="flex items-start justify-between gap-2">
                  <motion.h3
                    className={cn(
                      "font-semibold text-base",
                      task.completed && "line-through text-muted-foreground"
                    )}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {task.title}
                  </motion.h3>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0", priorityColors[task.priority])}
                  >
                    {task.priority.toUpperCase()}
                  </Badge>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created {createdDate}</span>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Actions */}
          <CardFooter className="px-4 pb-4 pt-0 flex justify-end gap-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
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
