# specs/ui/chatbot-widget.md

## AI Chatbot Widget Specification – Phase 3

**Status:** Draft | **Priority:** Critical | **Dependencies:** @specs/ui/components.md, @specs/ui/theme.md, @specs/features/ai-chatbot/spec.md

---

## Overview

Define the AI-powered chatbot widget UI components for Phase 3 of the Hackathon II Todo application. The chatbot enables natural language Todo management through a conversational interface built on OpenAI ChatKit patterns with cyberpunk/neon styling.

**Component Philosophy:**
- Conversational first: Natural language interaction for all Todo CRUD operations
- Cyberpunk aesthetic: Dark mode, neon glows, glassmorphism, animated elements
- Floating widget: Always accessible but non-intrusive
- Streaming responses: Real-time AI output with typing indicators
- Voice-enabled (bonus): Microphone input for voice commands
- Multi-language (bonus): Urdu support with RTL rendering

**Base Technologies:**
- Chat UI: Custom implementation following OpenAI ChatKit patterns
- State Management: React hooks (useState, useReducer, useCallback)
- Streaming: Server-Sent Events (SSE) or WebSocket for real-time responses
- Voice: Web Speech API (SpeechRecognition) - optional bonus
- Styling: Tailwind CSS + custom cyberpunk theme utilities

**Integration Points:**
- Backend: `/api/agent/chat` endpoint with JWT authentication
- Dashboard: Embedded widget or floating toggle
- Sidebar: Dedicated chat section (alternative view)
- Task CRUD: Bridged via MCP tools backend

---

## 1. Component Hierarchy

```
frontend/
├── components/
│   ├── chat/                    # Chatbot widget components
│   │   ├── chat-widget.tsx      # Main floating widget container
│   │   ├── chat-toggle.tsx      # Floating icon/button (bottom-right)
│   │   ├── chat-header.tsx      # Widget header (title, minimize, close)
│   │   ├── chat-messages.tsx    # Message list with scrolling
│   │   ├── chat-message.tsx     # Individual message component
│   │   ├── chat-input-area.tsx  # Input field, send button, voice button
│   │   ├── typing-indicator.tsx # Animated "AI is typing..." indicator
│   │   ├── tool-call-indicator.tsx # Shows when AI is calling MCP tools
│   │   └── chat-sidebar.tsx     # Full sidebar chat view (alternative)
│   ├── voice/                   # Voice input components (bonus)
│   │   ├── voice-input-button.tsx # Microphone button with recording state
│   │   └── voice-waveform.tsx   # Animated audio visualization
│   └── hooks/                   # Custom React hooks
│       ├── use-chat.ts          # Chat state management hook
│       ├── use-speech-recognition.ts # Voice input hook (bonus)
│       └── use-message-history.ts # Message persistence hook
```

---

## 2. Component Specifications

### 2.1 ChatToggle (Floating Button)

**File:** `components/chat/chat-toggle.tsx`

**Type:** Client Component ("use client")

**Purpose:** Floating action button to open/close the chat widget

**Props:**
```typescript
interface ChatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
  position?: 'bottom-right' | 'bottom-left';
}

// Example usage
<ChatToggle
  isOpen={isChatOpen}
  onToggle={() => setIsChatOpen(!isChatOpen)}
  unreadCount={2}
  position="bottom-right"
/>
```

**UI Layout (Desktop):**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                          ┌───────────┐│
│                                          │   [🎤]    ││  ← 64x64px circle button
│                                          │  Neon glow││     bottom-right: 24px
│                                          └───────────┘│
└─────────────────────────────────────────────────────────┘
```

**UI Layout (Mobile):**
```
┌────────────────────┐
│                    │
│                    │
│                    │
│              ┌─────┐│
│              │ [🎤]││  ← 56x56px (smaller on mobile)
│              └─────┘│  bottom-right: 16px
└────────────────────┘
```

**Styling (Cyberpunk):**
```css
/* Base Button */
.chat-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
  box-shadow:
    0 0 20px rgba(0, 212, 255, 0.6),
    0 0 40px rgba(0, 212, 255, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.chat-toggle:hover {
  transform: scale(1.1);
  box-shadow:
    0 0 30px rgba(0, 212, 255, 0.8),
    0 0 60px rgba(0, 212, 255, 0.4);
}

.chat-toggle:active {
  transform: scale(0.95);
}

/* Pulse Animation for Unread Messages */
.chat-toggle.has-unread {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(0, 212, 255, 0.6),
      0 0 40px rgba(0, 212, 255, 0.3);
  }
  50% {
    box-shadow:
      0 0 30px rgba(0, 212, 255, 0.9),
      0 0 60px rgba(0, 212, 255, 0.5);
  }
}

