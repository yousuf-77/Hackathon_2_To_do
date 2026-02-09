---
name: chatkit-ui-setup
description: |
  This skill guides Claude Code to spec and implement OpenAI ChatKit in Next.js for conversational chatbot UI integration. Embeds chat widget in dashboard, handles message history, streaming responses, tool invocations, and cyberpunk styling with neon glows and glassmorphism. References OpenAI ChatKit docs and official GitHub examples. This skill activates automatically when users mention ChatKit, conversational UI, chat widget embed, frontend chatbot integration, Phase 3 requirements, Todo chatbot, or OpenAI chat integration.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch, mcp__web_reader__webReader
related_skills:
  - shadcn-ui-cyberpunk-theme-generator
  - chatbot-integrator
  - nextjs-api-client-with-jwt
  - voice-command-specialist
  - urdu-language-support
---

# ChatKit UI Setup Skill

## Overview

This skill provides comprehensive guidance for integrating OpenAI ChatKit into Next.js applications with a focus on cyberpunk-themed UI, message history management, streaming responses, and Phase 3 Todo chatbot implementation.

## When to Use This Skill

- Embedding OpenAI ChatKit widgets in Next.js dashboards
- Implementing conversational UI for Todo management with chatbot
- Creating cyberpunk-styled chat interfaces with neon glows and glassmorphism
- Setting up message history and persistence for chat sessions
- Handling streaming responses and tool invocations in ChatKit
- Integrating voice input capabilities (Phase 3 bonus feature)
- Adding multilingual support (e.g., Urdu) to chatbot UI
- Phase 3 Todo chatbot implementation with agent tools

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing Next.js app structure (app/pages router), current dashboard layout, existing Shadcn components, Tailwind configuration |
| **Conversation** | User's chatbot requirements, preferred chat placement, styling preferences, message persistence needs |
| **Skill References** | OpenAI ChatKit documentation, GitHub examples, cyberpunk UI patterns, ChatKit theming guides |
| **User Guidelines** | Project-specific design requirements, accessibility needs, authentication requirements |

Ensure all required context is gathered before implementing.

## Quick Start: ChatKit Installation

### 1. Install Required Packages

```bash
# Install ChatKit React bindings
npm install @openai/chatkit-react

# The ChatKit web component script will be loaded from CDN
```

### 2. Add ChatKit Script to App

Add the ChatKit loader script to your Next.js app layout or head:

```tsx
// frontend/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load ChatKit web component */}
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Create ChatKit Session Endpoint

Create an API route to generate client secrets:

```tsx
// frontend/app/api/chatkit/session/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    // Call OpenAI ChatKit sessions API
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow: { id: process.env.OPENAI_WORKFLOW_ID },
        user: deviceId || 'anonymous',
      }),
    });

    const data = await response.json();

    return NextResponse.json({ client_secret: data.client_secret });
  } catch (error) {
    console.error('ChatKit session error:', error);
    return NextResponse.json(
      { error: 'Failed to create ChatKit session' },
      { status: 500 }
    );
  }
}
```

## Dashboard Chat Widget Integration

### Cyberpunk-Styled Chat Component

```tsx
// frontend/components/chat/chat-widget.tsx
"use client";

import { useState, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;

        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: 'user-123' }),
          });
          const { client_secret } = await res.json();
          return client_secret;
        } catch (error) {
          console.error('Failed to get ChatKit client secret:', error);
          throw error;
        }
      },
    },
  });

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full",
          "cyber-glow-blue bg-cyber-bg-darker border border-cyber-neon-blue/50",
          "hover:scale-110 transition-all duration-300",
          className
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6 text-cyber-neon-blue" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "glass-effect border border-cyber-neon-blue/30",
        "rounded-lg shadow-2xl overflow-hidden",
        "transition-all duration-300",
        isMinimized ? "h-14 w-80" : "h-[600px] w-[400px]",
        "max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6rem)]"
      )}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyber-text-muted/30 bg-cyber-bg-darker/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyber-neon-green animate-pulse" />
          <h3 className="font-semibold text-cyber-text-primary">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 hover:bg-cyber-neon-blue/20"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-cyber-text-secondary" />
            ) : (
              <Minimize2 className="h-4 w-4 text-cyber-text-secondary" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 hover:bg-cyber-priority-high/20"
          >
            <X className="h-4 w-4 text-cyber-text-secondary" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="h-[calc(100%-56px)]">
          <ChatKit
            control={control}
            className="h-full w-full"
            style={{
              '--chatkit-primary-color': 'rgb(var(--cyber-neon-blue))',
              '--chatkit-background': 'rgb(var(--cyber-bg-darker))',
              '--chatkit-text-color': 'rgb(var(--cyber-text-primary))',
            } as React.CSSProperties}
          />
        </div>
      )}
    </div>
  );
}
```

### Embed Chat in Dashboard

```tsx
// frontend/app/dashboard/page.tsx (updated)
"use client";

