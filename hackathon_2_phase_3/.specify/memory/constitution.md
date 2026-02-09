# Constitution – Hackathon II Phase 3: AI-Powered Todo Chatbot

**Project Name:** hackathon-todo-phase3
**Phase:** Phase 3 – AI-Powered Todo Chatbot with Natural Language Management
**Status:** Active – Enforced for all Phase 3 development work
**Evolution:** Built upon Phase 2 full-stack web app foundations

---

## 1. Project Rules (Supreme Law)

### 1.1 Spec-Driven Development (100% Mandatory)

**ABSOLUTE PROHIBITION:**
- **NEVER** write, edit, or suggest manual code in `.ts`, `.tsx`, `.py`, or any implementation files
- **NEVER** patch implementation code directly when output is wrong
- **NEVER** bypass specs to "quick fix" implementation
- **NEVER** implement chatbot/agent features without detailed specs

**MANDATORY WORKFLOW:**
1. **ALWAYS** create/refine detailed Markdown specifications first (in `/specs/` folder)
2. **ONLY** generate implementation code via `/sp.implement @specs/<feature-spec>` after spec is perfect
3. **IF** output is incorrect → refine the spec, then re-implement
4. **ALL** code changes must trace back to a specification requirement
5. **USE** specialized subagents/skills for Phase 3 AI features

**Enforcement:**
- Before any implementation: verify spec exists, is detailed, and is approved
- During implementation: follow spec verbatim – no improvisation
- After implementation: validate against spec acceptance criteria
- Violation: stop work, return to spec phase

### 1.2 Monorepo Structure (Immutable - Extended for Phase 3)

```
hackathon-todo-phase3/
├── .spec-kit/
│   └── config.yaml          # Phase definitions: phase3-ai-chatbot
├── .claude/
│   ├── skills/              # Phase 3 specialized skills
│   │   ├── chatkit-ui-setup/
│   │   ├── agents-sdk-integration/
│   │   ├── mcp-tool-definition/
│   │   ├── urdu-nlp-translator/
│   │   ├── voice-input-handler/
│   │   ├── multi-agent-orchestration/
│   │   └── cloud-blueprint-creator/
│   └── agents/              # Phase 3 specialized agents
│       ├── chatbot-integrator.md
│       ├── mcp-tool-engineer.md
│       └── cloud-blueprint-architect.md
├── specs/
│   ├── overview.md          # Project scope & phases (updated for Phase 3)
│   ├── architecture.md      # System architecture (AI chatbot integration)
│   ├── features/
│   │   ├── basic-level/     # CRUD features specs (from Phase 2)
│   │   ├── auth/            # Authentication specs (from Phase 2)
│   │   ├── ai-chatbot/      # NEW: Chatbot feature specs
│   │   ├── nlp-intents/     # NEW: Natural language parsing specs
│   │   └── bonus/           # NEW: Phase 3 bonus features
│   ├── api/                 # API endpoint specs (MCP tools)
│   ├── database/            # Database schema specs (unchanged)
│   ├── ui/                  # UI/UX component specs (ChatKit integration)
│   └── ai/                  # NEW: AI/Agent specs
│       ├── agents/          # Agent definitions
│       ├── tools/           # MCP tool definitions
│       └── prompts/         # System prompts
├── frontend/                # Next.js 16+ (Phase 2 foundations)
│   ├── app/
│   │   ├── dashboard/       # Dashboard with ChatKit widget
│   │   └── api/             # API routes for chat
│   ├── components/
│   │   ├── chat/            # ChatKit components
│   │   ├── voice/           # Voice input components
│   │   └── ui/              # Shadcn UI components
│   ├── lib/
│   │   ├── api-client.ts    # JWT API client (Phase 2)
│   │   └── agents.ts        # NEW: Agents SDK integration
│   └── package.json
├── backend/                 # FastAPI (Phase 2 foundations)
│   ├── app/
│   │   ├── api/             # FastAPI routes (Phase 2 + MCP endpoints)
│   │   ├── models/          # SQLModel models (unchanged)
│   │   ├── core/            # Config, security, deps (JWT from Phase 2)
│   │   ├── agents/          # NEW: Agent logic
│   │   ├── mcp/             # NEW: MCP tool definitions
│   │   └── db/              # Database connection (unchanged)
│   └── pyproject.toml
├── CLAUDE.md                # This constitution (root)
└── README.md                # Project overview
```

**Referencing Syntax:**
- Use `@specs/overview.md` notation in all documentation
- Use `@specs/features/ai-chatbot/` for AI feature references
- Use `@specs/ai/agents/` for agent definitions
- Link specs to implementation: "Implements @specs/api/mcp-tools.md"