/* Unread Badge */
.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff00ff;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0a0a0a;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.6);
}

/* Responsive */
@media (max-width: 768px) {
  .chat-toggle {
    width: 56px;
    height: 56px;
    bottom: 16px;
    right: 16px;
  }
}
```

**Behavior:**
- Default state: Floating button with microphone/chat icon
- Click → Opens chat widget (slide-up animation)
- When chat is open: Button transforms to "X" or minimize icon
- Unread badge: Shows count of unread AI responses
- Pulse animation: Active when there are unread messages
- Keyboard accessible: Enter/Space to toggle

**Icons:**
- Default: `<Mic />` or `<MessageCircle />` from lucide-react
- Open state: `<X />` or `<Minimize2 />`

**Accessibility:**
- `aria-label`: "Open AI chat assistant" / "Close chat"
- `aria-expanded`: Reflects widget state
- `role="button"`: Proper button semantics
- Tab order: Last interactive element on page

**Acceptance Criteria:**
- [ ] Toggle button floats in bottom-right corner
- [ ] Click opens chat widget with slide-up animation
- [ ] Unread badge shows count when >0
- [ ] Pulse animation active when unread
- [ ] Hover scale effect (1.1x)
- [ ] Keyboard accessible (Enter/Space)
- [ ] Responsive: 64px desktop, 56px mobile
- [ ] Z-index ensures visibility above all content
- [ ] Icon changes when widget is open

---

### 2.2 ChatWidget (Main Container)

**File:** `components/chat/chat-widget.tsx`

**Type:** Client Component ("use client")

**Purpose:** Floating dialog container for chat interface

**Props:**
```typescript
interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  authToken: string;
  initialMessages?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}
```

**UI Layout (Desktop - Floating Widget):**
```
┌─────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────┐ │
│ │ AI Todo Assistant                      [−] [✕]     │ │  ← Header
│ ├───────────────────────────────────────────────────┤ │
│ │                                                   │ │
│ │ AI: Hello! I can help you manage your tasks...   │ │
│ │ ┌─────────────────────────────────────────────┐  │ │
│ │ │ 🔧 Calling: add_task                       │  │ │  ← Tool indicator
│ │ └─────────────────────────────────────────────┘  │ │
│ │                                                   │ │
│ │ User: Add a task to review the PR by Friday      │ │
│ │                                                   │ │
│ │ AI: Task added! "Review the PR" is now in...     │ │  ← Streaming
│ │ ▊▊▊                                             │ │  ← Typing indicator
│ │                                                   │ │
│ ├───────────────────────────────────────────────────┤ │
│ │ [Type a message...]                    [🎤] [↑] │ │  ← Input area
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
              ↑                               ↑
         600px width                    400px min-height
         (max 90vw)                      (max 70vh)
```

**UI Layout (Mobile - Full Screen):**
```
┌────────────────────┐
│ AI Assistant  [✕]  │  ← Header (48px height)
├────────────────────┤
│                    │
│ AI: Hello!         │
│                    │
│ User: Add task...  │  ← Scrollable messages
│                    │     (100vh - 48px - 72px)
│ AI: Added!         │
│                    │
│                    │
├────────────────────┤
│ [Type...]    [🎤] [↑]│  ← Input (72px height)
└────────────────────┘
```

**Styling (Cyberpunk Glassmorphism):**
```css
/* Widget Container */
.chat-widget {
  position: fixed;
  bottom: 96px; /* Above toggle button */
  right: 24px;
  width: 600px;
  max-width: calc(100vw - 48px);
  height: 600px;
  max-height: 70vh;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 0 40px rgba(0, 212, 255, 0.2),
    0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999;
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.chat-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg,
    rgba(0, 212, 255, 0.1) 0%,
    rgba(255, 0, 255, 0.05) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-widget-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 212, 255, 0.3) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 3px;
}