import { ChatWidget } from "@/components/chat/chat-widget";
// ... existing imports

export default function DashboardPage() {
  // ... existing code

  return (
    <div className="space-y-6">
      {/* Existing dashboard content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* ... */}
      </div>

      {/* ... rest of dashboard */}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
```

## Custom Theming with Cyberpunk Styling

### Tailwind Configuration for ChatKit

```typescript
// frontend/tailwind.config.ts (add to existing config)
export default {
  // ... existing config
  theme: {
    extend: {
      colors: {
        // Existing cyberpunk colors
        cyber: {
          neon: {
            blue: "hsl(var(--cyber-neon-blue))",
            pink: "hsl(var(--cyber-neon-pink))",
            purple: "hsl(var(--cyber-neon-purple))",
            green: "hsl(var(--cyber-neon-green))",
          },
          // ... rest of existing colors
        },
      },
      animation: {
        "neon-pulse": "neon-pulse 2s ease-in-out infinite alternate",
        "message-appear": "message-appear 0.3s ease-out",
      },
      keyframes: {
        "neon-pulse": {
          "0%, 100%": {
            textShadow: "0 0 5px currentColor, 0 0 10px currentColor",
          },
          "50%": {
            textShadow: "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
        },
        "message-appear": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
};
```

### Custom ChatKit Theme Variables

```css
/* frontend/app/globals.css (add to existing) */

/* ChatKit-specific cyberpunk overrides */
.openai-chatkit-container {
  --chatkit-primary-color: rgb(var(--cyber-neon-blue));
  --chatkit-background: rgba(var(--cyber-bg-darker), 0.95);
  --chatkit-text-color: rgb(var(--cyber-text-primary));
  --chatkit-border-color: rgba(var(--cyber-neon-blue), 0.3);
  --chatkit-input-bg: rgba(var(--cyber-bg-dark), 0.8);
  --chatkit-user-message-bg: rgba(var(--cyber-neon-blue), 0.15);
  --chatkit-assistant-message-bg: rgba(var(--cyber-neon-purple), 0.1);
  --chatkit-glow: 0 0 15px rgba(var(--cyber-neon-blue), 0.5);
}

/* Custom scrollbar for chat messages */
.openai-chatkit-container::-webkit-scrollbar {
  width: 6px;
}

.openai-chatkit-container::-webkit-scrollbar-track {
  background: rgba(var(--cyber-bg-dark), 0.5);
}

.openai-chatkit-container::-webkit-scrollbar-thumb {
  background: rgba(var(--cyber-neon-blue), 0.5);
  border-radius: 3px;
}

.openai-chatkit-container::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--cyber-neon-blue), 0.8);
  box-shadow: 0 0 10px rgba(var(--cyber-neon-blue), 0.5);
}

/* Message styling with glassmorphism */
.openai-chatkit-message {
  animation: message-appear 0.3s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--cyber-text-muted), 0.2);
}

.openai-chatkit-message.user {
  background: linear-gradient(
    135deg,
    rgba(var(--cyber-neon-blue), 0.15) 0%,
    rgba(var(--cyber-neon-blue), 0.05) 100%
  );
  box-shadow: 0 0 15px rgba(var(--cyber-neon-blue), 0.2);
}

.openai-chatkit-message.assistant {
  background: linear-gradient(
    135deg,
    rgba(var(--cyber-neon-purple), 0.1) 0%,
    rgba(var(--cyber-neon-purple), 0.05) 100%
  );
  box-shadow: 0 0 15px rgba(var(--cyber-neon-purple), 0.2);
}

/* Tool call indicator styling */
.openai-chatkit-tool-call {
  border: 1px solid rgba(var(--cyber-neon-green), 0.4);
  background: rgba(var(--cyber-neon-green), 0.05);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 4px 0;
}

.openai-chatkit-tool-call::before {
  content: "⚡";
  margin-right: 8px;
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Input field styling */
.openai-chatkit-input {
  background: rgba(var(--cyber-bg-dark), 0.8) !important;
  border: 1px solid rgba(var(--cyber-neon-blue), 0.3) !important;
  color: rgb(var(--cyber-text-primary)) !important;
  transition: all 0.2s ease;
}

.openai-chatkit-input:focus {
  border-color: rgba(var(--cyber-neon-blue), 0.8) !important;
  box-shadow: 0 0 15px rgba(var(--cyber-neon-blue), 0.4) !important;
  outline: none;
}

/* Send button with neon effect */
.openai-chatkit-send-button {
  background: linear-gradient(
    135deg,
    rgba(var(--cyber-neon-blue), 0.8) 0%,
    rgba(var(--cyber-neon-purple), 0.8) 100%
  ) !important;
  border: none !important;
  transition: all 0.3s ease;
}

.openai-chatkit-send-button:hover {
  box-shadow: 0 0 20px rgba(var(--cyber-neon-blue), 0.6) !important;
  transform: scale(1.05);
}

/* Typing indicator */
.openai-chatkit-typing-indicator span {
  background: rgb(var(--cyber-neon-purple)) !important;
  animation: neon-pulse 1.5s ease-in-out infinite;
}

.openai-chatkit-typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.openai-chatkit-typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}
```

## Message History Management

### Client-Side Message Persistence

```typescript
// frontend/lib/chat/chat-history.ts
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

const CHAT_HISTORY_KEY = 'chatkit_history';

export class ChatHistoryManager {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  saveMessage(message: ChatMessage): void {
    const history = this.getHistory();
    history.push(message);
    this.storage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  }

  getHistory(): ChatMessage[] {
    const stored = this.storage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  clearHistory(): void {
    this.storage.removeItem(CHAT_HISTORY_KEY);
  }

  deleteMessage(messageId: string): void {
    const history = this.getHistory();
    const filtered = history.filter((m) => m.id !== messageId);
    this.storage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filtered));
  }

  getLastNMessages(n: number): ChatMessage[] {
    const history = this.getHistory();
    return history.slice(-n);
  }
}

