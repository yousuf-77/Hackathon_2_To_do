"use client";

/**
 * MessageList - Container for displaying chat messages
 * Phase 3: AI-Powered Todo Chatbot
 */

import React from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage as ChatMessageType } from "@/types/chatkit";

interface MessageListProps {
  messages: ChatMessageType[];
  isStreaming?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  isStreaming = false,
  className,
}: MessageListProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        "space-y-4",
        "overflow-y-auto",
        "p-4",
        "scrollbar-thin",
        "scrollbar-thumb-cyan-500/30",
        "scrollbar-track-slate-900/50",
        className
      )}
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}

      {isStreaming && <TypingIndicator />}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "h-full",
        "text-center",
        "space-y-4",
        "py-12"
      )}
    >
      <div
        className={cn(
          "w-16 h-16",
          "rounded-full",
          "bg-gradient-to-br from-cyan-500/20 to-purple-500/20",
          "flex items-center justify-center",
          "shadow-[0_0_30px_rgba(6,182,212,0.3)]"
        )}
      >
        <svg
          className="w-8 h-8 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <p
          className={cn(
            "text-lg font-semibold",
            "text-transparent bg-clip-text",
            "bg-gradient-to-r from-cyan-400 to-purple-400"
          )}
        >
          Start a conversation
        </p>
        <p className="text-sm text-slate-400 max-w-[280px]">
          I can help you manage tasks using natural language. Try:
        </p>
        <ul
          className={cn(
            "text-left text-sm text-slate-300",
            "space-y-1",
            "mt-3",
            "pl-4"
          )}
        >
          <li>• "Add grocery shopping"</li>
          <li>• "Show my pending tasks"</li>
          <li>• "Complete task 1"</li>
        </ul>
      </div>
    </div>
  );
}
