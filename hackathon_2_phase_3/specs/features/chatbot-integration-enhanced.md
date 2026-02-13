# specs/features/chatbot-integration.md

## Feature Specification: AI-Powered Chatbot Integration

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 1.3, @specs/ui/chatbot-widget.md, @specs/api/mcp-tools.md, @specs/agent-logic.md, @specs/api/rest-endpoints.md, @specs/database/schema.md

---

## Overview

Define the complete AI chatbot integration feature for Phase 3 of Hackathon II Todo Chatbot. This specification covers the full conversational flow for all Basic Level features via natural language, connecting the frontend ChatKit UI (@specs/ui/chatbot-widget.md) with backend MCP tools (@specs/api/mcp-tools.md) and agent orchestration (@specs/agent-logic.md).

**Feature Goal:** Enable users to manage all Todo CRUD operations (Add, List, Update, Complete, Delete) through natural language conversation with an AI chatbot.

**Technology Stack:**
- **Frontend UI:** OpenAI ChatKit with cyberpunk theme (@specs/ui/chatbot-widget.md)
- **Backend LLM:** Cohere API (tool calling compatible)
- **Agent Framework:** OpenAI Agents SDK patterns
- **Tool Protocol:** Model Context Protocol (MCP)
- **Authentication:** Better Auth JWT (from Phase 2)
- **Database:** Neon PostgreSQL (from Phase 2)

**Natural Language Examples:**
- "Add grocery shopping" → Creates new task
- "Show pending tasks" → Lists incomplete tasks
- "Complete morning meeting" → Marks task as done
- "Delete old task" → Removes task (asks for clarification)
- "Reschedule meeting to 2 PM" → Updates task with new time
- "Show high priority tasks" → Filters by priority
- "What's on my list today?" → Lists all tasks

---

## 1. User Scenarios & Testing

### User Story 1 - Natural Language Task Creation (Priority: P1)

**Description:** User creates new tasks by conversing with the AI chatbot in plain English (or Urdu for bonus).

**Why this priority:** Core feature - enables conversational Todo management without UI navigation.

**Independent Test:** Can create tasks via chat while Task List UI exists separately (tasks sync between both views).

**Acceptance Scenarios:**
1. **Given** user is on dashboard with chat widget open, **When** user types "Add a task to review the PR", **Then** chatbot responds "Task added: 'review the PR'" and task appears in Task List
2. **Given** user types "Create grocery shopping task with high priority", **Then** chatbot creates task with priority=high and confirms
3. **Given** user types "Add task: Buy milk, bread, eggs", **Then** chatbot creates task with title "Buy milk, bread, eggs" and shows confirmation
4. **Given** user types Urdu text "مجھے کام شامل کریں", **Then** (bonus) chatbot detects Urdu and asks in Urdu "کس کام کو شامل کریں؟"
5. **Given** user clicks mic button and says "Add task call mom at 5pm", **Then** (bonus) speech-to-text converts to text and creates task

---

### User Story 2 - Natural Language Task Queries (Priority: P1)

**Description:** User queries their tasks using natural language filters and sorting.

**Why this priority:** Core feature - enables task discovery without complex UI filters.

**Independent Test:** Can query tasks via chat while Task List UI has separate filter controls.

**Acceptance Scenarios:**
1. **Given** user has 10 tasks (5 pending, 5 completed), **When** user types "Show my pending tasks", **Then** chatbot lists only 5 pending tasks with titles
2. **Given** user types "What are my high priority tasks?", **Then** chatbot filters tasks by priority=high and displays them
3. **Given** user types "List all completed tasks", **Then** chatbot shows only completed tasks
4. **Given** user types "Show me tasks created today", **Then** chatbot filters by created_at date
5. **Given** user types "میرے تمام کام دکھائیں", **Then** (bonus) chatbot detects Urdu and responds in Urdu with task list

---

### User Story 3 - Natural Language Task Updates (Priority: P1)

**Description:** User updates task fields (title, description, priority, completion) through conversation.

**Why this priority:** Core feature - enables task modification without navigating to edit forms.

**Independent Test:** Can update tasks via chat while Task Edit Dialog exists separately.