/* Input Area */
.chat-input-area {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive - Mobile Full Screen */
@media (max-width: 768px) {
  .chat-widget {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
    border: none;
  }

  .chat-widget-header {
    padding: 12px 16px;
    min-height: 48px;
  }

  .chat-input-area {
    padding: 12px 16px;
    min-height: 72px;
  }
}
```

**Behavior:**
- Opens/closes with animation
- Maintains message history (localStorage or backend)
- Auto-scrolls to latest message
- Collapses to floating toggle when closed
- Prevents body scroll when open on mobile
- Escape key closes widget

**Acceptance Criteria:**
- [ ] Widget opens with slide-up animation
- [ ] Closes with slide-down/fade animation
- [ ] Glassmorphism effect with backdrop blur
- [ ] Neon border glow on container
- [ ] Full-screen on mobile, floating on desktop
- [ ] Auto-scrolls to new messages
- [ ] Escape key closes widget
- [ ] Click outside closes widget (with backdrop)
- [ ] Maintains scroll position on re-open

---

### 2.3 ChatHeader

**File:** `components/chat/chat-header.tsx`

**Type:** Client Component ("use client")

**Purpose:** Widget header with title and controls

**Props:**
```typescript
interface ChatHeaderProps {
  title?: string;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  status?: 'idle' | 'streaming' | 'error';
}
```

**UI Layout:**
```
┌───────────────────────────────────────────────────┐
│ [🤖] AI Todo Assistant        [−] [✕]             │
│       ↑                        ↑     ↑             │
│    Icon                    Minimize  Close         │
│                            (Optional)              │
└───────────────────────────────────────────────────┘
```

**Styling:**
```css
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg,
    rgba(0, 212, 255, 0.1) 0%,
    rgba(255, 0, 255, 0.05) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

.chat-header-title {
  font-size: 16px;
  font-weight: 600;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Status Indicator */
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
}

.status-indicator.streaming {
  background: #ffcc00;
  animation: pulse 1s ease-in-out infinite;
}

.status-indicator.error {
  background: #ff0055;
  animation: pulse 1s ease-in-out infinite;
}

.chat-header-controls {
  display: flex;
  gap: 8px;
}

.header-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(0, 212, 255, 0.3);
}
```

**Behavior:**
- Shows AI status (idle/streaming/error)
- Minimize collapses widget to floating button
- Close removes widget from DOM
- Dragging support (optional bonus)

**Acceptance Criteria:**
- [ ] Title displays with neon glow
- [ ] Status indicator shows current state
- [ ] Minimize button collapses widget
- [ ] Close button removes widget
- [ ] Hover effects on all buttons
- [ ] Responsive title text truncation

---

### 2.4 ChatMessages (Message List)

**File:** `components/chat/chat-messages.tsx`

**Type:** Client Component ("use client")

**Purpose:** Scrollable message container with auto-scroll

**Props:**
```typescript
interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

// Example usage
<ChatMessages
  messages={chatMessages}
  isStreaming={isAiStreaming}
  messagesEndRef={messagesEndRef}
/>
```

**UI Layout:**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │ AI: Hello! I'm your AI assistant...     │     │  ← AI message
│  │ ┌─────────────────────────────────┐     │     │
│  │ │ 🔧 add_task({                   │     │     │
│  │ │   title: "Review PR"            │     │     │  ← Tool call
│  │ │ })                              │     │     │
│  │ └─────────────────────────────────┘     │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │ User: Add a task for PR review           │     │  ← User message
│  └─────────────────────────────────────────┘     │
│                                                   │
│  ┌─────────────────────────────────────────┐     │
│  │ AI: Task added successfully!            │     │  ← AI response
│  │ ▊▊▊                                    │     │  ← Typing indicator
│  └─────────────────────────────────────────┘     │
│                                                   │
└───────────────────────────────────────────────────┘
         ↑ Auto-scroll to bottom
```

**Styling:**
```css
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

/* Empty State */
.chat-messages-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 40px 20px;
}

.chat-messages-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.chat-messages-empty-text {
  font-size: 16px;
  line-height: 1.6;
}

.chat-messages-empty-suggestions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 300px;
}

.suggestion-chip {
  padding: 8px 16px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 20px;
  color: #00d4ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.suggestion-chip:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
  transform: translateX(4px);
}
```

**Behavior:**
- Auto-scrolls to bottom on new messages
- Maintains scroll position when reading history
- Shows empty state with suggested prompts
- Smooth scroll behavior
- Virtual scrolling for long conversations (optional)

**Acceptance Criteria:**
- [ ] Auto-scrolls to new messages
- [ ] Maintains user scroll position
- [ ] Shows empty state with suggestions
- [ ] Smooth scroll animations
- [ ] Keyboard accessible (Page Up/Down)
- [ ] Touch-friendly on mobile

---

### 2.5 ChatMessage (Individual Message)

**File:** `components/chat/chat-message.tsx`

**Type:** Client Component ("use client")

**Purpose:** Render individual chat message with styling

**Props:**
```typescript
interface ChatMessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}
```

**UI Layout (AI Message):**
```
┌────────────────────────────────────────────────────┐
│ [🤖] AI Assistant                    2:34 PM        │
│ ┌──────────────────────────────────────────────┐  │
│ │ I've added your task: "Review the PR"       │  │
│ │ It's scheduled for Friday with high         │  │
│ │ priority.                                     │  │
│ │                                              │  │
│ │ ✅ Task created successfully!                │  │
│ └──────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🔧 Tool: add_task                            │  │  ← Tool call
│ │ ├─ title: "Review the PR"                   │  │
│ │ ├─ priority: "high"                         │  │
│ │ └─ Result: Task ID 123 created              │  │
│ └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**UI Layout (User Message):**
```
┌────────────────────────────────────────────────────┐
│                            [👤] You        2:33 PM  │
│                     ┌──────────────────────────┐   │
│                     │ Add a task to review    │   │
│                     │ the PR by Friday        │   │
│                     └──────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