### 1.3 Core Features (Non-Negotiable - Phase 3)

**Phase 2 Foundations (Preserved):**
All 5 Basic Level Features MUST remain functional:
1. **Add Task** – Create new tasks with title, description, priority
2. **Delete Task** – Remove tasks by ID
3. **Update Task** – Edit task fields (title, description, priority)
4. **View Task List** – Display all user's tasks (table/card view)
5. **Mark as Complete** – Toggle task completion status

**Phase 3 AI Chatbot Requirements:**
6. **Natural Language Todo Management** – Handle all 5 CRUD features via conversational UI
   - Example: "Add a task to review the PR by Friday"
   - Example: "Mark my meeting task as complete"
   - Example: "Reschedule my morning meetings to 2 PM"
   - Example: "Show me all my high priority tasks"
   - Example: "Delete the task about buying groceries"

**Multi-User Requirement (Critical - Preserved from Phase 2):**
- **EVERY** task MUST belong to exactly one user
- **ALL** operations MUST be scoped to authenticated user
- **NO** user can access another user's tasks
- User isolation enforced at database, API, and UI layers
- **NEW**: Chatbot must also enforce user isolation via JWT

### 1.4 Phase 3 Bonus Goals

**Maximum Bonus Points (+700 potential):**

1. **Reusable Intelligence (+200)** - Use subagents/skills
   - `chatbot-integrator` - Integrate ChatKit into dashboard
   - `mcp-tool-engineer` - Define MCP tools for Todo CRUD
   - `urdu-language-support` - Full Urdu language support
   - `voice-command-specialist` - Voice input for commands
   - `nlp-intent-parser` - Parse natural language intents
   - `multi-agent-orchestration` - Coordinate specialized agents

2. **Cloud-Native Blueprints (+200)** - Create deployment blueprints
   - MCP tool deployment specs
   - Agent orchestration blueprints
   - Spec-driven governance for AI services
   - Kubernetes/CI/CD manifests

3. **Multi-language Support (+100)** - Urdu language
   - Urdu input/output in chatbot
   - NLP parsing for Urdu commands
   - RTL text rendering
   - Language detection

4. **Voice Commands (+200)** - Voice input
   - Web Speech API integration
   - Speech-to-text conversion
   - Voice command parsing
   - Microphone UI in ChatKit

---

## 2. Security & Authentication (Preserved + Extended)

### 2.1 Authentication Architecture (Phase 2 Foundations - Unchanged)

**Frontend: Next.js + Better Auth**
```
Flow:
1. User signs up/in via Better Auth (frontend)
2. Better Auth JWT plugin issues JWT token
3. Token stored in secure HTTP-only cookie or localStorage
4. Frontend attaches token to all backend API calls:
   Authorization: Bearer <token>
```

**Backend: FastAPI + JWT Verification**
```
Flow:
1. Middleware intercepts all /api/ requests
2. Extracts Authorization header
3. Verifies JWT signature using PyJWT
4. Extracts user_id from JWT payload
5. Enforces: user_id in URL path === user_id in JWT
6. Passes user_id to route handlers
```

### 2.2 Shared Secret Configuration (Updated for Phase 3)

**Environment Variables (Required):**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=postgresql://...  # Neon DB (unchanged)
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5  # SAME as frontend
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# NEW Phase 3 Variables
COHERE_API_KEY=6Tcf034qmm5ADPq8SAis8ZtD1Zsyq3fwYo86uUxE  # Cohere LLM
```

**Secret Requirements:**
- BETTER_AUTH_SECRET: Minimum 32 characters (Phase 2 secret)
- **IDENTICAL** across frontend and backend
- COHERE_API_KEY: Cohere API key for LLM/tool calling
- Never commit to git (use .env.example)
- Rotate in production (document in runbook)

### 2.3 Authorization Enforcement (Extended for MCP Tools)

**API Endpoint Structure (Preserved):**
```
Phase 2 Endpoints (unchanged):
✅ GET  /api/{user_id}/tasks           # List tasks for user 123
✅ POST /api/{user_id}/tasks           # Create task for user 123
✅ PUT  /api/{user_id}/tasks/{id}      # Update task 456
✅ DELETE /api/{user_id}/tasks/{id}    # Delete task 456

