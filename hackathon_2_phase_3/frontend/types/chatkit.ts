/**
 * TypeScript types for ChatKit components (Phase 3)
 * Defines interfaces for chat messages, tool calls, and widget state
 */

/**
 * Chat message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Tool invocation status
 */
export type ToolStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

/**
 * Tool call interface for MCP tool invocations
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: ToolStatus;
  result?: unknown;
  error?: string;
}

/**
 * Chat widget state
 */
export interface ChatWidgetState {
  isOpen: boolean;
  isStreaming: boolean;
  messages: ChatMessage[];
  currentMessage: string;
  activeToolCalls: ToolCall[];
}

/**
 * UseChat hook return type
 */
export interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryMessage: (messageId: string) => Promise<void>;
  stopStreaming: () => void;
  loadConversationHistory?: () => Promise<void>;
  conversationId?: string;
}

/**
 * Chat API configuration
 */
export interface ChatApiConfig {
  apiEndpoint: string;
  authToken?: string;
  headers?: Record<string, string>;
}

/**
 * Streaming chat response chunk
 */
export interface StreamChunk {
  type: 'content' | 'tool_call' | 'error' | 'done';
  content?: string;
  toolCall?: ToolCall;
  error?: string;
}

/**
 * Voice input state
 */
export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

/**
 * Message history for context
 */
export interface MessageHistory {
  messages: ChatMessage[];
  maxLength: number;
  trim(): void;
  addMessage(message: ChatMessage): void;
}

/**
 * Clarification prompt for ambiguous input
 */
export interface ClarificationPrompt {
  question: string;
  options: string[];
  selectedOption?: string;
}

/**
 * Error types for chatbot
 */
export enum ChatErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  RATE_LIMIT = 'rate_limit',
  AMBIGUITY = 'ambiguity',
  TOOL_EXECUTION = 'tool_execution',
  UNKNOWN = 'unknown',
}

/**
 * Chat error interface
 */
export interface ChatError {
  type: ChatErrorType;
  message: string;
  retryable: boolean;
  clarificationPrompt?: ClarificationPrompt;
}