**Styling:**
```css
/* Message Container */
.chat-message {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: message-fade-in 0.3s ease-out;
}

@keyframes message-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* AI Message */
.chat-message.assistant {
  align-items: flex-start;
}

.chat-message.assistant .message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #00d4ff;
  margin-bottom: 4px;
}

.chat-message.assistant .message-content {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 80%;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  position: relative;
}

.chat-message.assistant .message-content::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px 8px 8px 0;
  border-color: transparent rgba(0, 212, 255, 0.2) transparent transparent;
}

/* User Message */
.chat-message.user {
  align-items: flex-end;
}

.chat-message.user .message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.chat-message.user .message-content {
  background: rgba(255, 0, 255, 0.1);
  border: 1px solid rgba(255, 0, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 80%;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  position: relative;
}

.chat-message.user .message-content::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 12px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent rgba(255, 0, 255, 0.2);
}

/* Streaming Cursor */
.streaming-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: #00d4ff;
  margin-left: 4px;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Timestamp */
.message-timestamp {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 4px;
}

/* Markdown Styling */
.message-content p {
  margin: 0 0 8px 0;
}

.message-content p:last-child {
  margin-bottom: 0;
}

.message-content code {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #ffcc00;
}

.message-content pre {
  background: rgba(0, 0, 0, 0.5);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-content pre code {
  background: none;
  padding: 0;
}

.message-content ul,
.message-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.message-content li {
  margin: 4px 0;
}
```

**Behavior:**
- Renders markdown in AI messages
- Shows timestamps
- Highlights code blocks
- Streaming cursor for AI responses
- Tool call indicators

**Acceptance Criteria:**
- [ ] AI messages align left, user messages align right
- [ ] Markdown rendering for AI responses
- [ ] Code syntax highlighting
- [ ] Timestamps display
- [ ] Streaming cursor animation
- [ ] Fade-in animation on new messages
- [ ] Responsive max-width (80%)

---

### 2.6 ToolCallIndicator

**File:** `components/chat/tool-call-indicator.tsx`

**Type:** Client Component ("use client")

**Purpose:** Show when AI is calling MCP tools

**Props:**
```typescript
interface ToolCallIndicatorProps {
  toolName: string;
  args: Record<string, any>;
  status?: 'pending' | 'success' | 'error';
  result?: any;
}

// Example usage
<ToolCallIndicator
  toolName="add_task"
  args={{ title: "Review PR", priority: "high" }}
  status="success"
  result={{ id: 123, title: "Review PR" }}
/>
```

**UI Layout:**
```
┌──────────────────────────────────────────────────┐
│ 🔧 Tool Call: add_task                          │
│ ├─ Arguments:                                   │
│ │  • title: "Review the PR"                     │
│ │  • priority: "high"                           │
│ ├─ Status: ✅ Success                           │
│ └─ Result: Task ID 123 created                  │
└──────────────────────────────────────────────────┘
```

**Styling:**
```css
.tool-call-indicator {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 204, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.tool-call-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffcc00;
  font-weight: 600;
  margin-bottom: 8px;
}

.tool-call-section {
  margin-left: 24px;
  margin-bottom: 8px;
}

.tool-call-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.tool-call-args {
  color: rgba(255, 255, 255, 0.7);
}

.tool-call-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-call-status.pending {
  color: #ffcc00;
}

.tool-call-status.success {
  color: #00ff88;
}

.tool-call-status.error {
  color: #ff0055;
}

.tool-call-result {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* Animated Icon for Pending */
.tool-call-icon.pending {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**Behavior:**
- Shows tool name and arguments
- Displays execution status
- Animates while pending
- Shows result on success
- Shows error on failure

**Acceptance Criteria:**
- [ ] Tool name displays with icon
- [ ] Arguments formatted as key-value pairs
- [ ] Status icon reflects current state
- [ ] Animated spinner for pending
- [ ] Success/error colors
- [ ] Collapsible (optional)

---

### 2.7 TypingIndicator

**File:** `components/chat/typing-indicator.tsx`

**Type:** Client Component ("use client")

**Purpose:** Animated "AI is typing" indicator

**Props:**
```typescript
interface TypingIndicatorProps {
  text?: string;
}

