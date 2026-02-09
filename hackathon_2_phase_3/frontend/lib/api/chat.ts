/**
 * Chat API Client for Phase 3 Todo Chatbot
 * Handles SSE streaming and chat operations
 */

import type {
  ChatMessage,
  StreamChunk,
  ChatApiConfig,
} from "@/types/chatkit";

export class ChatApiClient {
  private config: ChatApiConfig;

  constructor(config: ChatApiConfig) {
    this.config = config;
  }

  /**
   * Send a chat message and stream the response
   *
   * @param message - User message content
   * @param onChunk - Callback for each stream chunk
   * @param signal - AbortSignal for cancellation
   * @returns Promise that resolves when streaming is complete
   */
  async sendMessage(
    message: string,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(this.config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.authToken && {
          Authorization: `Bearer ${this.config.authToken}`,
        }),
        ...this.config.headers,
      },
      body: JSON.stringify({ message }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
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
            onChunk(chunk);

            // Stop if done
            if (chunk.type === "done") {
              return;
            }
          } catch (e) {
            console.error("Error parsing SSE chunk:", e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Clear conversation history
   *
   * @returns Promise with success status
   */
  async clearHistory(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${this.config.apiEndpoint}/clear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.authToken && {
            Authorization: `Bearer ${this.config.authToken}`,
          }),
          ...this.config.headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check for chat service
   *
   * @returns Promise with health status
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
  }> {
    const response = await fetch(`${this.config.apiEndpoint}/health`, {
      headers: {
        ...(this.config.authToken && {
          Authorization: `Bearer ${this.config.authToken}`,
        }),
        ...this.config.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update configuration
   *
   * @param config - New configuration
   */
  updateConfig(config: Partial<ChatApiConfig>) {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Create a chat API client instance
 *
 * @param config - Chat API configuration
 * @returns ChatApiClient instance
 */
export function createChatClient(config: ChatApiConfig): ChatApiClient {
  return new ChatApiClient(config);
}

/**
 * Default chat client instance (can be configured after initialization)
 */
let defaultChatClient: ChatApiClient | null = null;

/**
 * Get or create the default chat client
 *
 * @param config - Optional configuration (only used on first call)
 * @returns Default chat client instance
 */
export function getChatClient(config?: ChatApiConfig): ChatApiClient {
  if (!defaultChatClient) {
    if (!config) {
      throw new Error(
        "Chat client not initialized. Provide config on first call."
      );
    }
    defaultChatClient = new ChatApiClient(config);
  }
  return defaultChatClient;
}