**Acceptance Scenarios:**
1. **Given** user has task "Build auth system", **When** user types "Mark 'Build auth system' as complete", **Then** chatbot marks task as completed and confirms
2. **Given** user types "Complete my morning meeting", **Then** chatbot identifies task and marks complete
3. **Given** user types "Change priority of grocery shopping to high", **Then** chatbot updates task priority
4. **Given** user types "Rename 'Buy milk' to 'Buy almond milk'", **Then** chatbot updates task title
5. **Given** user types "Reschedule my meeting to 2 PM tomorrow", **Then** chatbot asks for clarification (which meeting?) and updates after user specifies

---

### User Story 4 - Natural Language Task Deletion (Priority: P1)

**Description:** User deletes tasks by conversing with the chatbot.

**Why this priority:** Core feature - enables task removal without confirmation dialogs.

**Independent Test:** Can delete tasks via chat while Task Delete button exists separately.

**Acceptance Scenarios:**
1. **Given** user has task "Old task", **When** user types "Delete the old task", **Then** chatbot confirms deletion and removes task from database
2. **Given** user types "Remove my grocery shopping task", **Then** chatbot deletes task and confirms
3. **Given** user has multiple tasks with "meeting" in title, **When** user types "Delete meeting task", **Then** chatbot asks "Which meeting task?" and lists matching tasks
4. **Given** user selects task from chatbot's list, **Then** chatbot deletes that specific task
5. **Given** user types "یہ کام ختم کریں" (Urdu for "delete this task"), **Then** (bonus) chatbot detects Urdu and asks for clarification in Urdu

---

### User Story 5 - Multi-Turn Conversations (Priority: P2)

**Description:** Chatbot maintains context across multiple messages in a conversation.

**Why this priority:** Improves UX - users can reference previous entities without repetition.

**Independent Test:** Can maintain conversation context while single-turn commands work independently.

**Acceptance Scenarios:**
1. **Given** user typed "Add task: Review PR", **Then** user types "Make it high priority", **When** chatbot updates the previously created task to high priority
2. **Given** user typed "Show my pending tasks", **Then** user types "Complete the first one", **When** chatbot marks the first task from previous list as complete
3. **Given** user typed "Delete task 3", **Then** user types "Actually, undo that", **When** chatbot apologizes and explains deletion cannot be undone (or offers recovery if implemented)
4. **Given** user typed "Add 3 tasks for shopping", **When** user types "Show me the list", **Then** chatbot displays all tasks including the 3 new shopping tasks
5. **Given** user switches topics from tasks to calendar (bonus), **Then** chatbot resets context appropriately

---

### User Story 6 - Error Handling & Ambiguity Resolution (Priority: P1)

**Description:** Chatbot gracefully handles errors, missing information, and ambiguous requests.

**Why this priority:** Critical UX - prevents user frustration and provides helpful guidance.

**Independent Test:** Can test error scenarios while normal flows work correctly.

