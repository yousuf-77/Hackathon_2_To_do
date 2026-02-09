"use client";

/**
 * ChatInput - Message input with send button and cyberpunk styling
 * Phase 3: AI-Powered Todo Chatbot
 * Extended with voice input support
 */

import React, { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { VoiceInputButton } from "./VoiceInputButton";

interface ChatInputProps {
  onSendMessage: (message: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  /**
   * Enable voice input
   * @default false
   */
  enableVoice?: boolean;
  /**
   * Voice input language
   * @default "en-US"
   */
  voiceLanguage?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  className,
  maxLength = 2000,
  enableVoice = false,
  voiceLanguage = "en-US",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    setMessage("");
    await onSendMessage(trimmed);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setMessage(transcript);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        "relative",
        className
      )}
    >
      {/* Text Input */}
      <div
        className={cn(
          "flex-1",
          "relative",
          "group",
          "transition-all duration-300"
        )}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className={cn(
            "w-full",
            "px-4 py-3",
            "rounded-xl",
            "bg-slate-800/50",
            "border border-slate-700/50",
            "text-slate-100",
            "placeholder:text-slate-500",
            "resize-none",
            "focus:outline-none",
            "focus:border-cyan-500/50",
            "focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]",
            "disabled:opacity-50",
            "disabled:cursor-not-allowed",
            "transition-all duration-300",
            "scrollbar-thin",
            "scrollbar-thumb-slate-700",
            "scrollbar-track-slate-900"
          )}
          style={{
            minHeight: "48px",
            maxHeight: "120px",
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />

        {/* Character Count */}
        {message.length > maxLength * 0.8 && (
          <div
            className={cn(
              "absolute bottom-2 right-2",
              "text-xs",
              message.length >= maxLength
                ? "text-red-400"
                : "text-slate-500"
            )}
          >
            {message.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Voice Input Button (if enabled) */}
      {enableVoice && (
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          language={voiceLanguage}
          disabled={disabled}
          showIndicator={true}
        />
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={cn(
          "w-12 h-12",
          "rounded-xl",
          "bg-gradient-to-br from-cyan-500 to-purple-500",
          "flex items-center justify-center",
          "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
          "hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]",
          "hover:scale-105",
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          "disabled:hover:scale-100",
          "disabled:hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]",
          "transition-all duration-300",
          "flex-shrink-0"
        )}
      >
        <Send
          className={cn(
            "w-5 h-5",
            "text-white",
            disabled ? "text-slate-400" : ""
          )}
        />
      </button>
    </div>
  );
}