Phase 3 MCP Endpoints (NEW):
✅ POST /api/mcp/tools/add_task        # MCP tool: add task
✅ POST /api/mcp/tools/list_tasks      # MCP tool: list tasks
✅ POST /api/mcp/tools/update_task     # MCP tool: update task
✅ POST /api/mcp/tools/complete_task   # MCP tool: complete task
✅ POST /api/mcp/tools/delete_task     # MCP tool: delete task
✅ POST /api/agent/chat                # Agent chat endpoint
```

**Middleware Logic (Pseudocode - Unchanged):**
```python
def verify_jwt_middleware(request):
    # 1. Extract token from Authorization header
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    # 2. Verify token signature and expiry
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        jwt_user_id = payload.get("user_id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 3. Extract user_id from URL path (Phase 2 endpoints)
    path_user_id = request.path_params.get("user_id")

    # 4. For Phase 2 endpoints, enforce match
    if path_user_id and jwt_user_id != path_user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    # 5. Pass to handler (for both Phase 2 and Phase 3)
    request.state.user_id = jwt_user_id
```

**MCP Tool Authorization (NEW):**
```python
# All MCP tools must verify JWT and enforce user isolation
@mcp.tool()
async def add_task(title: str, priority: str = "medium") -> dict:
    """
    Add a new task for the authenticated user.

    Security: Uses user_id from JWT context (enforced by middleware)
    """
    # Get user_id from request state (set by JWT middleware)
    user_id = request.state.user_id

    # Create task with user_id
    task = Task(user_id=user_id, title=title, priority=priority)
    session.add(task)
    await session.commit()

    return {"id": task.id, "title": task.title, "priority": task.priority}
```

### 2.4 User Isolation (Database Layer - Unchanged)

**All Database Queries MUST Include user_id Filter:**
```python
# ✅ CORRECT
async def get_tasks(user_id: int, session: Session):
    return await session.exec(
        select(Task).where(Task.user_id == user_id)
    )

# ❌ WRONG – returns all users' tasks
async def get_tasks(session: Session):
    return await session.exec(select(Task))
```

---

## 3. Architecture Principles (Extended for Phase 3)

### 3.1 Technology Stack (Immutable + Phase 3 Additions)

**Frontend (Preserved + Extended):**
- **Framework:** Next.js 16+ (App Router, not Pages Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (v4+)
- **Components:** Shadcn/UI (Radix UI + Tailwind)
- **State:** React Server Components + Client State
- **Auth:** Better Auth (with JWT plugin) [Phase 2]
- **API Client:** Native fetch with JWT wrapper [Phase 2]
- **NEW:** OpenAI ChatKit for conversational UI
- **NEW:** Web Speech API for voice input
- **NEW:** Agents SDK client integration

**Backend (Preserved + Extended):**
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLModel (built on Pydantic + SQLAlchemy)
- **Database:** Neon Serverless PostgreSQL [unchanged]
- **Auth:** PyJWT for verification [Phase 2]
- **Validation:** Pydantic v2
- **NEW:** Cohere API for LLM (COHERE_API_KEY)
- **NEW:** OpenAI Agents SDK patterns (with Cohere)
- **NEW:** Official MCP SDK for tool definitions

**AI/Agent Layer (NEW - Phase 3):**
- **LLM Provider:** Cohere API (tool calling compatible)
- **Agent Framework:** OpenAI Agents SDK patterns
- **Tool Protocol:** Model Context Protocol (MCP)
- **NLP:** Intent parsing + entity extraction
- **Chat UI:** OpenAI ChatKit integration
- **Voice:** Web Speech API (SpeechRecognition)

**DevOps:**
- **Frontend Deployment:** Vercel (auto-deploy from main branch)
- **Backend Deployment:** Railway or Fly.io (optional for bonus)
- **Database:** Neon (serverless, free tier)
- **Repository:** GitHub (public, monorepo)
- **NEW:** Cloud-native blueprints for MCP tools/agents

### 3.2 AI Chatbot Architecture

**Component Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Next.js Dashboard                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Task List    │  │ ChatKit      │  │ Voice Input  │     │
│  │ (Phase 2)    │  │ Widget       │  │ (Optional)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │ Chat API Route  │                       │
│                   │ (/api/chat)     │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JWT + User Message
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: FastAPI + Agents SDK                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Agent Orchestration Layer                            │  │
│  │ ┌────────────┐  ┌────────────┐  ┌────────────┐      │  │
│  │ │ NLP Intent │  │ Todo CRUD  │  │ Urdu       │      │  │
│  │ │ Parser     │  │ Agent      │  │ Translator │      │  │
│  │ └────────────┘  └────────────┘  └────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MCP Tool Layer (Official MCP SDK)                    │  │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │
│  │ │ Add  │ │List  │ │Update│ │Comp. │ │Delete│       │  │
│  │ │Task  │ │Tasks │ │Task  │ │Task  │ │Task  │       │  │
│  │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Database Layer (Neon PostgreSQL - Phase 2)           │  │
│  │ ┌─────────────────────────────────────────────────┐  │  │
│  │ │ Task (id, user_id, title, description, ...)     │  │  │
│  │ └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow Example:**
```
User Input: "Add a task to review the PR by Friday"
     │
     ▼
1. Frontend: Send to /api/chat with JWT token
     │
     ▼
2. Backend: Verify JWT, extract user_id
     │
     ▼
3. NLP Intent Parser: Parse intent + entities
   - Intent: add_task
   - Entities: {title: "review the PR", due_date: "Friday"}
     │
     ▼
4. Agent: Call MCP tool (add_task) with user_id context
     │
     ▼
5. MCP Tool: Execute database operation (scoped to user_id)
     │
     ▼
6. Database: INSERT task with user_id
     │
     ▼
7. Response: "Task added successfully: 'review the PR'"
```

### 3.3 MCP Tool Definitions

**Official MCP SDK Usage:**
```python
# backend/app/mcp/tools/todo_tools.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="hackathon-todo-server")

@mcp.tool()
async def add_task(
    title: str,
    description: str = "",
    priority: str = "medium"
) -> dict:
    """
    Add a new task for the authenticated user.

    Args:
        title: Task title (required)
        description: Task description (optional)
        priority: Task priority (low/medium/high, default: medium)

    Returns:
        Created task object with id, title, priority, etc.
    """
    # Get user_id from JWT context (set by middleware)
    user_id = get_current_user_id()

    # Create task with user_id
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        priority=priority
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "completed": task.completed
    }