**Acceptance Scenarios:**
1. **Given** user types "Add task" (without title), **When** chatbot responds "What task would you like to add?" and waits for input
2. **Given** user types "Delete task" (without specifying which), **When** chatbot responds "Which task would you like to delete?" and lists user's tasks
3. **Given** user types "Complete xyz123" (task doesn't exist), **When** chatbot responds "I couldn't find a task named 'xyz123'. Would you like me to list your tasks?"
4. **Given** user types "Show tasks for next Friday" (invalid date), **When** chatbot responds "I couldn't understand the date. Could you specify the date?"
5. **Given** user types gibberish "asdfghjkl", **When** chatbot responds "I'm not sure what you mean. You can ask me to add, list, update, or delete tasks."

---

### User Story 7 - Voice Input Integration (Priority: P3 - Bonus)

**Description:** User can speak commands instead of typing (bonus feature for +200 points).

**Why this priority:** Bonus feature - enhances accessibility and convenience.

**Independent Test:** Can test voice input while text input works independently.

**Acceptance Scenarios:**
1. **Given** user clicks microphone button, **When** user speaks "Add task call mom", **Then** speech-to-text converts to "Add task call mom" and creates task
2. **Given** user is speaking, **When** chatbot shows "🎤 Listening..." animation with waveform, **Then** user knows microphone is active
3. **Given** user speaks with background noise, **When** speech recognition fails, **Then** chatbot shows error "Could not understand audio. Please try again."
4. **Given** user speaks in Urdu, **When** speech recognition detects Urdu, **Then** transcript shows Urdu text and chatbot responds in Urdu (bonus)
5. **Given** user stops speaking, **When** chatbot auto-submits after 3 seconds of silence, **Then** task is created without manual send button

---

### User Story 8 - Urdu Language Support (Priority: P3 - Bonus)

**Description:** Chatbot understands and responds in Urdu (bonus feature for +100 points).

**Why this priority:** Bonus feature - demonstrates multilingual NLP capabilities.

**Independent Test:** Can test Urdu commands while English commands work independently.

**Acceptance Scenarios:**
1. **Given** user types "مجھے کام شامل کریں" (Add a task for me), **When** chatbot detects Urdu and responds in Urdu "کس کام کو شامل کریں؟" (What task should I add?)
2. **Given** user types "میرے تمام کام دکھائیں" (Show my all tasks), **When** chatbot responds in Urdu with task list "یہ رہے آپ کے کام:" (Here are your tasks:)
3. **Given** user types "کام مکمل کریں" (Complete the task), **When** chatbot asks for clarification in Urdu "کنسا کام مکمل کروں؟" (Which task should I complete?)
4. **Given** user types "یہ کام ختم کریں" (Delete this task), **When** chatbot confirms deletion in Urdu "کام حذف کر دیا گیا" (Task has been deleted)
5. **Given** chatbot responds in Urdu, **When** UI renders text with RTL (right-to-left) direction, **Then** Urdu text displays correctly

---

## 2. Requirements

### Functional Requirements

**FR-001:** System MUST accept natural language input via ChatKit widget
**FR-002:** System MUST parse user input to identify intent (add/list/update/complete/delete)
**FR-003:** System MUST extract entities from input (task title, priority, status, dates)
**FR-004:** System MUST execute appropriate MCP tool based on parsed intent
**FR-005:** System MUST enforce user isolation via JWT token on all tool executions
**FR-006:** System MUST generate natural language responses from tool results
**FR-007:** System MUST handle ambiguous requests by asking clarifying questions
**FR-008:** System MUST maintain conversation context across multiple turns (P2)
**FR-009:** System MUST display tool execution indicators during processing
**FR-010:** System MUST stream responses character-by-character for real-time feedback
**FR-011:** System MUST validate user input and show helpful error messages
**FR-012:** System MUST support all 5 CRUD operations (Create, Read, Update, Delete, Complete)
**FR-013:** System MUST support filtering tasks by status (pending/completed)
**FR-014:** System MUST support filtering tasks by priority (low/medium/high)
**FR-015:** System MUST support voice input via Web Speech API (bonus P3)
**FR-016:** System MUST support Urdu language input/output (bonus P3)

### Key Entities

**ConversationState:**
- `message_history`: Array of chat messages (user + assistant)
- `user_id`: Authenticated user ID from JWT
- `context`: Previous intent and entities for multi-turn conversations
- `language`: Detected language (en/ur, default: en)

**ParsedIntent:**
- `intent`: Enum (add_task/list_tasks/update_task/complete_task/delete_task/unknown)
- `entities`: Dict of extracted parameters (title, priority, status, task_id, dates)
- `confidence`: Float (0-1) indicating parsing confidence

**ToolExecution:**
- `tool_name`: Name of MCP tool being executed
- `parameters`: Dict of parameters to pass to tool
- `result`: Return value from tool execution
- `duration_ms`: Execution time for monitoring

**ChatMessage:**
- `role`: Enum (user/assistant/system)
- `content`: Message text (supports Markdown)
- `timestamp`: ISO 8601 datetime
- `tool_calls`: Array of tool executions (for assistant messages)
- `metadata`: Additional data (is_streaming, error indicators)

---

## 3. Architecture & Data Flow

### 3.1 Complete Conversational Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: User Input (Frontend)                                │
├─────────────────────────────────────────────────────────────┤
│ User types/speaks in ChatKit widget                          │
│   ↓                                                           │
│ Frontend captures input + JWT token                          │
│   ↓                                                           │
│ Send POST /api/agent/chat with {message, token}             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: JWT Verification (Backend)                           │
├─────────────────────────────────────────────────────────────┤
│ Middleware extracts JWT from Authorization header            │
│   ↓                                                           │
│ Verify signature using BETTER_AUTH_SECRET                   │
│   ↓                                                           │
│ Extract user_id from JWT payload                             │
│   ↓                                                           │
│ Pass user_id to request.state for tool execution            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: NLP Intent Parsing (Agent Layer)                     │
├─────────────────────────────────────────────────────────────┤
│ Receive user message + user_id                              │
│   ↓                                                           │
│ Call Cohere API for intent classification                   │
│   Prompt: "Classify intent: {user_message}"                 │
│   ↓                                                           │
│ Extract entities from message                               │
│   - title: "review the PR"                                  │
│   - priority: "high"                                        │
│   - status: "pending"                                       │
│   - task_id: "123" (if referenced)                          │
│   ↓                                                           │
│ Return ParsedIntent {intent, entities, confidence}          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: MCP Tool Execution (Agent Layer)                     │
├─────────────────────────────────────────────────────────────┤
│ Route to appropriate MCP tool based on intent                │
│   ↓                                                           │
│ **Example: add_task intent**                                │
│   - Call mcp.add_task(                                     │
│       title="review the PR",                               │
│       priority="high",                                     │
│       user_id=user_id  # From JWT context                 │
│     )                                                       │
│   ↓                                                           │
│ MCP tool executes database operation (scoped to user_id)   │
│   ↓                                                           │
│ Return ToolResult {success, data, error}                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Response Generation (Agent Layer)                    │
├─────────────────────────────────────────────────────────────┤
│ Receive ToolResult from MCP tool                            │
│   ↓                                                           │
│ Generate natural language response via Cohere              │
│   Prompt: "Tool result: {result}. Generate friendly response"│
│   ↓                                                           │
│ Stream response character-by-character (SSE)                │
│   ↓                                                           │
│ Return: "Task added successfully: 'review the PR'"          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Display Response (Frontend)                          │
├─────────────────────────────────────────────────────────────┤
│ ChatKit widget receives streaming response                  │
│   ↓                                                           │
│ Display assistant message with typing animation             │
│   ↓                                                           │
│ Show tool execution indicator (if tools were called)         │
│   ↓                                                           │
│ Auto-scroll to latest message                                │
│   ↓                                                           │
│ Update Task List UI (if tasks were modified)                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Intent-to-Tool Mapping

| User Input Example | Parsed Intent | Entities Extracted | MCP Tool Called | Tool Parameters |
|-------------------|---------------|-------------------|-----------------|----------------|
| "Add grocery shopping" | add_task | title="grocery shopping" | add_task | {title: "grocery shopping", priority: "medium"} |
| "Create high priority task: Review PR" | add_task | title="Review PR", priority="high" | add_task | {title: "Review PR", priority: "high"} |
| "Show my pending tasks" | list_tasks | status="pending" | list_tasks | {user_id, completed: false} |
| "What are my high priority tasks?" | list_tasks | priority="high" | list_tasks | {user_id, priority: "high"} |
| "Complete morning meeting" | complete_task | title="morning meeting" | complete_task | {task_id: <matched>, user_id} |
| "Mark task 123 as done" | complete_task | task_id="123" | complete_task | {task_id: "123", user_id} |
| "Update task 456 to high priority" | update_task | task_id="456", priority="high" | update_task | {task_id: "456", priority: "high", user_id} |
| "Rename 'Buy milk' to 'Buy almond milk'" | update_task | old_title="Buy milk", new_title="Buy almond milk" | update_task | {task_id: <matched>, title: "Buy almond milk", user_id} |
| "Delete the old task" | delete_task | title="old task" | delete_task | {task_id: <matched>, user_id} |
| "Remove task 789" | delete_task | task_id="789" | delete_task | {task_id: "789", user_id} |

---

## 4. API Endpoints

### 4.1 Agent Chat Endpoint

**Endpoint:** `POST /api/agent/chat`

**Description:** Main chat endpoint for processing natural language Todo commands.

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "message": "Add a task to review the PR",
  "conversation_id": "uuid-v4",  // Optional: for multi-turn context
  "language": "en"  // Optional: auto-detected if not provided
}
```

**Request Schema:**
```typescript
interface ChatRequest {
  message: string;           // Required: User's natural language input
  conversation_id?: string;  // Optional: Resume previous conversation
  language?: 'en' | 'ur';    // Optional: Language (default: auto-detect)
}
```

**Response:** `200 OK` (Streaming NDJSON)
```
data: {"type": "tool_call", "tool": "add_task", "params": {"title": "review the PR"}}
data: {"type": "tool_result", "result": {"id": "123", "title": "review the PR"}}
data: {"type": "message_delta", "delta": "Task"}
data: {"type": "message_delta", "delta": " added"}
data: {"type": "message_delta", "delta": " successfully"}
data: {"type": "message_delta", "delta": ": 'review the PR'"}
data: {"type": "done", "full_response": "Task added successfully: 'review the PR'"}
```

**Streaming Event Types:**
- `tool_call`: MCP tool being executed
- `tool_result`: Result from tool execution
- `message_delta`: Character-by-character response streaming
- `error`: Error occurred
- `done`: Stream complete

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Message is required (min_length=1)"
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "detail": "Missing or invalid authorization token"
}
```

