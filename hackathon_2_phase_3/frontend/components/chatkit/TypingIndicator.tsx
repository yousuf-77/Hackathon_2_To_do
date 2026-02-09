"use client";

/**
 * TypingIndicator - Animated typing indicator with cyberpunk styling
 * Phase 3: AI-Powered Todo Chatbot
 */

import React from "react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "px-4 py-3",
        "rounded-2xl",
        "bg-cyan-500/10",
        "border border-cyan-500/20",
        "w-fit",
        className
      )}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "w-2 h-2",
              "rounded-full",
              "bg-cyan-400",
              "animate-bounce",
              "shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-cyan-400">AI is typing...</span>
    </div>
  );
}
