"use client";

/**
 * useChat - Custom hook for chat functionality with SSE streaming
 * Phase 3: AI-Powered Todo Chatbot
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ChatMessage,
  UseChatReturn,
  ChatApiConfig,
  StreamChunk,
} from "@/types/chatkit";

interface UseChatOptions extends ChatApiConfig {
  /**
   * Maximum number of messages to keep in history
   * @default 50
   */
  maxHistory?: number;
  /**
   * Conversation/session ID for multi-turn conversations
   * @default "default"
   */
  conversationId?: string;
  /**
   * Load conversation history from backend on mount
   * @default false
   */
  loadHistory?: boolean;
}

export function useChat(options: UseChatOptions = {} as UseChatOptions) {
  const {
    apiEndpoint = "/api/agent/chat",
    authToken,
    maxHistory = 50,
    conversationId = "default",
    loadHistory = false,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversation history from backend on mount
  useEffect(() => {
    if (loadHistory && authToken) {
      loadConversationHistory();
    }
  }, [loadHistory, authToken, currentConversationId]);

  /**
   * Load conversation history from backend
   */
  const loadConversationHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/agent/messages?conversation_id=${currentConversationId}`,
        {
          headers: {
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const historyMessages: ChatMessage[] = data.messages || [];

        setMessages(historyMessages);
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    }
  }, [authToken, currentConversationId]);

  /**
   * Send a message to the chat API and stream the response
   */

  /**
   * Send a message to the chat API and stream the response
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim() || isStreaming) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Create placeholder assistant message for streaming
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Prepare request
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
            ...(options.headers || {}),
          },
          body: JSON.stringify({
            message: content,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let buffer = "";
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            try {
              const jsonStr = line.slice(6); // Remove "data: " prefix
              const chunk: StreamChunk = JSON.parse(jsonStr);

              // Handle different chunk types
              if (chunk.type === "content" && chunk.content) {
                accumulatedContent += chunk.content;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (chunk.type === "tool_call" && chunk.toolCall) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          toolCalls: [
                            ...(msg.toolCalls || []),
                            chunk.toolCall!,
                          ],
                        }
                      : msg
                  )
                );
              } else if (chunk.type === "error") {
                // Handle error chunk
                accumulatedContent += `\n❌ Error: ${chunk.error}`;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (chunk.type === "done") {
                // Stream complete
                setIsStreaming(false);

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing SSE chunk:", e);
            }
          }
        }

        // Trim history if needed
        setMessages((prev) => {
          if (prev.length > maxHistory) {
            return prev.slice(-maxHistory);
          }
          return prev;
        });

      } catch (error) {
        // Handle error
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `❌ Failed to send message: ${errorMessage}`,
                  isStreaming: false,
                }
              : msg
          )
        );

        setIsStreaming(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [apiEndpoint, authToken, isStreaming, maxHistory, options.headers]
  );

  /**
   * Clear all messages (local and backend)
   */
  const clearMessages = useCallback(async () => {
    // Clear local state
    setMessages([]);

    // Also clear on backend if authenticated
    if (authToken) {
      try {
        await fetch("/api/agent/chat/clear", {
          method: "POST",
          headers: {
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
          },
        });
      } catch (error) {
        console.error("Failed to clear backend history:", error);
      }
    }
  }, [authToken]);

  /**
   * Retry sending a message
   */
  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const message = messages.find((m) => m.id === messageId);
      if (!message || message.role !== "user") return;

      // Remove the user message and any subsequent messages
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      const newMessages = messages.slice(0, messageIndex);
      setMessages(newMessages);

      // Resend the message
      await sendMessage(message.content);
    },
    [messages, sendMessage]
  );

  /**
   * Stop streaming current response
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
    retryMessage,
    stopStreaming,
    loadConversationHistory,
    conversationId: currentConversationId,
  } satisfies UseChatReturn;
}