**Acceptance Criteria:**
- [ ] Endpoint requires valid JWT token
- [ ] Parses user message to identify intent
- [ ] Extracts entities from message
- [ ] Executes appropriate MCP tool
- [ ] Streams response in real-time
- [ ] Returns 401 if token is invalid
- [ ] Returns 400 if message is empty
- [ ] Supports multi-turn conversations via conversation_id
- [ ] Auto-detects language if not specified

---

## 5. Integration with Phase 2 Backend

### 5.1 Reusing Existing Components

**Database Models (No Changes Required):**
- `Task` model from `@specs/database/schema.md` is unchanged
- All queries filter by `user_id` for isolation
- MCP tools use existing CRUD patterns

**JWT Authentication (No Changes Required):**
- Better Auth JWT issuance from Phase 2 is reused
- JWT verification middleware from `@specs/api/rest-endpoints.md` is reused
- `BETTER_AUTH_SECRET` is shared between frontend and backend

**API Endpoints (Extended for Phase 3):**
- Phase 2 endpoints (`/api/{user_id}/tasks/*`) remain functional
- Phase 3 adds `/api/agent/chat` for chatbot
- Phase 3 adds `/api/mcp/tools/*` for MCP tool execution

### 5.2 User Isolation Enforcement

**Critical:** All MCP tools MUST enforce user isolation

