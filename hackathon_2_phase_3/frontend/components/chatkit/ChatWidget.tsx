"use client";

/**
 * ChatWidget - Main floating chatbot widget with cyberpunk styling and glowing effects
 * Phase 3: AI-Powered Todo Chatbot
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage as ChatMessageType } from "@/types/chatkit";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className={cn(
          "fixed z-50",
          "flex flex-col",
          "w-[420px] h-[80vh]",
          "rounded-2xl",
          "bg-slate-950/95",
          "backdrop-blur-xl",
          "border border-cyan-500/50",
          // Enhanced glowing effect
          "shadow-[0_0_60px_rgba(6,182,212,0.4)]",
          "hover:shadow-[0_0_80px_rgba(6,182,212,0.5)]",
          "transition-all duration-300",
          className
        )}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          left: 'auto',
          zIndex: 50,
          boxShadow: `
            0 0 20px rgba(6, 182, 212, 0.4),
            0 0 40px rgba(6, 182, 212, 0.2),
            0 0 60px rgba(168, 85, 247, 0.1),
            inset 0 0 20px rgba(6, 182, 212, 0.05)
          `.trim(),
        }}
      >
        {/* Animated glowing border */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 opacity-50"
            animate={{
              background: [
                "conic-gradient(from 0deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                "conic-gradient(from 60deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                "conic-gradient(from 120deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                "conic-gradient(from 180deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                "conic-gradient(from 240deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                "conic-gradient(from 300deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                "conic-gradient(from 360deg, transparent, rgba(6, 182, 212, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              filter: "blur(8px)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "h-full",
                  "text-center",
                  "space-y-6"
                )}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "relative w-20 h-20",
                    "rounded-2xl",
                    "bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30",
                    "flex items-center justify-center",
                    "shadow-[0_0_40px_rgba(6,182,212,0.5)]",
                    "border border-cyan-500/30"
                  )}
                  style={{
                    boxShadow: `
                      0 0 20px rgba(6, 182, 212, 0.5),
                      0 0 40px rgba(168, 85, 247, 0.3),
                      inset 0 0 20px rgba(6, 182, 212, 0.2)
                    `.trim(),
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                  <MessageCircle className="w-10 h-10 text-cyan-400 relative z-10" />
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(6, 182, 212, 0.5)",
                        "0 0 40px rgba(168, 85, 247, 0.5)",
                        "0 0 20px rgba(6, 182, 212, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
                <div className="space-y-3">
                  <motion.p
                    className={cn(
                      "text-2xl font-bold",
                      "text-transparent bg-clip-text",
                      "bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                    )}
                    animate={{ backgroundPosition: ["0%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    Welcome to AI Assistant
                  </motion.p>
                  <p className="text-sm text-slate-400 max-w-[300px] leading-relaxed">
                    I can help you manage tasks using natural language with glowing precision.
                  </p>
                  <div
                    className={cn(
                      "text-left text-sm text-slate-300",
                      "space-y-2",
                      "mt-4",
                      "pl-4",
                      "border-l-2 border-cyan-500/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span>"Add grocery shopping"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      <span>"Show my pending tasks"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                      <span>"Complete task 1"</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isStreaming && <TypingIndicator />}
          </div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "p-4",
              "border-t border-cyan-500/30",
              "bg-slate-900/50",
              "relative"
            )}
          >
            {/* Subtle glow at the top of input area */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isStreaming}
              placeholder="Ask me anything about your tasks..."
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>, document.body);
}

/**
 * Floating toggle button (closed state) with enhanced glowing effect
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
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "fixed z-50",
        "w-16 h-16",
        "rounded-2xl",
        "bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500",
        "flex items-center justify-center",
        "transition-all duration-300",
        "group",
        "relative",
        className
      )}
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        left: 'auto',
        zIndex: 50,
        boxShadow: `
          0 0 20px rgba(6, 182, 212, 0.6),
          0 0 40px rgba(168, 85, 247, 0.4),
          0 0 60px rgba(236, 72, 153, 0.2),
          inset 0 0 10px rgba(255, 255, 255, 0.1)
        `.trim(),
      }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          background: [
            "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)",
            "conic-gradient(from 120deg, transparent, rgba(255,255,255,0.3), transparent)",
            "conic-gradient(from 240deg, transparent, rgba(255,255,255,0.3), transparent)",
            "conic-gradient(from 360deg, transparent, rgba(255,255,255,0.3), transparent)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          filter: "blur(8px)",
          opacity: 0.5,
        }}
      />

      {/* Pulse animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Icon */}
      <div
        className={cn(
          "relative z-10",
          "flex items-center justify-center"
        )}
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <MessageCircle
            className={cn(
              "w-8 h-8",
              "text-white",
              "transition-transform duration-300",
              "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            )}
          />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
            className={cn(
              "absolute -top-1 -right-1",
              "w-6 h-6",
              "rounded-full",
              "bg-gradient-to-br from-red-500 to-pink-500",
              "text-white",
              "text-xs",
              "flex items-center justify-center",
              "font-bold",
              "border-2 border-white",
              "shadow-[0_0_15px_rgba(239,68,68,0.8)]",
              "animate-pulse"
            )}
            style={{
              boxShadow: `
                0 0 10px rgba(239, 68, 68, 0.8),
                inset 0 0 5px rgba(255, 255, 255, 0.3)
              `.trim(),
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </div>

      {/* Corner sparkle effects */}
      {[0, 90, 180, 270].map((rotation, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: "10%",
            left: `${10 + (i % 2) * 80}%`,
            transform: `rotate(${rotation}deg) translateX(${i % 2 === 0 ? 20 : -20}px)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.button>, document.body);
}