# Register all 5 tools
@mcp.tool()
async def list_tasks() -> list[dict]:
    """List all tasks for the authenticated user."""
    user_id = get_current_user_id()
    tasks = await session.exec(
        select(Task).where(Task.user_id == user_id)
    )
    return [task.dict() for task in tasks]

@mcp.tool()
async def update_task(task_id: int, **updates) -> dict:
    """Update a task (user must own the task)."""
    user_id = get_current_user_id()
    task = await get_task_owned_by_user(task_id, user_id)
    for key, value in updates.items():
        setattr(task, key, value)
    await session.commit()
    return task.dict()

@mcp.tool()
async def complete_task(task_id: int) -> dict:
    """Mark a task as complete."""
    return await update_task(task_id, completed=True)

@mcp.tool()
async def delete_task(task_id: int) -> dict:
    """Delete a task."""
    user_id = get_current_user_id()
    task = await get_task_owned_by_user(task_id, user_id)
    await session.delete(task)
    await session.commit()
    return {"deleted": True, "id": task_id}
```

### 3.4 Agent Orchestration Patterns

**Coordinator-Specialist Pattern:**
```python
# backend/app/agents/orchestrator.py
class TodoAgentOrchestrator:
    """
    Coordinates multiple specialist agents for Todo management.
    """

    def __init__(self, cohere_client):
        self.cohere = cohere_client
        self.nlp_parser = NLPIntentParser(cohere_client)
        self.todo_crud_agent = TodoCRUDAgent(mcp_tools)

    async def process_message(self, user_message: str, user_id: int) -> str:
        """
        Process user message through agent pipeline.
        """
        # Step 1: Parse intent and entities
        intent_result = await self.nlp_parser.parse(user_message)

        # Step 2: Route to appropriate specialist
        if intent_result["intent"] == "add_task":
            response = await self.todo_crud_agent.add_task(
                title=intent_result["entities"]["title"],
                priority=intent_result["entities"].get("priority", "medium"),
                user_id=user_id
            )
        elif intent_result["intent"] == "list_tasks":
            response = await self.todo_crud_agent.list_tasks(user_id=user_id)
        # ... handle all 5 intents

        # Step 3: Generate natural language response
        return await self.generate_response(response)

    async def generate_response(self, tool_result: dict) -> str:
        """Generate natural language response from tool result."""
        prompt = f"Tool result: {tool_result}\nGenerate friendly response."
        response = await self.cohere.generate(prompt)
        return response.text
```

---

## 4. UI/UX Guidelines (Extended for Chatbot)

### 4.1 Design Theme: Cyberpunk/Dark/Neon (Preserved from Phase 2)

**Color Palette:**
```css
/* Base Colors */
--background: #0a0a0a;        /* Deep black */
--foreground: #ededed;        /* Off-white text */