```python
# All MCP tools receive user_id from JWT context
@mcp.tool()
async def add_task(title: str, priority: str = "medium") -> dict:
    """
    Add a new task for the authenticated user.

    Security: user_id is injected from JWT middleware, not from user input
    """
    # Get user_id from request state (set by JWT middleware)
    user_id = get_current_user_id()  # From JWT token

    # Create task with user_id
    task = Task(user_id=user_id, title=title, priority=priority)
    session.add(task)
    await session.commit()

    return {"id": task.id, "title": task.title}
```

**Acceptance Criteria:**
- [ ] All MCP tools verify JWT token
- [ ] All database queries filter by user_id
- [ ] Users cannot access other users' tasks via chatbot
- [ ] JWT middleware runs before all tool executions

---

## 6. Error Handling & Edge Cases

### 6.1 Ambiguity Resolution Patterns

**Pattern 1: Missing Required Parameter**
```
User: "Add task"
Chatbot: "What task would you like to add?"
User: "Review the PR"
Chatbot: "Task added: 'Review the PR'"
```

**Pattern 2: Multiple Matching Tasks**
```
User: "Complete the meeting task"
Chatbot: "I found multiple tasks with 'meeting' in the title:
  1. Morning standup meeting
  2. Team retro meeting
  3. Client call meeting
Which one would you like to complete?"
User: "The first one"
Chatbot: "Marked 'Morning standup meeting' as complete ✓"
```

**Pattern 3: Task Not Found**
```
User: "Delete task xyz123"
Chatbot: "I couldn't find a task with ID 'xyz123'. Would you like me to list your tasks?"
User: "Yes"
Chatbot: [Lists all tasks]
```

**Pattern 4: Invalid Date/Time**
```
User: "Reschedule meeting to 32nd of January"
Chatbot: "I couldn't understand the date '32nd of January'. Could you specify a valid date?"
```

**Pattern 5: Unknown Intent**
```
User: "Tell me a joke"
Chatbot: "I can help you manage your Todo tasks. You can ask me to:
  • Add tasks
  • List tasks
  • Update tasks
  • Complete tasks
  • Delete tasks
What would you like to do?"
```

### 6.2 Error Response Codes

| Error | HTTP Status | Response | Recovery Strategy |
|-------|-------------|----------|-------------------|
| Empty message | 400 | "Message is required (min_length=1)" | Prompt user to enter message |
| Invalid token | 401 | "Missing or invalid authorization token" | Redirect to login |
| Intent parsing failed | 200 | "I'm not sure what you mean. You can ask me to add, list, update, or delete tasks." | Show help message |
| Tool execution failed | 200 | "Sorry, I encountered an error. Please try again." | Retry with clarification |
| Task not found | 200 | "I couldn't find that task. Would you like me to list your tasks?" | Offer to list tasks |
| Multiple matches | 200 | "I found multiple tasks. Which one?" | List matching tasks |
| Missing parameter | 200 | "What [parameter] would you like to [action]?" | Ask for clarification |