// Example usage
<TypingIndicator text="AI is thinking..." />
```

**UI Layout:**
```
┌──────────────────────────────────────────────────┐
│ [🤖] AI Assistant                                │
│ ┌────────────────────────────────────────────┐   │
│ │ ▊▊▊                                        │   │
│ │ AI is thinking...                          │   │
│ └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

**Styling:**
```css
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  max-width: 120px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #00d4ff;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.typing-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
```

**Behavior:**
- Animated bouncing dots
- Optional text label
- Removed when message arrives

**Acceptance Criteria:**
- [ ] Three animated dots
- [ ] Bouncing animation (1.4s cycle)
- [ ] Neon cyan color
- [ ] Smooth entry/exit
- [ ] Accessible (aria-live)

---

### 2.8 ChatInputArea

**File:** `components/chat/chat-input-area.tsx`

**Type:** Client Component ("use client")

**Purpose:** Input field with send button and optional voice button

**Props:**
```typescript
interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  isVoiceEnabled?: boolean;
  placeholder?: string;
}

// Example usage
<ChatInputArea
  onSendMessage={handleSendMessage}
  isStreaming={isAiStreaming}
  isVoiceEnabled={true}
  placeholder="Ask AI to manage your tasks..."
/>
```

**UI Layout:**
```
┌──────────────────────────────────────────────────┐
│ ┌────────────────────────────────────┐ [🎤] [↑]  │
│ │ Type a message...                  │           │
│ └────────────────────────────────────┘           │
│         ↑                      ↑        ↑        │
│    Text input           Voice (opt)   Send       │
│    (auto-expand)                      btn        │
└──────────────────────────────────────────────────┘
```

**Styling:**
```css
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input-wrapper {
  flex: 1;
  position: relative;
}

.chat-input {
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: all 0.2s;
}

.chat-input:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Send Button */
.send-button {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  border: none;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}

/* Voice Button */
.voice-button {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 255, 0.3);
  color: #ff00ff;
}

.voice-button.recording {
  background: rgba(255, 0, 85, 0.2);
  border-color: #ff0055;
  color: #ff0055;
  animation: pulse-red 1.5s ease-in-out infinite;
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 0, 85, 0);
  }
}
```

**Behavior:**
- Auto-expanding textarea (up to max-height)
- Send with Enter (Shift+Enter for new line)
- Disabled while streaming
- Voice button toggles recording (bonus)
- Focus management

**Acceptance Criteria:**
- [ ] Auto-expands with content
- [ ] Enter sends, Shift+Enter new line
- [ ] Disabled during streaming
- [ ] Focus ring visible
- [ ] Send button disabled when empty
- [ ] Voice button toggles recording state (if enabled)
- [ ] Keyboard accessible

---

### 2.9 Voice Input Components (Bonus)

**File:** `components/voice/voice-input-button.tsx`

**Type:** Client Component ("use client")

**Purpose:** Microphone button with Web Speech API integration

**Props:**
```typescript
interface VoiceInputButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  transcript?: string;
  isSupported?: boolean;
}

// Example usage
<VoiceInputButton
  isRecording={isRecording}
  onToggleRecording={handleToggleRecording}
  transcript={voiceTranscript}
  isSupported={('webkitSpeechRecognition' in window)}
/>
```

**Styling:**
```css
.voice-input-button {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-input-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 0, 255, 0.3);
  color: #ff00ff;
}

.voice-input-button.recording {
  background: rgba(255, 0, 85, 0.2);
  border-color: #ff0055;
  color: #ff0055;
  animation: pulse-red 1.5s ease-in-out infinite;
}

.voice-input-button.unsupported {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Transcript Tooltip */
.transcript-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 0, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: fade-in 0.2s ease-out;
}

.transcript-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(255, 0, 255, 0.3);
}
```

**Behavior:**
- Checks browser support
- Toggles recording on click
- Shows transcript while recording
- Stops on silence or manual stop
- Error handling for permission denied

**Acceptance Criteria:**
- [ ] Detects Web Speech API support
- [ ] Requests microphone permission
- [ ] Records speech and converts to text
- [ ] Shows transcript in tooltip
- [ ] Visual feedback when recording
- [ ] Error handling for permission denied
- [ ] Stops on silence or manual stop

---

### 2.10 ChatSidebar (Alternative Full-Page View)

**File:** `components/chat/chat-sidebar.tsx`

**Type:** Client Component ("use client")

**Purpose:** Full sidebar chat view (alternative to floating widget)

