"use client";

/**
 * ErrorMessage - Error display component with cyberpunk styling
 * Phase 3: Error Handling & Ambiguity Resolution
 */

import React from "react";
import { AlertCircle, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: string;
  type?: "error" | "warning" | "info";
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  error,
  type = "error",
  retryable = false,
  onRetry,
  onDismiss,
  className,
}: ErrorMessageProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) return null;

  const typeStyles = {
    error: {
      border: "border-red-500/50",
      bg: "bg-red-500/10",
      icon: "text-red-400",
      text: "text-red-100",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    },
    warning: {
      border: "border-yellow-500/50",
      bg: "bg-yellow-500/10",
      icon: "text-yellow-400",
      text: "text-yellow-100",
      glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    },
    info: {
      border: "border-cyan-500/50",
      bg: "bg-cyan-500/10",
      icon: "text-cyan-400",
      text: "text-cyan-100",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={cn(
        "relative",
        "flex items-start gap-3",
        "px-4 py-3",
        "rounded-xl",
        "backdrop-blur-sm",
        "border",
        styles.bg,
        styles.border,
        styles.glow,
        "animate-in",
        "slide-in-from-top-2",
        "fade-in-50",
        "duration-300",
        className
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0", styles.icon)}>
        <AlertCircle className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm font-medium", styles.text)}>
          {error}
        </p>

        {retryable && onRetry && (
          <button
            onClick={() => {
              onRetry();
              setIsDismissed(true);
            }}
            className={cn(
              "flex items-center gap-2",
              "text-xs",
              "text-red-300",
              "hover:text-red-100",
              "transition-colors",
              "mt-2"
            )}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={() => {
            setIsDismissed(true);
            onDismiss();
          }}
          className={cn(
            "flex-shrink-0",
            "p-1",
            "rounded-lg",
            "hover:bg-black/20",
            "transition-colors"
          )}
        >
          <X className={cn("w-4 h-4", styles.text, "opacity-70")} />
        </button>
      )}
    </div>
  );
}