---

## 7. Bonus Features

### 7.1 Voice Input (+200 points)

**Implementation:** See `@specs/ui/chatbot-widget.md` Section 8 (Voice Input Components)

**Key Requirements:**
- Microphone button in chat input area
- Web Speech API integration (SpeechRecognition)
- Speech-to-text conversion
- Auto-submit after silence
- Visual feedback (waveform animation)
- Error handling (no microphone, permission denied)

**Acceptance Criteria:**
- [ ] Microphone button visible in chat widget
- [ ] Clicking microphone starts listening
- [ ] Spoken words convert to text in real-time
- [ ] Text is sent to agent after silence
- [ ] Shows error if microphone permission denied
- [ ] Works on Chrome, Edge, Safari (webkit)

### 7.2 Urdu Language Support (+100 points)

**Implementation:** See `@specs/agent-logic.md` Section 7 (Urdu Language Support)

**Key Requirements:**
- Language detection (Urdu vs English)
- Urdu NLP parsing with GPT-4
- Translation to English for intent parsing
- Response translation back to Urdu
- RTL text rendering in chat widget

**Acceptance Criteria:**
- [ ] Detects Urdu input automatically
- [ ] Parses Urdu commands correctly
- [ ] Responds in Urdu when user types in Urdu
- [ ] Renders Urdu text with RTL direction
- [ ] Supports Roman Urdu (Urdu in Latin script)

### 7.3 Cloud-Native Blueprints (+200 points)

**Implementation:** See `@specs/blueprints/mcp-todo-server/blueprint.md`

**Key Requirements:**
- Kubernetes manifests for deployment
- CI/CD pipeline (GitHub Actions)
- Monitoring (Prometheus metrics, Grafana dashboards)
- Security (network policies, secrets management)
- Rollback strategies (blue-green deployment)

**Acceptance Criteria:**
- [ ] Blueprint spec created in `/specs/blueprints/`
- [ ] Kubernetes manifests included
- [ ] CI/CD pipeline configured
- [ ] Monitoring and alerting setup
- [ ] Security policies defined

---

## 8. Success Criteria

### Measurable Outcomes

**SC-001:** Users can create tasks via natural language with 95% intent classification accuracy
**SC-002:** Users can query tasks (filter/sort) via natural language with 90% accuracy
**SC-003:** Users can update/complete tasks via natural language with 90% accuracy
**SC-004:** Chatbot responds to all requests within 3 seconds (p95 latency)
**SC-005:** Chatbot maintains conversation context across 5+ turns
**SC-006:** All chatbot operations enforce user isolation (zero data leaks)
**SC-007:** Chatbot handles errors gracefully with helpful recovery messages
**SC-008:** (Bonus) Voice input achieves 85% speech-to-text accuracy
**SC-009:** (Bonus) Urdu language support achieves 90% intent parsing accuracy
**SC-010:** (Bonus) Cloud-native blueprint enables deployment in under 10 minutes

### User Experience Goals

- **Conversational:** Chatbot feels like a helpful assistant, not a command-line interface
- **Proactive:** Chatbot asks clarifying questions instead of failing
- **Transparent:** Chatbot shows what it's doing (tool execution indicators)
- **Fast:** Streaming responses provide real-time feedback
- **Accessible:** Keyboard navigation, ARIA labels, screen reader support
- **Beautiful:** Cyberpunk theme matches Phase 2 design

---

## 9. Dependencies

### Required Specifications

- `@constitution.md` - Phase 3 project rules and security requirements
- `@specs/ui/chatbot-widget.md` - ChatKit UI components and styling
- `@specs/api/mcp-tools.md` - MCP tool definitions and JWT authentication
- `@specs/agent-logic.md` - Agent orchestration and NLP parsing
- `@specs/api/rest-endpoints.md` - Phase 2 REST API (for reference)
- `@specs/database/schema.md` - Phase 2 database models (Task, User)
- `@specs/ui/components.md` - Phase 2 UI components (Shadcn/UI)

### Required Skills (Subagents)