**Props:**
```typescript
interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  authToken: string;
}

// Example usage
<ChatSidebar
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
  userId={user.id}
  authToken={token}
/>
```

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Header │ Main Content              │ Chat Sidebar (400px)│
│        │                          │ ┌─────────────────┐ │
│        │                          │ │ AI Assistant    │ │
│        │                          │ ├─────────────────┤ │
│        │                          │ │ AI: Hello!      │ │
│        │                          │ │ User: Add...    │ │
│        │                          │ │ AI: Added!      │ │
│        │                          │ │                 │ │
│        │                          │ ├─────────────────┤ │
│        │                          │ │ [Type...] [↑]   │ │
│        │                          │ └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Styling:**
```css
.chat-sidebar {
  position: fixed;
  top: 64px; /* Below navbar */
  right: 0;
  bottom: 0;
  width: 400px;
  background: rgba(10, 10, 10, 0.98);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Overlay for mobile */
.chat-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99;
  animation: fade-in 0.3s;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 1024px) {
  .chat-sidebar {
    width: 100%;
  }
}
```

**Behavior:**
- Slides in from right
- Overlay on mobile
- Close button in header
- Full height (minus navbar)

**Acceptance Criteria:**
- [ ] Slides in from right
- [ ] Full height (below navbar)
- [ ] Overlay on mobile
- [ ] Close button works
- [ ] Responsive width

---

## 3. Custom React Hooks

### 3.1 useChat Hook

**File:** `components/hooks/use-chat.ts`

**Purpose:** Manage chat state, message history, and streaming

**Interface:**
```typescript
interface UseChatOptions {
  apiEndpoint: string;
  authToken: string;
  userId: string;
  initialMessages?: ChatMessage[];
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
}

// Example usage
const {
  messages,
  isStreaming,
  error,
  sendMessage,
  retryLastMessage,
  clearMessages,
} = useChat({
  apiEndpoint: '/api/agent/chat',
  authToken: token,
  userId: user.id,
});
```

