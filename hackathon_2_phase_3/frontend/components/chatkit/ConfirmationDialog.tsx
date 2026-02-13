"use client";

/**
 * ConfirmationDialog - Modal for confirming destructive operations
 * Phase 1: Core Fixes (T016, T020)
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
import { cn } from "@/lib/utils/cn";

interface ConfirmationDialogProps {
  /**
   * Whether dialog is open
   */
  open: boolean;
  /**
   * Callback when user confirms
   */
  onConfirm: () => void | Promise<void>;
  /**
   * Callback when user cancels
   */
  onCancel: () => void;
  /**
   * Title of the confirmation
   */
  title: string;
  /**
   * Description message
   */
  message: string;
  /**
   * Confirm button text
   * @default "Confirm"
   */
  confirmText?: string;
  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;
  /**
   * Type of confirmation (determines styling)
   * @default "warning"
   */
  variant?: "warning" | "danger";
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function ConfirmationDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  className,
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset confirming state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsConfirming(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  // Variant styling
  const variantStyles = {
    warning: {
      title: "text-yellow-500",
      icon: "⚠️",
      gradient: "from-yellow-500 to-orange-500",
      glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
    },
    danger: {
      title: "text-red-500",
      icon: "🗑️",
      gradient: "from-red-500 to-pink-500",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.5)]",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={cn("sm:max-w-[450px] glass-card", className)}>
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", styles.title)}>
            <span className="text-2xl">{styles.icon}</span>
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
            className="border-cyan-500/30 text-slate-300 hover:bg-slate-800"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className={cn(
              "bg-gradient-to-r",
              styles.gradient,
              "hover:brightness-110",
              "text-white font-semibold"
            )}
          >
            {isConfirming ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