- `chatbot-integrator` - Integrate ChatKit into dashboard
- `mcp-tool-engineer` - Define MCP tools with Official MCP SDK
- `agents-sdk-specialist` - Implement agent logic with Cohere
- `nlp-intent-parser` - Parse natural language intents
- `urdu-language-support` - Add Urdu language support (bonus)
- `voice-command-specialist` - Implement voice input (bonus)
- `cloud-blueprint-architect` - Create deployment blueprints (bonus)

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=postgresql://...  # Neon DB (from Phase 2)
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
COHERE_API_KEY=6Tcf034qmm5ADPq8SAis8ZtD1Zsyq3fwYo86uUxE  # Cohere LLM
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

---

## 10. Implementation Order

### Phase 1: Core Chatbot (P1 - Required)

1. **Setup Cohere API Integration** (agents-sdk-specialist)
   - Install Cohere SDK
   - Configure API client
   - Test basic text generation

2. **Define MCP Tools** (mcp-tool-engineer)
   - Install Official MCP SDK
   - Define 5 Todo tools (add, list, update, complete, delete)
   - Add JWT authentication middleware
   - Test tool execution with user isolation

3. **Implement NLP Intent Parser** (nlp-intent-parser)
   - Define 5 intents (add, list, update, complete, delete)
   - Create entity extraction patterns
   - Test intent classification with examples
   - Handle ambiguity and errors

4. **Build ChatKit Widget UI** (chatbot-integrator)
   - Install OpenAI ChatKit
   - Create floating toggle button
   - Create chat widget container
   - Style with cyberpunk theme
   - Integrate with dashboard

5. **Connect Frontend to Backend** (chatbot-integrator)
   - Create `/api/agent/chat` endpoint
   - Implement streaming responses
   - Add JWT verification
   - Test end-to-end flow

### Phase 2: Advanced Features (P2 - Important)

6. **Multi-Turn Conversations**
   - Implement conversation context
   - Track previous intents and entities
   - Test context retention across 5+ turns

7. **Tool Execution Indicators**
   - Display tool calls in chat
   - Show processing state
   - Display results in user-friendly format

8. **Error Handling & Ambiguity Resolution**
   - Implement clarification questions
   - Handle missing parameters
   - Provide helpful error messages

### Phase 3: Bonus Features (P3 - Bonus)

9. **Voice Input** (+200 points) (voice-command-specialist)
   - Add microphone button
   - Integrate Web Speech API
   - Implement speech-to-text
   - Add visual feedback

10. **Urdu Language Support** (+100 points) (urdu-language-support)
    - Add language detection
    - Implement Urdu NLP parsing
    - Add translation to/from Urdu
    - Implement RTL text rendering

11. **Cloud-Native Blueprints** (+200 points) (cloud-blueprint-architect)
    - Create Kubernetes manifests
    - Setup CI/CD pipeline
    - Add monitoring and alerting
    - Document deployment process

---

## 11. Testing Checklist

### 11.1 Intent Parsing Tests

- [ ] "Add task: Buy groceries" → add_task intent
- [ ] "Create high priority task: Review PR" → add_task with priority="high"
- [ ] "Show my pending tasks" → list_tasks with status="pending"
- [ ] "What are my high priority tasks?" → list_tasks with priority="high"
- [ ] "Complete morning meeting" → complete_task intent
- [ ] "Mark task 123 as done" → complete_task with task_id="123"
- [ ] "Update task 456 to high priority" → update_task intent
- [ ] "Rename 'Buy milk' to 'Buy almond milk'" → update_task intent
- [ ] "Delete the old task" → delete_task intent
- [ ] "Remove task 789" → delete_task with task_id="789"

### 11.2 Entity Extraction Tests

- [ ] Extracts task title from "Add task: [title]"
- [ ] Extracts priority (low/medium/high) from input
- [ ] Extracts status (pending/completed) from input
- [ ] Extracts task ID when referenced
- [ ] Extracts date/time from temporal expressions
- [ ] Handles quoted and unquoted text

### 11.3 Tool Execution Tests

- [ ] add_task creates task in database with user_id
- [ ] list_tasks returns only user's tasks
- [ ] get_task returns task only if owned by user
- [ ] update_task modifies only user's tasks
- [ ] complete_task toggles completion status
- [ ] delete_task removes only user's tasks

### 11.4 User Isolation Tests

- [ ] User A cannot access User B's tasks via chatbot
- [ ] All MCP tools filter by user_id
- [ ] JWT verification enforced on all requests
- [ ] User ID mismatch returns 403

### 11.5 Error Handling Tests