/* Neon Accents */
--neon-blue: #00d4ff;         /* Primary actions, links */
--neon-pink: #ff00ff;         /* High priority, danger */
--neon-green: #00ff88;        /* Success, complete */
--neon-yellow: #ffcc00;       /* Medium priority, warnings */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
```

### 4.2 Dashboard Layout (Updated for Phase 3)

**Dashboard with ChatKit Widget:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Search | User Menu | Theme Toggle       │
├─────────────────────────────────────────────────────────┤
│ Sidebar (Nav) │ Main Content Area                      │
│               │                                         │
│ - Dashboard   │ ┌─────────────────────────────────────┐│
│ - Tasks       │ │ Task List (Phase 2)                 ││
│ - Chat        │ │ ┌─────┬──────────┬──────┬──────────┐││
│ - Settings    │ │ │Done │ Title    │Pri  │ Actions  │││
│               │ │ ├─────┼──────────┼──────┼──────────┤││
│               │ │ │☑   │ Build... │High │ Edit/Del │││
│               │ │ │☐   │ Test API │Med  │ Edit/Del │││
│               │ │ └─────┴──────────┴──────┴──────────┘││
│               │ └─────────────────────────────────────┘│
│               │                                         │
│               │ ┌─────────────────────────────────────┐│
│               │ │ ChatKit Widget (Phase 3)            ││
│               │ │ ┌─────────────────────────────────┐ ││
│               │ │ │ AI: How can I help?             │ ││
│               │ │ ├─────────────────────────────────┤ ││
│               │ │ │ User: Add task for PR review    │ ││
│               │ │ │ AI: Task added! Want more?      │ ││
│               │ │ ├─────────────────────────────────┤ ││
│               │ │ │ [Type message...]        [🎤]  │ ││
│               │ │ └─────────────────────────────────┘ ││
│               │ └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**ChatKit Widget Requirements:**
- **Position:** Floating widget or dedicated panel in dashboard
- **Style:** Cyberpunk theme (glassmorphism, neon accents)
- **Features:**
  - Message history (stored in localStorage or backend)
  - Typing indicators
  - Voice input button (🎤) - optional bonus
  - Auto-scroll to latest message
  - Markdown rendering for responses
  - Error handling with user-friendly messages

### 4.3 Component Patterns (Extended)

**ChatKit Integration:**
```tsx
// frontend/components/chat/ChatWidget.tsx
import { ChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/lib/auth';

export function ChatWidget() {
  const { token, user } = useAuth();

  const handleSendMessage = async (message: string) => {
    // Send to backend API with JWT
    const response = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data.response;
  };

  return (
    <ChatKit
      apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
      onSendMessage={handleSendMessage}
      theme="cyberpunk"
      placeholder="Ask AI to manage your tasks..."
      voiceInputEnabled={true}  // Optional bonus
    />
  );
}
```

**Voice Input Component (Bonus):**
```tsx
// frontend/components/voice/VoiceInput.tsx
import { useSpeechRecognition } from '@/lib/speech';

export function VoiceInput({ onTranscript }) {
  const { isListening, transcript, start, stop } = useSpeechRecognition();

  const handleToggle = () => {
    if (isListening) {
      stop();
      onTranscript(transcript);
    } else {
      start();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "neon-button",
        isListening && "animate-pulse"
      )}
    >
      {isListening ? "🎤 Listening..." : "🎤 Voice"}
    </button>
  );
}
```

---

## 5. Development Workflow (Updated for Phase 3)

### 5.1 Feature Development Lifecycle

**Step 1: Specification (Mandatory)**
```
1. Create spec: /specs/features/ai-chatbot/spec.md
2. Include sections:
   - Overview & goals (AI chatbot for Todo management)
   - User stories (conversational CRUD operations)
   - Acceptance criteria (checkboxes)
   - Agent definitions (NLP parser, Todo CRUD agent)
   - MCP tool definitions (5 Todo tools)
   - API endpoints (/api/agent/chat, /api/mcp/tools/*)
   - UI components (ChatKit integration)
   - Edge cases & error handling
3. Review & refine spec until approved
```

**Step 2: Implementation (Automated with Subagents)**
```bash
# After spec is perfect
/sp.implement @specs/features/ai-chatbot/spec.md

# Claude Code orchestrates:
# - chatbot-integrator agent (ChatKit UI)
# - mcp-tool-engineer agent (MCP tool definitions)
# - agents-sdk-specialist (Agent logic)
# - Integration-and-Tester-Agent (E2E testing)
```

**Step 3: Testing (Manual + Automated)**
```bash
# Frontend
cd frontend && npm run test
cd frontend && npm run lint

# Backend
cd backend && pytest
cd backend && ruff check

# E2E (critical for chatbot)
npm run test:e2e
```

**Step 4: Integration Testing**
```bash
# Test chatbot with Integration-and-Tester-Agent
# Test all 5 CRUD operations via natural language
# Test user isolation (2 users, verify no data leak)
# Test error handling (invalid inputs, edge cases)
```

### 5.2 Git Workflow (Preserved)

**Branch Strategy:**
```
main (protected)
  ├── feature/ai-chatbot          # Core chatbot feature
  ├── feature/mcp-tools           # MCP tool definitions
  ├── feature/nlp-intents         # NLP intent parsing
  ├── feature/urdu-support        # Urdu language (bonus)
  ├── feature/voice-input         # Voice commands (bonus)
  └── feature/agent-orchestration # Multi-agent coordination
```

**Commit Message Format:**
```
feat(scope): description

Examples:
feat(chatbot): integrate OpenAI ChatKit into dashboard
feat(agents): implement NLP intent parser with Cohere
feat(mcp): define MCP tools for Todo CRUD operations
feat(urdu): add Urdu language support for chatbot
fix(auth): ensure JWT verification on agent endpoints
docs(specs): add AI chatbot feature spec
```

---

## 6. Phase 3 Bonus Strategy (Max +700 Points)

### 6.1 Reusable Intelligence (+200) - Use Subagents/Skills

**Available Phase 3 Agents:**
- `chatbot-integrator` – Integrate ChatKit into Next.js dashboard
- `mcp-tool-engineer` – Define MCP tools with Official MCP SDK
- `agents-sdk-specialist` – Implement agent logic with Cohere
- `urdu-language-support` – Add Urdu language support
- `voice-command-specialist` – Implement voice input
- `nlp-intent-parser` – Parse natural language intents
- `multi-agent-orchestration` – Coordinate specialist agents
- `cloud-blueprint-architect` – Create deployment blueprints

**Available Phase 3 Skills:**
- `chatkit-ui-setup` – ChatKit integration guide
- `agents-sdk-integration` – Agents SDK setup with Cohere
- `mcp-tool-definition` – MCP tool definition patterns
- `urdu-nlp-translator` – Urdu translation and RTL support
- `voice-input-handler` – Web Speech API integration
- `multi-agent-orchestration` – Agent coordination patterns
- `cloud-blueprint-creator` – Blueprint creation for deployment

**Usage Pattern:**
```bash
# Write spec
/sp.specify "Implement AI chatbot with natural language Todo management"
→ Calls Spec-Writer-Pro

# Implement feature
/sp.implement @specs/features/ai-chatbot/spec.md
→ Orchestrator calls:
   - chatbot-integrator (ChatKit UI)
   - mcp-tool-engineer (MCP tools)
   - agents-sdk-specialist (Agent logic)
   - Integration-and-Tester-Agent (E2E testing)
```

### 6.2 Cloud-Native Blueprints (+200)

**Blueprint Requirements:**
- Create deployment specs for MCP tools/agents
- Use Spec-Kit Plus blueprint patterns
- Include Kubernetes manifests, CI/CD, observability
- Implement spec-driven governance

**Blueprint Structure:**
```
blueprints/
├── mcp-todo-server/
│   ├── blueprint.md
│   ├── manifests/ (Kubernetes)
│   ├── terraform/ (Infrastructure)
│   └── ci-cd/ (GitHub Actions)
└── multi-agent-orchestration/
    ├── blueprint.md
    ├── manifests/
    └── monitoring/
```

**Usage:**
```bash
# Create blueprint
/sp.specify "Create cloud-native blueprint for MCP Todo server deployment"
→ Uses cloud-blueprint-architect agent

# Implement blueprint
/sp.implement @specs/blueprints/mcp-todo-server/blueprint.md
→ Generates Kubernetes manifests, CI/CD, monitoring
```

### 6.3 Multi-language Support (+100) - Urdu

**Requirements:**
- Urdu input/output in chatbot
- NLP parsing for Urdu commands
- RTL text rendering
- Language detection

**Urdu Examples:**
```
User: "مجھے کام شامل کریں"
AI: "کس کام کو شامل کریں؟"

User: "میرے تمام کام دکھائیں"
AI: "یہ رہے آپ کے کام:"
```

### 6.4 Voice Commands (+200)

**Requirements:**
- Web Speech API integration
- Speech-to-text conversion
- Voice command parsing
- Microphone UI in ChatKit

**Usage:**
```bash
# Implement voice input
/sp.implement @specs/features/voice-input/spec.md
→ Uses voice-command-specialist agent
```

---

## 7. Deliverables & Submission (Updated for Phase 3)

### 7.1 Required Deliverables

**1. GitHub Repository (Public)**
- URL: `https://github.com/<username>/hackathon-todo-phase3`
- Monorepo structure: `frontend/`, `backend/`, `specs/`, `.claude/`
- README: setup instructions, demo link, tech stack (Phase 2 + Phase 3)
- License: MIT or Apache-2.0

**2. Vercel Deployment (Frontend)**
- URL: `https://hackathon-todo-phase3.vercel.app`
- Environment variables configured
- ChatKit widget visible and functional

**3. Demo Video (<120 seconds)**
- Show Phase 2 features (signup/login, CRUD operations)
- Show Phase 3 AI chatbot (natural language Todo management)
- Show multi-user isolation (2 different users)
- Show UI theme (cyberpunk/neon)
- Show bonus features (Urdu, voice, etc.)
- Host on YouTube or Loom

**4. Documentation (in README)**
```markdown
# Hackathon Todo Phase 3: AI-Powered Todo Chatbot

## Live Demo: https://hackathon-todo-phase3.vercel.app

## Tech Stack
- Frontend: Next.js 16, TypeScript, Tailwind CSS, Shadcn/UI, OpenAI ChatKit
- Backend: FastAPI, SQLModel, Neon PostgreSQL
- Auth: Better Auth + JWT
- AI: Cohere API, OpenAI Agents SDK, MCP

## Features
### Phase 2 (Foundations)
- ✅ User authentication (signup/login)
- ✅ Create, read, update, delete tasks
- ✅ Multi-user data isolation
- ✅ Priority system (low/medium/high)
- ✅ Cyberpunk theme
- ✅ Responsive design

### Phase 3 (AI Chatbot)
- ✅ Natural language Todo management
- ✅ OpenAI ChatKit integration
- ✅ MCP tools for Todo CRUD
- ✅ Agent orchestration
- ✅ NLP intent parsing

### Bonus Features
- ✅ Urdu language support
- ✅ Voice input commands
- ✅ Cloud-native blueprints
- ✅ Multi-agent coordination

## Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install
uvicorn app.main:app --reload

# Set environment variables
# See .env.example for required variables
```

## Demo Video
[Watch 120s Demo](https://youtube.com/...)
```

### 7.2 Submission Checklist (Extended)

**Code Quality:**
- [ ] All code follows spec (no manual edits)
- [ ] No hardcoded secrets (use .env)
- [ ] Linting passes (ESLint, Ruff)
- [ ] Tests pass (pytest, npm test)
- [ ] Git history clean (meaningful commits)

**Security (Phase 2 + Phase 3):**
- [ ] JWT verification on all API endpoints
- [ ] User ID enforcement (path === token)
- [ ] Database queries filtered by user_id
- [ ] MCP tools enforce user isolation
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

**Functionality (Phase 2 Preserved):**
- [ ] Signup works (creates user)
- [ ] Login works (issues JWT)
- [ ] All 5 CRUD operations work (UI)
- [ ] User isolation verified (test with 2 users)
- [ ] UI responsive on mobile/tablet/desktop

**Functionality (Phase 3 AI):**
- [ ] Chatbot UI renders (ChatKit widget)
- [ ] Natural language processing works (5 intents)
- [ ] MCP tools execute (scoped to user_id)
- [ ] Agent responses are natural and helpful
- [ ] Error handling is user-friendly

**Bonus Features (if implemented):**
- [ ] Urdu language support (input/output/parsing)
- [ ] Voice input (Web Speech API)
- [ ] Cloud-native blueprints (Kubernetes manifests)
- [ ] Multi-agent orchestration

**Documentation:**
- [ ] README complete (setup, demo, tech stack)
- [ ] Specs exist in /specs/ folder
- [ ] API documented (OpenAPI/Swagger)
- [ ] Demo video linked (<120s)

---

## 8. Principles & Values (Extended for Phase 3)

### 8.1 Development Philosophy

1. **Spec First, Code Later** – Specs are the source of truth
2. **Small, Testable Changes** – One feature per PR
3. **User Isolation is Sacred** – Never leak data between users
4. **Security is Not Optional** – JWT verification is mandatory
5. **Beauty Matters** – Cyberpunk theme is part of the spec
6. **AI Must Be Helpful** – Chatbot must understand and execute correctly
7. **Reusability Wins** – Use subagents/skills for bonus points

### 8.2 Quality Standards (Extended)

**Code Quality:**
- PEP 8 compliance (backend Python)
- ESLint/Prettier (frontend TypeScript)
- Type safety: strict mode everywhere
- No `any` types without justification
- Meaningful variable/function names

**Testing Standards:**
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- AI response quality testing
- Minimum 80% code coverage (target 90%)

**Performance Standards:**
- p95 latency: <200ms for API calls
- AI response time: <3s for chatbot
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse score: >90

### 8.3 AI-Specific Quality Standards

**Chatbot Requirements:**
- Must handle all 5 CRUD operations via natural language
- Must maintain context in conversation
- Must provide helpful error messages
- Must enforce user isolation (via JWT)
- Must handle edge cases gracefully

**MCP Tool Requirements:**
- All tools must use Official MCP SDK
- All tools must enforce user_id scoping
- All tools must have proper error handling
- All tools must be documented with clear schemas

**Agent Requirements:**
- Agents must use Cohere API (COHERE_API_KEY)
- Agents must follow OpenAI Agents SDK patterns
- Agents must be testable and observable
- Agents must handle failures gracefully

---

## 9. Enforcement & Accountability (Extended)

### 9.1 Constitution Violations

**Level 1: Warning (Self-Correction)**
- Writing implementation code without spec
- Bypassing JWT verification
- Hardcoding secrets
- Implementing AI features without specs
- **Action:** Stop work, return to spec phase

**Level 2: Critical (Reset)**
- Missing user_id filtering (data leak)
- Broken authentication flow
- Non-functional CRUD operations
- Chatbot bypassing user isolation
- MCP tools not enforcing JWT
- **Action:** Discard changes, restart from spec

**Level 3: Fatal (Disqualification)**
- Plagiarism (code not original)
- Missing multi-user isolation
- Not following monorepo structure
- Chatbot exposing other users' data
- **Action:** Project fails Hackathon II requirements

### 9.2 Validation Checks (Extended)

**Pre-Implementation:**
- [ ] Spec exists in `/specs/features/<name>/spec.md`
- [ ] Spec has all required sections
- [ ] Spec has acceptance criteria (checkboxes)
- [ ] Spec is approved (reviewed)
- [ ] Agent/skill assignments defined

**Post-Implementation:**
- [ ] All acceptance criteria pass
- [ ] Tests pass (unit, integration, E2E)
- [ ] Security verified (JWT, user isolation)
- [ ] UI matches spec (screenshots/videos)
- [ ] AI responses tested (quality and accuracy)

**Pre-Submission:**
- [ ] All deliverables complete (repo, demo, video)
- [ ] Documentation updated (README, specs)
- [ ] Live demo deployed (Vercel)
- [ ] Peer review completed
- [ ] Bonus features documented

---

## 10. Amendments & Version History

**Version 2.0 (2026-02-09) - Phase 3 Update**
- Added AI chatbot architecture
- Added Cohere API integration
- Added MCP tool definitions
- Added OpenAI Agents SDK patterns
- Added ChatKit UI integration
- Added bonus features (Urdu, voice, blueprints)
- Added Phase 3 subagents/skills
- Preserved all Phase 2 foundations

**Version 1.0 (2025-02-08) - Phase II Foundation**
- Initial constitution for Phase II
- Spec-driven development mandate
- Security & authentication rules
- Monorepo structure definition
- UI/UX guidelines (cyberpunk theme)

**Amendment Process:**
1. Propose change via issue/discussion
2. Document rationale (why change needed)
3. Update constitution with new version
4. Communicate to all developers
5. Archive old version

---

## Conclusion

This constitution is the **supreme law** for all Phase 3 implementation work of the Hackathon II AI-Powered Todo Chatbot.

**Any development work that violates this constitution must be stopped and corrected.**

**When in doubt:**
1. Return to the spec
2. Follow the workflow
3. Enforce security
4. Deliver quality
5. Test AI features thoroughly

**Success Metrics:**
- ✅ All code is spec-driven
- ✅ All users are isolated (Phase 2 + Phase 3)
- ✅ All endpoints are JWT-protected
- ✅ All 5 CRUD features work (UI + AI)
- ✅ Chatbot handles natural language correctly
- ✅ MCP tools enforce user isolation
- ✅ UI is beautiful (cyberpunk theme)
- ✅ Demo video is <120s and impressive
- ✅ Bonus features implemented (if applicable)

**Remember:** Specs are the source of truth. This constitution enforces that principle. Phase 3 builds upon Phase 2 foundations – do not break what works.

---

**End of Constitution – Hackathon II Phase 3: AI-Powered Todo Chatbot**

**Last Updated:** 2026-02-09
**Status:** Active
**Version:** 2.0

---

This constitution is supreme law for all Phase 3 implementation.