export const chatHistory = new ChatHistoryManager();
```

### React Hook for Message History

```typescript
// frontend/hooks/use-chat-history.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { chatHistory, type ChatMessage } from '@/lib/chat/chat-history';

export function useChatHistory(maxMessages = 100) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages(chatHistory.getHistory());
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      if (updated.length > maxMessages) {
        updated.shift(); // Remove oldest message
      }
      return updated;
    });
    chatHistory.saveMessage(message);
  }, [maxMessages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    chatHistory.clearHistory();
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    chatHistory.deleteMessage(messageId);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    deleteMessage,
  };
}
```

## Streaming Response Handling

### Custom Streaming Chat Component

```tsx
// frontend/components/chat/streaming-chat.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { Loader2 } from 'lucide-react';

interface StreamingChatProps {
  onStreamingStart?: () => void;
  onStreamingChunk?: (chunk: string) => void;
  onStreamingEnd?: (fullResponse: string) => void;
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
}

export function StreamingChat({
  onStreamingStart,
  onStreamingChunk,
  onStreamingEnd,
  onToolCall,
}: StreamingChatProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const fullResponseRef = useRef('');

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;

        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: 'user-123' }),
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    onResponseStart: () => {
      setIsStreaming(true);
      setStreamedContent('');
      fullResponseRef.current = '';
      onStreamingStart?.();
    },
    onResponseChunk: (chunk: string) => {
      fullResponseRef.current += chunk;
      setStreamedContent(fullResponseRef.current);
      onStreamingChunk?.(chunk);
    },
    onResponseEnd: () => {
      setIsStreaming(false);
      onStreamingEnd?.(fullResponseRef.current);
    },
    onToolCall: (toolName: string, args: Record<string, unknown>) => {
      onToolCall?.(toolName, args);
    },
  });

  return (
    <div className="relative">
      {isStreaming && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect border border-cyber-neon-blue/50">
          <Loader2 className="h-3 w-3 animate-spin text-cyber-neon-blue" />
          <span className="text-xs text-cyber-text-secondary">AI typing...</span>
        </div>
      )}

      <ChatKit
        control={control}
        className="h-full w-full"
        style={{
          '--chatkit-primary-color': 'rgb(var(--cyber-neon-blue))',
          '--chatkit-background': 'rgb(var(--cyber-bg-darker))',
        } as React.CSSProperties}
      />

      {streamedContent && (
        <div className="mt-4 p-4 rounded-lg glass-effect border border-cyber-neon-purple/30">
          <p className="text-sm text-cyber-text-secondary mb-2">Preview:</p>
          <p className="text-cyber-text-primary whitespace-pre-wrap">{streamedContent}</p>
        </div>
      )}
    </div>
  );
}
```

## Tool Invocation Display

### Tool Call Visualizer Component

```tsx
// frontend/components/chat/tool-call-display.tsx
"use client";

import { Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  status?: 'pending' | 'running' | 'complete' | 'error';
  result?: unknown;
}

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
}

export function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  if (toolCalls.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-cyber-text-secondary uppercase tracking-wider">
        Tool Calls
      </p>
      {toolCalls.map((tool, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg",
            "glass-effect border border-cyber-neon-green/30",
            "transition-all duration-200"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {tool.status === 'complete' ? (
              <CheckCircle2 className="h-4 w-4 text-cyber-neon-green" />
            ) : tool.status === 'error' ? (
              <Zap className="h-4 w-4 text-cyber-priority-high" />
            ) : (
              <Loader2 className="h-4 w-4 text-cyber-neon-blue animate-spin" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-cyber-text-primary">
                {tool.name}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  tool.status === 'complete' && "border-cyber-neon-green/50 text-cyber-neon-green",
                  tool.status === 'running' && "border-cyber-neon-blue/50 text-cyber-neon-blue",
                  tool.status === 'error' && "border-cyber-priority-high/50 text-cyber-priority-high"
                )}
              >
                {tool.status || 'pending'}
              </Badge>
            </div>

            {Object.keys(tool.arguments).length > 0 && (
              <pre className="text-xs text-cyber-text-muted overflow-x-auto">
                {JSON.stringify(tool.arguments, null, 2)}
              </pre>
            )}

            {tool.result && (
              <div className="mt-2 p-2 rounded bg-cyber-bg-dark/50">
                <p className="text-xs text-cyber-text-secondary mb-1">Result:</p>
                <pre className="text-xs text-cyber-neon-green overflow-x-auto">
                  {JSON.stringify(tool.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Voice Input Integration (Bonus Feature)

### Web Speech API Hook

```typescript
// frontend/hooks/use-speech-recognition.ts
"use client";

import { useState, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  lang = 'en-US',
  continuous = false,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          let isFinal = false;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            currentTranscript += result[0].transcript;
            if (result.isFinal) isFinal = true;
          }

          setTranscript(currentTranscript);
          onResult?.(currentTranscript, isFinal);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          onError?.(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [lang, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    recognitionRef.current?.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognitionRef.current,
  };
}
```

### Voice-Enabled Chat Input

```tsx
// frontend/components/chat/voice-chat-input.tsx
"use client";

import { useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useChatHistory } from '@/hooks/use-chat-history';

interface VoiceChatInputProps {
  onSendMessage: (message: string) => void;
}

export function VoiceChatInput({ onSendMessage }: VoiceChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { addMessage } = useChatHistory();

  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } =
    useSpeechRecognition({
      onResult: (transcript, isFinal) => {
        setInputValue(transcript);
        if (isFinal) {
          addMessage({
            id: Date.now().toString(),
            role: 'user',
            content: transcript,
            timestamp: Date.now(),
          });
          onSendMessage(transcript);
          resetTranscript();
        }
      },
    });

  const handleSend = () => {
    if (inputValue.trim()) {
      addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
        timestamp: Date.now(),
      });
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={isListening ? "Listening..." : "Type or speak your message..."}
        className={cn(
          "flex-1 px-4 py-2 rounded-lg",
          "bg-cyber-bg-darker border border-cyber-text-muted/30",
          "text-cyber-text-primary placeholder:text-cyber-text-muted",
          "focus:outline-none focus:border-cyber-neon-blue/50 focus:shadow-[0_0_15px_rgba(var(--cyber-neon-blue)_/_0.3)]",
          "transition-all duration-200"
        )}
      />

      {isSupported && (
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "transition-all duration-200",
            isListening && "animate-pulse shadow-[0_0_20px_rgba(var(--cyber-priority-high)_/_0.5)]"
          )}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4 text-cyber-neon-blue" />
          )}
        </Button>
      )}

      <Button
        onClick={handleSend}
        disabled={!inputValue.trim()}
        className={cn(
          "cyber-glow-blue",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

## Error Handling and Retry Logic

### Error Boundary for Chat Widget

```tsx
// frontend/components/chat/chat-error-boundary.tsx
"use client";

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat widget error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg glass-effect border border-cyber-priority-high/30">
          <AlertCircle className="h-12 w-12 text-cyber-priority-high mb-4" />
          <h3 className="text-lg font-semibold text-cyber-text-primary mb-2">
            Chat Unavailable
          </h3>
          <p className="text-sm text-cyber-text-secondary mb-4 text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={this.handleRetry}
            variant="outline"
            className="cyber-glow"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Tests for Chat Components

```typescript
// frontend/components/chat/__tests__/chat-widget.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWidget } from '../chat-widget';

describe('ChatWidget', () => {
  it('should render chat button when closed', () => {
    render(<ChatWidget />);
    const button = screen.getByLabelText('Open chat');
    expect(button).toBeInTheDocument();
  });

  it('should open chat widget when button is clicked', async () => {
    render(<ChatWidget />);

    const openButton = screen.getByLabelText('Open chat');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });
  });

  it('should minimize chat widget', async () => {
    render(<ChatWidget />);

    const openButton = screen.getByLabelText('Open chat');
    fireEvent.click(openButton);

    await waitFor(() => {
      const minimizeButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')
      );
      if (minimizeButton) {
        fireEvent.click(minimizeButton);
      }
    });
  });

  it('should close chat widget', async () => {
    render(<ChatWidget />);

    const openButton = screen.getByLabelText('Open chat');
    fireEvent.click(openButton);

    await waitFor(() => {
      const closeButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')
      );
      if (closeButton) {
        fireEvent.click(closeButton);
      }
    });

    await waitFor(() => {
      expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
    });
  });
});
```

### E2E Test Scenarios

```typescript
// frontend/e2e/chatbot.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ChatKit Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display chat widget button', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();
  });

  test('should open chat and display AI assistant', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await chatButton.click();

    await expect(page.locator('text=AI Assistant')).toBeVisible();
  });

  test('should send and receive messages', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await chatButton.click();

    const input = page.locator('input[placeholder*="Type or speak"]');
    await input.fill('Create a new task: Buy groceries');
    await input.press('Enter');

    // Wait for AI response
    await expect(page.locator('.openai-chatkit-message.assistant')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display tool calls when agent uses tools', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await chatButton.click();

    const input = page.locator('input[placeholder*="Type or speak"]');
    await input.fill('List all my tasks');
    await input.press('Enter');

    // Wait for tool call indicator
    await expect(page.locator('.openai-chatkit-tool-call')).toBeVisible({
      timeout: 10000,
    });
  });
});
```

## Environment Configuration

```bash
# frontend/.env.local
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_WORKFLOW_ID=wf_your_workflow_id_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Quality Assurance Checklist

- [ ] ChatKit React package installed and script loaded from CDN
- [ ] ChatKit session API endpoint created and secured
- [ ] Chat widget embedded in dashboard with cyberpunk styling
- [ ] Message history persistence implemented (localStorage/DB)
- [ ] Streaming responses handled correctly with visual feedback
- [ ] Tool invocations displayed with status indicators
- [ ] Voice input hook integrated (if bonus feature enabled)
- [ ] Error boundary wraps chat component
- [ ] Cyberpunk theme applied (neon glows, glassmorphism, dark mode)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility standards met (ARIA labels, keyboard navigation)
- [ ] Unit tests written for chat components
- [ ] E2E tests cover critical chat scenarios
- [ ] Environment variables configured
- [ ] Loading states displayed during session creation
- [ ] Session refresh logic implemented

## References and Further Reading

- [OpenAI ChatKit Documentation](https://platform.openai.com/docs/guides/chatkit)
- [OpenAI ChatKit Starter App](https://github.com/openai/openai-chatkit-starter-app)
- [ChatKit JS GitHub Repository](https://github.com/openai/chatkit-js)
- [ChatKit.js Documentation](https://openai.github.io/chatkit-js/)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Shadcn UI Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS Customization](https://tailwindcss.com/docs/customization)
- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