- [ ] Empty message returns helpful error
- [ ] Missing parameter asks for clarification
- [ ] Ambiguous task reference asks "Which one?"
- [ ] Task not found offers to list tasks
- [ ] Unknown intent shows help message
- [ ] Invalid token returns 401

### 11.6 Voice Input Tests (Bonus)

- [ ] Microphone button starts listening
- [ ] Speech converts to text accurately
- [ ] Auto-submits after silence
- [ ] Shows error if permission denied
- [ ] Works on Chrome, Edge, Safari

### 11.7 Urdu Language Tests (Bonus)

- [ ] Detects Urdu input automatically
- [ ] Parses Urdu commands correctly
- [ ] Responds in Urdu
- [ ] Renders Urdu text with RTL
- [ ] Supports Roman Urdu

---

## 12. Cross-References

**Related Specifications:**
- `@constitution.md` - Phase 3 project rules
- `@specs/ui/chatbot-widget.md` - ChatKit UI components
- `@specs/api/mcp-tools.md` - MCP tool definitions
- `@specs/agent-logic.md` - Agent orchestration
- `@specs/api/rest-endpoints.md` - Phase 2 REST API
- `@specs/database/schema.md` - Database models
- `@specs/ui/components.md` - Phase 2 UI components

**Implementation Files:**
- `frontend/components/chat/*` - ChatKit components
- `frontend/app/api/chat/route.ts` - Chat API route
- `backend/app/agents/orchestrator.py` - Agent orchestration
- `backend/app/mcp/tools/todo_tools.py` - MCP tool definitions
- `backend/app/api/agent_chat.py` - Agent chat endpoint

---

## 13. Appendix: Natural Language Examples

### 13.1 Task Creation Examples

| Natural Language Input | Intent | Entities | Expected Response |
|------------------------|--------|----------|-------------------|
| "Add a task to review the PR" | add_task | title="review the PR" | "Task added: 'review the PR'" |
| "Create grocery shopping task" | add_task | title="grocery shopping" | "Task created: 'grocery shopping'" |
| "Add high priority task: Fix production bug" | add_task | title="Fix production bug", priority="high" | "Task added with high priority: 'Fix production bug'" |
| "I need to call mom tomorrow" | add_task | title="call mom", due_date="tomorrow" | "Task added: 'call mom' (due tomorrow)" |
| "Reminder: Buy milk, bread, eggs" | add_task | title="Buy milk, bread, eggs" | "Task added: 'Buy milk, bread, eggs'" |

### 13.2 Task Query Examples

| Natural Language Input | Intent | Entities | Expected Response |
|------------------------|--------|----------|-------------------|
| "Show my tasks" | list_tasks | {} | Lists all user's tasks |
| "What are my pending tasks?" | list_tasks | status="pending" | Lists incomplete tasks |
| "Show high priority tasks" | list_tasks | priority="high" | Lists high priority tasks |
| "List completed tasks" | list_tasks | status="completed" | Lists completed tasks |
| "What's on my list today?" | list_tasks | date="today" | Lists tasks created today |

### 13.3 Task Update Examples

| Natural Language Input | Intent | Entities | Expected Response |
|------------------------|--------|----------|-------------------|
| "Complete morning meeting" | complete_task | title="morning meeting" | "Marked 'morning meeting' as complete ✓" |
| "Mark task 123 as done" | complete_task | task_id="123" | "Task 123 marked as complete" |
| "Change priority of grocery shopping to high" | update_task | title="grocery shopping", priority="high" | "Updated 'grocery shopping' to high priority" |
| "Rename 'Buy milk' to 'Buy almond milk'" | update_task | old_title="Buy milk", new_title="Buy almond milk" | "Task renamed to 'Buy almond milk'" |
| "Reschedule meeting to 2 PM" | update_task | title="meeting", time="2 PM" | "Meeting rescheduled to 2 PM" |

### 13.4 Task Deletion Examples

| Natural Language Input | Intent | Entities | Expected Response |
|------------------------|--------|----------|-------------------|
| "Delete the old task" | delete_task | title="old task" | "Task deleted: 'old task'" |
| "Remove task 789" | delete_task | task_id="789" | "Task 789 removed" |
| "Get rid of grocery shopping task" | delete_task | title="grocery shopping" | "Task deleted: 'grocery shopping'" |

---

**End of specs/features/chatbot-integration.md**

**Version:** 1.0 | **Last Updated:** 2026-02-09 | **Status:** Draft
