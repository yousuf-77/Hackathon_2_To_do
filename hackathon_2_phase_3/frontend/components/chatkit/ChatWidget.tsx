"use client";

/**
 * ChatWidget - Main floating chatbot widget with cyberpunk styling
 * Phase 3: AI-Powered Todo Chatbot
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage as ChatMessageType } from "@/types/chatkit";

interface ChatWidgetProps {
  /**
   * Auth token for API requests
   */
  authToken?: string;
  /**
   * API endpoint for chat
   * @default "/api/agent/chat"
   */
  apiEndpoint?: string;
  /**
   * Whether widget is initially open
   * @default false
   */
  initialOpen?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Load conversation history on mount
   * @default false
   */
  loadHistory?: boolean;
  /**
   * Show language toggle (for Urdu support)
   * @default false
   */
  showLanguageToggle?: boolean;
}

export function ChatWidget({
  authToken,
  apiEndpoint = "/api/agent/chat",
  initialOpen = false,
  className,
  loadHistory = false,
  showLanguageToggle = false,
}: ChatWidgetProps) {
  // Persist open/closed state in localStorage to survive dashboard re-renders
  // Always prefer localStorage over initialOpen prop
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('chat-widget-open');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('[ChatWidget] Error reading localStorage:', e);
    }
    return initialOpen;
  });
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [isRTL, setIsRTL] = useState(false);

  // Persist isOpen state to localStorage so it survives dashboard re-renders
  useEffect(() => {
    localStorage.setItem('chat-widget-open', JSON.stringify(isOpen));
  }, [isOpen]);

  const {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
  } = useChat({
    apiEndpoint,
    authToken,
    loadHistory,
  });

  const handleLanguageToggle = () => {
    const newLang = language === "en" ? "ur" : "en";
    setLanguage(newLang);
    setIsRTL(newLang === "ur");
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  // Render floating toggle when closed, full widget when open
  if (!isOpen) {
    return ReactDOM.createPortal(
      <FloatingToggle
        onClick={() => setIsOpen(true)}
        unreadCount={0}
      />, document.body);
  }

  // Render in portal to document.body to avoid fixed positioning issues
  return ReactDOM.createPortal(
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex flex-col",
        "w-[400px] h-[80vh]",
        "rounded-2xl",
        "bg-slate-950/95",
        "backdrop-blur-xl",
        "border border-cyan-500/50",
        "shadow-[0_0_40px_rgba(6,182,212,0.3)]",
        "transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <ChatHeader
        onClose={() => setIsOpen(false)}
        onClearHistory={clearMessages}
        title="AI Task Assistant"
        subtitle="Manage tasks with natural language"
        showLanguageToggle={showLanguageToggle}
      />

      {/* Messages */}
      <div
        className={cn(
          "flex-1",
          "overflow-y-auto",
          isRTL && "rtl",  // Add RTL support
          "text-right",  // Default right-align for RTL
          "p-4",
          "space-y-4",
          "scrollbar-thin",
          "scrollbar-thumb-cyan-500/30",
          "scrollbar-track-slate-900/50"
        )}
      >
        {messages.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              "h-full",
              "text-center",
              "space-y-4"
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
              <MessageCircle className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="space-y-2">
              <p
                className={cn(
                  "text-lg font-semibold",
                  "text-transparent bg-clip-text",
                  "bg-gradient-to-r from-cyan-400 to-purple-400"
                )}
              >
                Welcome to AI Assistant
              </p>
              <p className="text-sm text-slate-400 max-w-[280px]">
                I can help you manage tasks using natural language. Try saying:
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
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {isStreaming && <TypingIndicator />}
      </div>

      {/* Input */}
      <div
        className={cn(
          "p-4",
          "border-t border-cyan-500/30",
          "bg-slate-900/50"
        )}
      >
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          placeholder="Ask me anything about your tasks..."
        />
      </div>
    </div>, document.body);
}

/**
 * Floating toggle button (closed state)
 */
interface FloatingToggleProps {
  onClick: () => void;
  unreadCount?: number;
  className?: string;
}

function FloatingToggle({
  onClick,
  unreadCount = 0,
  className,
}: FloatingToggleProps) {
  return ReactDOM.createPortal(
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-16 h-16",
        "rounded-full",
        "bg-gradient-to-br from-cyan-500 to-purple-500",
        "flex items-center justify-center",
        "shadow-[0_0_40px_rgba(6,182,212,0.5)]",
        "hover:shadow-[0_0_60px_rgba(6,182,212,0.7)]",
        "hover:scale-110",
        "transition-all duration-300",
        "group",
        className
      )}
    >
      <div
        className={cn(
          "relative",
          "flex items-center justify-center"
        )}
      >
        <MessageCircle
          className={cn(
            "w-8 h-8",
            "text-white",
            "transition-transform duration-300",
            "group-hover:scale-110"
          )}
        />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1",
              "w-5 h-5",
              "rounded-full",
              "bg-red-500",
              "text-white",
              "text-xs",
              "flex items-center justify-center",
              "font-bold",
              "shadow-[0_0_10px_rgba(239,68,68,0.8)]",
              "animate-pulse"
            )}
          >
            {unreadCount}
          </span>
        )}
      </div>
    </button>, document.body);
}