**Implementation:**
```typescript
export function useChat(options: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(
    options.initialMessages || []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Start streaming
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch(options.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${options.authToken}`,
        },
        body: JSON.stringify({
          message: content,
          user_id: options.userId,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      // Add empty assistant message
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'content') {
              assistantMessage.content += data.content;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...assistantMessage }
                    : msg
                )
              );
            } else if (data.type === 'tool_call') {
              assistantMessage.toolCalls = [
                ...(assistantMessage.toolCalls || []),
                data.tool_call,
              ];
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (err) {
      setError(err as Error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: 'system',
        content: `Error: ${(err as Error).message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const retryLastMessage = async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user');

    if (lastUserMessage) {
      // Remove last assistant message and retry
      setMessages((prev) => prev.slice(0, -1));
      await sendMessage(lastUserMessage.content);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    retryLastMessage,
    clearMessages,
  };
}
```

**Acceptance Criteria:**
- [ ] Manages message state
- [ ] Handles streaming responses
- [ ] Error handling with user-friendly messages
- [ ] Retry functionality
- [ ] Clear history
- [ ] Tool call tracking

---

### 3.2 useSpeechRecognition Hook (Bonus)

**File:** `components/hooks/use-speech-recognition.ts`

**Purpose:** Web Speech API integration for voice input

**Interface:**
```typescript
interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Example usage
const {
  isListening,
  transcript,
  isSupported,
  error,
  startListening,
  stopListening,
  resetTranscript,
} = useSpeechRecognition();
```

**Implementation:**
```typescript
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = useMemo(() => {
    return 'webkitSpeechRecognition' in window ||
           'SpeechRecognition' in window;
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition ||
                              (window as any).webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]);

  const startListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError(null);
    setTranscript('');
    setIsListening(true);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
```

**Acceptance Criteria:**
- [ ] Detects browser support
- [ ] Starts/stops recording
- [ ] Returns transcript
- [ ] Error handling
- [ ] Cleanup on unmount

---

### 3.3 useMessageHistory Hook

**File:** `components/hooks/use-message-history.ts`

**Purpose:** Persist message history to localStorage

**Interface:**
```typescript
interface UseMessageHistoryReturn {
  messages: ChatMessage[];
  saveMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

// Example usage
const { messages, saveMessages, clearMessages } = useMessageHistory(userId);
```

**Implementation:**
```typescript
const MESSAGES_STORAGE_KEY = 'chat_messages';

export function useMessageHistory(userId: string): UseMessageHistoryReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`${MESSAGES_STORAGE_KEY}_${userId}`);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored messages:', err);
      }
    }
  }, [userId]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem(
      `${MESSAGES_STORAGE_KEY}_${userId}`,
      JSON.stringify(newMessages)
    );
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(`${MESSAGES_STORAGE_KEY}_${userId}`);
  };

  return {
    messages,
    saveMessages,
    clearMessages,
  };
}
```

**Acceptance Criteria:**
- [ ] Loads messages from localStorage
- [ ] Saves messages to localStorage
- [ ] Clears messages
- [ ] User-scoped storage
- [ ] Error handling for corrupt data

---

## 4. Integration with Dashboard

### 4.1 Dashboard Page Integration

**File:** `app/dashboard/page.tsx`

**Integration:**
```tsx
import { ChatWidget } from '@/components/chat/chat-widget';
import { ChatToggle } from '@/components/chat/chat-toggle';

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, token } = useAuth();

  return (
    <div className="dashboard">
      {/* Existing dashboard content */}
      <TaskList />
      <TaskTable />

      {/* Chat widget integration */}
      <ChatToggle
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {isChatOpen && (
        <ChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userId={user.id}
          authToken={token}
        />
      )}
    </div>
  );
}
```

**Alternative: Sidebar Toggle**

```tsx
// In sidebar.tsx
import { ChatSidebar } from '@/components/chat/chat-sidebar';

export function Sidebar() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <nav className="sidebar">
      {/* Existing nav items */}
      <NavItem href="/dashboard">Dashboard</NavItem>
      <NavItem href="/tasks">Tasks</NavItem>

      {/* Chat toggle in sidebar */}
      <NavItem onClick={() => setIsChatOpen(true)}>
        <MessageCircle />
        AI Assistant
      </NavItem>

      {/* Chat sidebar */}
      {isChatOpen && (
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userId={user.id}
          authToken={token}
        />
      )}
    </nav>
  );
}
```

---

## 5. Responsive Design

### 5.1 Breakpoints

```javascript
// Tailwind breakpoints
screens: {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### 5.2 Component Responsive Behavior

**ChatToggle:**
- Mobile (<768px): 56x56px, bottom: 16px, right: 16px
- Desktop (≥768px): 64x64px, bottom: 24px, right: 24px

**ChatWidget:**
- Mobile (<768px): Full screen, 100vw x 100vh
- Tablet (768-1024px): 90vw x 80vh
- Desktop (≥1024px): 600px x 600px (floating)

**ChatSidebar:**
- Mobile (<768px): Full width (100vw)
- Desktop (≥768px): 400px width

**ChatMessage:**
- Mobile: max-width 90%
- Desktop: max-width 80%

---

## 6. Accessibility (WCAG 2.1 AA)

### 6.1 Keyboard Navigation

- Tab order: Toggle button → Chat input → Send button → Voice button
- Enter: Send message
- Escape: Close widget
- Shift+Enter: New line in input

### 6.2 ARIA Labels

```tsx
<ChatToggle
  aria-label="Open AI chat assistant"
  aria-expanded={isChatOpen}
/>

<ChatWidget
  role="dialog"
  aria-label="AI chat interface"
  aria-modal="true"
/>

<ChatInputArea
  aria-label="Type your message"
/>

<VoiceInputButton
  aria-label="Toggle voice input"
  aria-pressed={isRecording}
/>
```

### 6.3 Screen Reader Support

- Live regions for new messages: `aria-live="polite"`
- Status announcements: "AI is typing", "Task added successfully"
- Tool call indicators: "Calling add_task tool"

---

## 7. Performance Optimization

### 7.1 Message Rendering

- Virtual scrolling for long conversations (react-window or react-virtuoso)
- Message pagination (load 50 messages at a time)
- Lazy loading of message attachments

### 7.2 Streaming Performance

- Chunk size: 4KB for streaming responses
- Debounce input: 300ms for autocomplete
- Throttle scroll events: 100ms

### 7.3 Bundle Size

- Code splitting for voice features (dynamic import)
- Tree-shaking for unused icons
- Lazy load markdown renderer

---

## 8. Error Handling

### 8.1 Network Errors

```typescript
// Display user-friendly error messages
const errorMessages: Record<string, string> = {
  'Failed to fetch': 'Network error. Please check your connection.',
  'Unauthorized': 'Session expired. Please log in again.',
  'Rate limit exceeded': 'Too many requests. Please wait a moment.',
};
```

### 8.2 Streaming Errors

- Reconnection logic with exponential backoff
- Retry on connection drop
- Timeout after 30 seconds

### 8.3 Voice Input Errors

- Permission denied: Show microphone permission prompt
- Not supported: Hide voice button
- No speech detected: Timeout after 5 seconds

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// useChat.test.ts
describe('useChat', () => {
  it('should add user message on sendMessage', async () => {
    const { result } = renderHook(() => useChat(mockOptions));
    await act(() => result.current.sendMessage('Hello'));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('user');
  });

  it('should handle streaming responses', async () => {
    // Test streaming logic
  });
});
```

### 9.2 Integration Tests

```typescript
// ChatWidget.test.tsx
describe('ChatWidget', () => {
  it('should open on toggle click', () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText('Open AI chat'));
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('should send message on Enter key', () => {
    // Test message sending
  });
});
```

### 9.3 E2E Tests

```typescript
// e2e/chat.spec.ts
test('complete chat flow', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[aria-label="Open AI chat"]');
  await page.fill('[aria-label="Type your message"]', 'Add a task');
  await page.press('[aria-label="Type your message"]', 'Enter');
  await expect(page.locator('.chat-message.assistant')).toBeVisible();
});
```

---

## 10. Implementation Checklist

### 10.1 Core Components

- [ ] ChatToggle (floating button)
- [ ] ChatWidget (main container)
- [ ] ChatHeader (title and controls)
- [ ] ChatMessages (message list)
- [ ] ChatMessage (individual message)
- [ ] ToolCallIndicator (tool execution display)
- [ ] TypingIndicator (typing animation)
- [ ] ChatInputArea (input field + buttons)

### 10.2 Custom Hooks

- [ ] useChat (state management)
- [ ] useMessageHistory (localStorage persistence)
- [ ] useSpeechRecognition (voice input - bonus)

### 10.3 Styling

- [ ] Cyberpunk theme (neon glows, glassmorphism)
- [ ] Responsive breakpoints
- [ ] Animations (slide-up, fade-in, pulse)
- [ ] Dark mode optimization
- [ ] RTL support for Urdu (bonus)

### 10.4 Integration

- [ ] Dashboard integration (floating widget)
- [ ] Sidebar integration (alternative view)
- [ ] API connection (/api/agent/chat)
- [ ] JWT authentication
- [ ] Error handling

### 10.5 Accessibility

- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Screen reader support
- [ ] Focus management
- [ ] Color contrast (WCAG AA)

### 10.6 Testing

- [ ] Unit tests for hooks
- [ ] Integration tests for components
- [ ] E2E tests for chat flow
- [ ] Accessibility audit (axe DevTools)
- [ ] Performance testing (Lighthouse)

### 10.7 Bonus Features

- [ ] Voice input (Web Speech API)
- [ ] Urdu language support (RTL)
- [ ] Voice waveform animation
- [ ] Message search/filter
- [ ] Export chat history

---

## 11. Cross-References

**Related Specifications:**
- @specs/ui/components.md – Reusable UI components (Button, Dialog, Input)
- @specs/ui/theme.md – Cyberpunk theme styling (colors, effects, animations)
- @specs/ui/pages.md – Dashboard page layout
- @specs/features/ai-chatbot/spec.md – AI chatbot feature specification
- @specs/api/mcp-tools.md – MCP tool definitions for Todo CRUD
- @specs/ai/agents/ – Agent orchestration and NLP parsing

**Skills to Use:**
- `chatbot-integrator` – Integrate ChatKit patterns into Next.js
- `ui-ux-cyberpunk-architect` – Design cyberpunk styling and animations
- `voice-command-specialist` – Implement voice input (bonus)
- `urdu-language-support` – Add Urdu language support (bonus)

**Implementation Order:**
1. Create custom hooks (useChat, useMessageHistory)
2. Build core components (ChatToggle, ChatWidget, ChatInputArea)
3. Implement message rendering (ChatMessage, ChatMessages, TypingIndicator)
4. Add tool call indicators (ToolCallIndicator)
5. Style with cyberpunk theme (neon glows, glassmorphism, animations)
6. Integrate with dashboard (floating widget + sidebar alternative)
7. Add accessibility features (keyboard nav, ARIA labels, screen reader)
8. Implement bonus features (voice input, Urdu support)
9. Write tests (unit, integration, E2E)
10. Performance optimization and bundle size reduction

---

## 12. Open Questions & Decisions Needed

1. **ChatKit vs Custom Implementation:**
   - Should we use OpenAI ChatKit library or build custom components following ChatKit patterns?
   - Decision needed before implementation starts

2. **Message Persistence:**
   - Should message history be stored in localStorage or backend database?
   - Backend allows cross-device sync, localStorage is simpler

3. **Streaming Protocol:**
   - Should we use Server-Sent Events (SSE) or WebSockets for streaming?
   - SSE is simpler, WebSockets support bidirectional communication

4. **Voice Input Scope:**
   - Is voice input a core requirement or bonus feature?
   - Affects component priority and implementation order

5. **Urdu Language Support:**
   - Should Urdu be supported in Phase 3 core or as bonus?
   - Requires RTL layout adjustments and NLP changes

---

**End of specs/ui/chatbot-widget.md**

**Version:** 1.0 | **Last Updated:** 2026-02-09 | **Status:** Draft | **Author:** Chatbot-Integrator Agent
