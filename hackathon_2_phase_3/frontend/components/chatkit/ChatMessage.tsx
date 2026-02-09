"use client";

/**
 * ChatMessage - Individual message display with cyberpunk styling
 * Phase 3: AI-Powered Todo Chatbot
 */

import React from "react";
import { Bot, User, CheckCircle2, Wrench, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType, ToolCall } from "@/types/chatkit";

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex",
        "gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8",
          "rounded-full",
          "flex items-center justify-center",
          "flex-shrink-0",
          isUser
            ? "bg-gradient-to-br from-purple-500 to-pink-500"
            : "bg-gradient-to-br from-cyan-500 to-blue-500",
          "shadow-lg"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1",
          "flex flex-col",
          "gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "max-w-[280px]",
            "px-4 py-3",
            "rounded-2xl",
            "backdrop-blur-sm",
            "border",
            isUser
              ? [
                  "bg-purple-500/20",
                  "border-purple-500/30",
                  "rounded-tr-sm",
                  "text-purple-100",
                ]
              : [
                  "bg-cyan-500/20",
                  "border-cyan-500/30",
                  "rounded-tl-sm",
                  "text-cyan-100",
                ]
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Tool Calls (for assistant messages) */}
        {isAssistant && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1">
            {message.toolCalls.map((toolCall) => (
              <ToolCallIndicator key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-slate-500">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

/**
 * Tool call indicator component
 */
interface ToolCallIndicatorProps {
  toolCall: ToolCall;
}

function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  const getStatusIcon = () => {
    switch (toolCall.status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case "in_progress":
        return <Wrench className="w-3 h-3 text-yellow-400 animate-spin" />;
      default:
        return <Wrench className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (toolCall.status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "in_progress":
        return "Running...";
      default:
        return "Pending";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "px-3 py-2",
        "rounded-lg",
        "bg-slate-800/50",
        "border border-slate-700/50",
        "text-xs"
      )}
    >
      {getStatusIcon()}
      <span className="text-slate-400">
        {toolCall.name}
      </span>
      <span className="text-slate-500">
        • {getStatusText()}
      </span>
    </div>
  );
}
