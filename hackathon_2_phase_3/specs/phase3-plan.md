# Phase 3 Implementation Plan – AI-Powered Todo Chatbot

**Status:** Active | **Version:** 1.0 | **Last Updated:** 2026-02-09

---

## Executive Summary

This document provides the complete technical implementation plan for Phase 3 of the Hackathon II Todo application. It builds upon Phase 2 foundations (FastAPI backend, Next.js frontend, Better Auth/JWT authentication, Neon PostgreSQL) to add an AI-powered chatbot that enables natural language Todo management.

**Core Innovation:** Users can now manage all 5 CRUD operations (Add, List, Update, Complete, Delete) through conversational interface powered by Cohere LLM and MCP tools.

**Bonus Opportunities:** Up to +700 points available through reusable intelligence (subagents/skills), cloud-native blueprints, Urdu language support, and voice commands.

---

## 1. Architecture Overview

### 1.1 Monorepo Structure

```
hackathon-todo-phase3/
├── .spec-kit/
│   └── config.yaml                 # Phase definitions: phase3-ai-chatbot
├── .claude/
│   ├── skills/                     # Reusable Phase 3 skills
│   │   ├── chatkit-ui-setup/       # ChatKit integration patterns
│   │   ├── agents-sdk-integration/ # Agents SDK + Cohere setup
│   │   ├── mcp-tool-definition/    # MCP tool patterns
│   │   ├── urdu-nlp-translator/    # Urdu language support
│   │   ├── voice-input-handler/    # Web Speech API
│   │   ├── multi-agent-orchestration/ # Agent coordination
│   │   └── cloud-blueprint-creator/   # K8s deployment specs
│   └── agents/                     # Phase 3 specialized agents
│       ├── chatbot-integrator.md
│       ├── mcp-tool-engineer.md
│       └── cloud-blueprint-architect.md
├── specs/
│   ├── overview.md                 # Project scope & phases
│   ├── architecture.md             # System architecture (updated)
│   ├── phase3-plan.md              # THIS DOCUMENT
│   ├── features/
│   │   ├── basic-level/            # CRUD features (Phase 2)
│   │   ├── auth/                   # Authentication (Phase 2)
│   │   ├── ai-chatbot/             # NEW: Chatbot feature specs
│   │   └── bonus/                  # NEW: Bonus feature specs
│   ├── api/
│   │   ├── rest-endpoints.md       # Phase 2 REST API
│   │   └── mcp-tools.md            # NEW: MCP tool definitions
│   ├── database/
│   │   └── schema.md               # Task/User models (Phase 2, unchanged)
│   ├── ui/
│   │   ├── components.md           # Shadcn/UI (Phase 2)
│   │   ├── theme.md                # Cyberpunk theme (Phase 2)
│   │   └── chatbot-widget.md       # NEW: ChatKit UI specs
│   └── ai/
│       ├── agents/                 # Agent orchestration patterns
│       ├── tools/                  # MCP tool implementations
│       └── prompts/                # System prompts
├── frontend/                       # Next.js 16+ (Phase 2 + Phase 3)
│   ├── app/
│   │   ├── dashboard/              # Dashboard with ChatKit widget
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   └── layout.tsx          # Dashboard layout
│   │   └── api/
│   │       └── chat/               # Chat API route (optional proxy)
│   ├── components/
│   │   ├── chat/                   # NEW: ChatKit components
│   │   │   ├── chat-widget.tsx     # Main floating widget
│   │   │   ├── chat-toggle.tsx     # Floating button
│   │   │   ├── chat-header.tsx     # Widget header
│   │   │   ├── chat-messages.tsx   # Message list
│   │   │   ├── chat-message.tsx    # Individual message
│   │   │   ├── chat-input-area.tsx # Input + buttons
│   │   │   ├── typing-indicator.tsx # Typing animation
│   │   │   ├── tool-call-indicator.tsx # Tool execution display
│   │   │   └── chat-sidebar.tsx    # Full sidebar view (alt)
│   │   ├── voice/                  # NEW: Voice components (bonus)
│   │   │   ├── voice-input-button.tsx
│   │   │   └── voice-waveform.tsx
│   │   ├── ui/                     # Shadcn/UI (Phase 2)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── input.tsx
│   │   └── tasks/                  # Task components (Phase 2)
│   │       ├── task-list.tsx
│   │       └── task-table.tsx
│   ├── lib/
│   │   ├── api-client.ts           # JWT API client (Phase 2)
│   │   ├── agents.ts               # NEW: Agents SDK client
│   │   └── hooks/
│   │       ├── use-chat.ts          # NEW: Chat state management
│   │       ├── use-speech-recognition.ts # NEW: Voice hook
│   │       └── use-message-history.ts    # Message persistence
│   └── package.json
├── backend/                        # FastAPI (Phase 2 + Phase 3)
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py             # JWT verification (Phase 2)
│   │   │   ├── routes/
│   │   │   │   ├── tasks.py        # Phase 2 REST endpoints
│   │   │   │   ├── auth.py         # Phase 2 auth endpoints
│   │   │   │   ├── agent.py        # NEW: Agent chat endpoint
│   │   │   │   └── mcp.py          # NEW: MCP tool endpoints
│   │   ├── models/
│   │   │   ├── task.py             # Task model (Phase 2, unchanged)
│   │   │   └── user.py             # User model (Phase 2, unchanged)
│   │   ├── core/
│   │   │   ├── config.py           # Settings + env vars
│   │   │   ├── security.py         # JWT utilities (Phase 2)
│   │   │   └── cohere.py           # NEW: Cohere client wrapper
│   │   ├── db/
│   │   │   └── session.py          # Database session (Phase 2)
│   │   ├── agents/                 # NEW: Agent orchestration
│   │   │   ├── orchestrator.py     # Main coordinator
│   │   │   ├── nlp_parser.py       # Intent parsing
│   │   │   ├── tool_caller.py      # MCP tool wrapper
│   │   │   ├── response_generator.py # NLG for responses
│   │   │   └── urdu_support.py     # Urdu detection/translation (bonus)
│   │   └── mcp/                    # NEW: MCP layer
│   │       ├── server.py           # MCP server init
│   │       ├── auth.py             # JWT for MCP tools
│   │       ├── errors.py           # Error handling
│   │       └── tools/
│   │           └── todo_tools.py   # 5 MCP tool implementations
│   ├── pyproject.toml
│   └── .env                        # Environment variables
├── CLAUDE.md                       # Project instructions
├── README.md                       # Project documentation
└── .env.example                    # Environment template
```

### 1.2 Data Flow with JWT Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User Authentication (Phase 2 - Unchanged)               │
├─────────────────────────────────────────────────────────────────┤
│ 1. User signs up/logs in via Better Auth (Next.js)             │
│ 2. Better Auth JWT plugin issues JWT token                     │
│ 3. Token stored in secure HTTP-only cookie or localStorage      │
│ 4. Frontend attaches token to all API calls:                   │
│    Authorization: Bearer <jwt_token>                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Chat Input (Frontend - NEW for Phase 3)                 │
├─────────────────────────────────────────────────────────────────┤
│ 1. User opens ChatKit widget (floating or sidebar)             │
│ 2. User types/speaks: "Add a task to review the PR"            │
│ 3. Frontend captures message + JWT token                        │
│ 4. Send POST /api/agent/chat:                                  │
│    {                                                             │
│      "message": "Add a task to review the PR",                 │
│      "language": "en"                                          │
│    }                                                             │
│    Headers: Authorization: Bearer <jwt_token>                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: JWT Verification (Backend Middleware - Phase 2)         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Middleware extracts JWT from Authorization header            │
│ 2. Verify signature using BETTER_AUTH_SECRET                   │
│ 3. Extract user_id from JWT payload                             │
│ 4. Store user_id in request.state for tool execution           │
│ 5. Pass user_id to agent handler                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: NLP Intent Parsing (NEW for Phase 3)                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. Agent receives user_message + user_id                        │
│ 2. Call Cohere API for intent classification:                  │
│    Prompt: "Classify intent: {user_message}"                   │
│ 3. Extract entities:                                           │
│    - title: "review the PR"                                    │
│    - priority: "high"                                          │
│    - action: "create"                                          │
│ 4. Return ParsedIntent:                                        │
│    {                                                            │
│      "intent": "add_task",                                     │
│      "entities": {"title": "review the PR", "priority": "high"}, │
│      "confidence": 0.95                                        │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: MCP Tool Execution (NEW for Phase 3)                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. Route to appropriate MCP tool based on intent                │
│    Intent: add_task → Tool: mcp.add_task()                     │
│ 2. Execute MCP tool with user_id context:                       │
│    mcp.add_task(                                              │
│      title="review the PR",                                    │
│      priority="high",                                          │
│      # user_id injected from JWT context                       │
│    )                                                            │
│ 3. MCP tool queries database with user isolation:              │
│    INSERT INTO task (user_id, title, priority, ...)            │
│    VALUES ({user_id}, "review the PR", "high", ...)            │
│ 4. Return ToolResult:                                          │
│    {                                                            │
│      "id": "abc123",                                           │
│      "title": "review the PR",                                  │
│      "priority": "high",                                       │
│      "completed": false                                        │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Response Generation (NEW for Phase 3)                   │
├─────────────────────────────────────────────────────────────────┤
│ 1. Receive ToolResult from MCP tool                             │
│ 2. Generate natural language response via Cohere:              │
│    Prompt: "Tool result: {result}. Generate friendly response" │
│ 3. Stream response character-by-character (SSE):                │
│    data: {"type": "status", "content": "Task added!"}         │
│    data: {"type": "done", "full_response": "..."}             │
│ 4. Return: "Task added successfully: 'review the PR'"          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Display Response (Frontend - NEW for Phase 3)           │
├─────────────────────────────────────────────────────────────────┤
│ 1. ChatKit widget receives streaming response                  │
│ 2. Display assistant message with typing animation             │
│ 3. Show tool execution indicator (if tools were called)        │
│ 4. Auto-scroll to latest message                                │
│ 5. Update Task List UI (if tasks were modified)                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Component Interactions

```
┌──────────────────┐
│   Next.js App    │
│  (Frontend)      │
└────────┬─────────┘
         │ HTTP/JSON + JWT
         ▼
┌──────────────────────────────────────────────────────────────┐
│              FastAPI Backend                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Layer (/api/agent/chat, /api/mcp/tools/*)        │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ JWT Middleware (verify token, extract user_id)         │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ Agent Orchestrator                                     │ │
│  │  - NLP Intent Parser (Cohere)                          │ │
│  │  - Route to appropriate handler                        │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ MCP Tool Layer (Official MCP SDK)                      │ │
│  │  - add_task, list_tasks, update_task                  │ │
│  │  - complete_task, delete_task                          │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ Database Layer (Neon PostgreSQL)                       │ │
│  │  - Task model (id, user_id, title, priority, ...)     │ │
│  │  - All queries filter by user_id                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Key Implementation Decisions

### 2.1 UI Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Chat UI** | Custom implementation following OpenAI ChatKit patterns | Full control over cyberpunk styling, no heavy dependencies |
| **State Management** | React hooks (useState, useReducer, useCallback) | Lightweight, sufficient for chat state |
| **Streaming Protocol** | Server-Sent Events (SSE) via NDJSON | Simpler than WebSockets, HTTP-compatible |
| **Voice Input** | Web Speech API (SpeechRecognition) | Browser-native, no external dependencies |
| **Markdown Rendering** | react-markdown + remark-gfm | Lightweight, secure, no XSS |
| **RTL Support** | CSS `direction: rtl` | Native browser support for Urdu |

**Decision:** Build custom ChatKit-inspired components instead of using OpenAI ChatKit library to maintain full control over cyberpunk theme and avoid heavy dependencies.

### 2.2 Agent/LLM Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **LLM Provider** | Cohere API (COHERE_API_KEY provided) | Tool calling compatible, cost-efficient, multilingual support |
| **Agent Framework** | OpenAI Agents SDK patterns (adapted for Cohere) | Structured agent orchestration, reusable patterns |
| **Tool Protocol** | Model Context Protocol (MCP) - Official MCP SDK | Industry standard, tool interoperability |
| **Intent Parsing** | Cohere Chat API with few-shot prompting | High accuracy, handles ambiguity well |
| **Response Generation** | Cohere Generate API with temperature=0.7 | Natural, varied responses |

**Decision:** Use Cohere instead of OpenAI for better multilingual support (Urdu) and cost efficiency, while following OpenAI Agents SDK architectural patterns.

### 2.3 Tool Protocol Choices

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Tool Definition** | Official MCP SDK (`mcp.server.fastmcp`) | Standard protocol, tool reuse |
| **Tool Transport** | HTTP/JSON (stdio for local dev, SSE for prod) | Web-compatible, no native dependencies |
| **Tool Execution** | Async Python with `asyncio.gather()` for parallel calls | High performance, non-blocking |
| **Tool Schema** | JSON Schema for input/output validation | Standard, tool-agnostic |
| **Error Handling** | Custom exception hierarchy (UnauthorizedError, ValidationError, NotFoundError) | Type-safe, user-friendly |

**Decision:** Use Official MCP SDK for tool definitions to enable future tool reuse across AI systems and ensure standard compliance.

### 2.4 Bonus Feature Strategies

| Bonus Feature | Strategy | Point Potential |
|---------------|----------|-----------------|
| **Reusable Intelligence** | Use specialized subagents/skills for each component (chatbot-integrator, mcp-tool-engineer, agents-sdk-specialist) | +200 |
| **Cloud-Native Blueprints** | Create Kubernetes manifests, CI/CD pipelines, monitoring for MCP server deployment | +200 |
| **Urdu Language Support** | Language detection + Cohere translation + RTL rendering | +100 |
| **Voice Commands** | Web Speech API integration with speech-to-text | +200 |

**Recommended Priority:**
1. Start with core chatbot (no bonus) to ensure functionality
2. Add reusable intelligence (subagents/skills) - high ROI
3. Add Urdu support for multilingual demo appeal
4. Add voice commands for accessibility wow factor
5. Create cloud-native blueprints for deployment readiness

---

## 3. Integration Points

### 3.1 Frontend Integration

**Integration with Phase 2 Dashboard:**

```tsx
// frontend/app/dashboard/page.tsx
import { ChatWidget } from '@/components/chat/chat-widget';
import { ChatToggle } from '@/components/chat/chat-toggle';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, token } = useAuth();

  return (
    <div className="dashboard">
      {/* Existing Phase 2 components */}
      <TaskList />
      <TaskTable />

      {/* NEW Phase 3 ChatKit integration */}
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

**API Communication:**

```typescript
// frontend/lib/agents.ts
export class AgentClient {
  constructor(
    private baseUrl: string,
    private token: string
  ) {}

  async sendMessage(message: string, userId: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`Agent error: ${response.statusText}`);
    }

    return response;
  }

  async *streamResponse(response: Response): AsyncGenerator<StreamChunk> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          yield data;
        }
      }
    }
  }
}
```

### 3.2 Backend Integration

**FastAPI Route Registration:**

```python
# backend/app/main.py
from fastapi import FastAPI
from app.api.routes import tasks, auth, agent, mcp
from app.core.middleware import jwt_middleware

app = FastAPI(title="Hackathon Todo API")

# Add JWT verification middleware
app.middleware("http")(jwt_middleware)

# Register Phase 2 routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/{user_id}/tasks", tags=["tasks"])

# Register Phase 3 routes
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
app.include_router(mcp.router, prefix="/api/mcp", tags=["mcp"])
```

**Agent Endpoint Implementation:**

```python
# backend/app/api/routes/agent.py
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.agents.orchestrator import TodoAgentOrchestrator
from app.core.cohere import CohereClient
import json

router = APIRouter(prefix="/api/agent", tags=["agent"])

class ChatRequest(BaseModel):
    message: str
    language: str = "english"  # english, urdu, auto-detect

@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Main agent chat endpoint with streaming responses.

    Flow:
    1. Verify JWT (get_current_user)
    2. Initialize orchestrator with Cohere client
    3. Process message through agent pipeline
    4. Stream responses as NDJSON
    """
    cohere_client = CohereClient()
    orchestrator = TodoAgentOrchestrator(cohere_client)

    async def generate_response():
        try:
            async for chunk in orchestrator.process_message(
                user_message=request.message,
                user_id=current_user_id,
                language=request.language
            ):
                yield json.dumps(chunk) + "\n"

            yield json.dumps({"type": "done"}) + "\n"

        except Exception as e:
            yield json.dumps({
                "type": "error",
                "content": "Unexpected error occurred",
                "details": str(e)
            }) + "\n"

    return StreamingResponse(
        generate_response(),
        media_type="application/x-ndjson",
        status_code=status.HTTP_200_OK
    )
```

**MCP Tool Endpoint:**

```python
# backend/app/api/routes/mcp.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.mcp.tools.todo_tools import add_task, list_tasks, update_task, complete_task, delete_task

router = APIRouter(prefix="/api/mcp", tags=["mcp"])

class AddTaskRequest(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"

@router.post("/tools/add_task")
async def mcp_add_task(
    request: AddTaskRequest,
    user_id: str = Depends(get_current_user)  # JWT verification
):
    """
    MCP tool endpoint: add_task

    Automatically scoped to authenticated user via JWT.
    """
    try:
        result = await add_task(
            title=request.title,
            description=request.description,
            priority=request.priority
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Similar endpoints for other MCP tools...
```

### 3.3 Environment Variables

**Frontend (.env.local):**

```bash
# Phase 2 Variables (Unchanged)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
NEXT_PUBLIC_API_URL=http://localhost:8000

# Phase 3 Variables (NEW)
NEXT_PUBLIC_COHERE_API_KEY=  # Optional: for client-side Cohere calls
```

**Backend (.env):**

```bash
# Phase 2 Variables (Unchanged)
DATABASE_URL=postgresql://...  # Neon DB connection string
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5  # MUST match frontend
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Phase 3 Variables (NEW)
COHERE_API_KEY= # Cohere LLM for NLP
MCP_BASE_URL=http://localhost:8000/api/mcp
MCP_TRANSPORT=sse  # 'stdio' for local dev, 'sse' for production

# Optional: Bonus Features
ENABLE_URDU_SUPPORT=true  # Urdu language support
ENABLE_VOICE_INPUT=true   # Voice commands
LOG_LEVEL=info            # debug, info, warning, error
```

**Secret Management:**
- Never commit `.env` files to git
- Use `.env.example` as template
- In production (Vercel/Railway), use platform-specific environment variable management
- Rotate `COHERE_API_KEY` if compromised

---

## 4. Bonus Strategy

### 4.1 Reusable Intelligence (+200 points)

**Strategy:** Use specialized subagents/skills for each Phase 3 component.

**Available Skills to Leverage:**

| Skill | Purpose | Usage |
|-------|---------|-------|
| `chatbot-integrator` | Integrate ChatKit into Next.js dashboard | `/sp.implement @specs/ui/chatbot-widget.md` |
| `mcp-tool-engineer` | Define MCP tools with Official MCP SDK | `/sp.implement @specs/api/mcp-tools.md` |
| `agents-sdk-specialist` | Implement agent logic with Cohere | `/sp.implement @specs/agent-logic.md` |
| `nlp-intent-parser` | Parse natural language intents | Use within agent-logic.md |
| `urdu-language-support` | Add Urdu language support | `/sp.implement @specs/features/bonus/urdu-support.md` |
| `voice-command-specialist` | Implement voice input | `/sp.implement @specs/features/bonus/voice-input.md` |
| `multi-agent-orchestration` | Coordinate specialist agents | Use within orchestrator.py |
| `cloud-blueprint-architect` | Create deployment blueprints | `/sp.implement @specs/blueprints/mcp-todo-server/` |

**Implementation Example:**

```bash
# Use chatbot-integrator skill
/sp.implement @specs/ui/chatbot-widget.md
# This automatically calls chatbot-integrator agent
# Agent generates all ChatKit components following spec

# Use mcp-tool-engineer skill
/sp.implement @specs/api/mcp-tools.md
# This automatically calls mcp-tool-engineer agent
# Agent generates all MCP tools with Official MCP SDK
```

**Success Metrics:**
- 4+ specialized agents/skills used
- Each agent produces spec-compliant code
- Agents coordinate without conflicts
- Code is production-ready

### 4.2 Cloud-Native Blueprints (+200 points)

**Strategy:** Create Kubernetes manifests, CI/CD pipelines, and monitoring for MCP server deployment.

**Blueprint Structure:**

```
specs/blueprints/mcp-todo-server/
├── blueprint.md                 # Blueprint specification
├── manifests/                   # Kubernetes manifests
│   ├── deployment.yaml          # MCP server deployment
│   ├── service.yaml             # Service暴露
│   ├── ingress.yaml             # Ingress for routing
│   ├── configmap.yaml           # Configuration
│   └── secrets.yaml             # Secret management
├── terraform/                   # Infrastructure as Code
│   ├── main.tf                  # Terraform configuration
│   ├── variables.tf             # Variables
│   └── outputs.tf               # Outputs
├── ci-cd/                       # CI/CD pipeline
│   ├── github-actions.yaml      # GitHub Actions workflow
│   └── dockerfile               # Docker image
└── monitoring/                  # Observability
    ├── prometheus.yaml          # Prometheus metrics
    ├── grafana-dashboard.json   # Grafana dashboard
    └── alerting-rules.yaml      # Alert rules
```

**Sample Kubernetes Deployment:**

```yaml
# manifests/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-todo-server
  labels:
    app: mcp-todo-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-todo-server
  template:
    metadata:
      labels:
        app: mcp-todo-server
    spec:
      containers:
      - name: mcp-server
        image: ghcr.io/username/mcp-todo-server:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: database-url
        - name: COHERE_API_KEY
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: cohere-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 3
```

**CI/CD Pipeline:**

```yaml
# ci-cd/github-actions.yaml
name: MCP Server CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: |
          docker build -t mcp-todo-server:${{ github.sha }} .
      - name: Push to registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push mcp-todo-server:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/mcp-todo-server mcp-server=mcp-todo-server:${{ github.sha }}
```

**Success Metrics:**
- Blueprint exists in `/specs/blueprints/`
- Kubernetes manifests deploy successfully
- CI/CD pipeline builds and deploys automatically
- Monitoring and alerting configured
- Documentation explains deployment process

### 4.3 Urdu Support (+100 points)

**Strategy:** Language detection + Cohere translation + RTL rendering.

**Implementation Components:**

1. **Language Detection (Backend):**

```python
# backend/app/agents/urdu_support.py
import re

class UrduDetector:
    URDU_RANGE = r'[\u0600-\u06FF]'

    @staticmethod
    def is_urdu(text: str) -> bool:
        urdu_chars = len(re.findall(UrduDetector.URDU_RANGE, text))
        total_chars = len(text.strip())
        return (urdu_chars / total_chars) > 0.3 if total_chars > 0 else False
```

2. **Translation (Backend):**

```python
class UrduTranslator:
    def __init__(self, cohere_client):
        self.cohere = cohere_client

    async def translate_to_english(self, urdu_text: str) -> str:
        response = await self.cohere.generate(
            prompt=f'Translate this Urdu text to English: "{urdu_text}"',
            temperature=0
        )
        return response.text.strip()

    async def translate_to_urdu(self, english_text: str) -> str:
        response = await self.cohere.generate(
            prompt=f'Translate this English text to Urdu: "{english_text}"',
            temperature=0
        )
        return response.text.strip()
```

3. **RTL Rendering (Frontend):**

```tsx
// frontend/components/chat/ChatMessage.tsx
export function ChatMessage({ content, language }: { content: string, language: string }) {
  const isUrdu = language === 'urdu';

  return (
    <div
      className="chat-message"
      dir={isUrdu ? 'rtl' : 'ltr'}  // RTL for Urdu
      lang={isUrdu ? 'ur' : 'en'}
    >
      <p className={isUrdu ? 'urdu-text' : 'english-text'}>
        {content}
      </p>
    </div>
  );
}
```

**CSS:**

```css
/* globals.css */
.urdu-text {
  font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif;
  text-align: right;
  direction: rtl;
}
```

**Success Metrics:**
- Urdu commands work: "مجھے کام شامل کریں" → creates task
- Urdu responses work: "کام شامل کر دیا گیا" → displays correctly
- RTL text renders properly
- Language detection >90% accuracy

### 4.4 Voice Commands (+200 points)

**Strategy:** Web Speech API integration with speech-to-text.

**Implementation:**

```tsx
// frontend/components/voice/VoiceInput.tsx
import { useState, useEffect } from 'react';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      onTranscript(transcript);
    };

    (window as any).speechRecognitionInstance = recognition;
  }, [onTranscript]);

  const handleToggle = () => {
    const recognition = (window as any).speechRecognitionInstance;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  return (
    <button onClick={handleToggle} className={isListening ? 'listening' : ''}>
      {isListening ? '🎤 Listening...' : '🎤 Voice'}
    </button>
  );
}
```

**Success Metrics:**
- Microphone button visible in ChatKit widget
- Speech converts to text with >85% accuracy
- Works on Chrome, Edge, Safari (webkit)
- Visual feedback when listening
- Error handling for permission denied

---

## 5. Risks & Mitigations

### 5.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Cohere API rate limits** | High (chatbot fails) | Medium | Implement retry with exponential backoff; cache responses; fallback to rule-based parsing |
| **JWT token expiration during chat** | Medium (session loss) | Low | Refresh token automatically; show re-auth prompt if refresh fails |
| **MCP tool execution timeout** | Medium (incomplete operations) | Low | Set 30s timeout; implement async task queuing; show "processing..." status |
| **User isolation bypass** | Critical (security breach) | Low | Enforce user_id filtering at database layer; audit all queries; security testing |
| **Urdu translation accuracy** | Low (poor UX) | Medium | Use high-quality translation (Cohere); implement confidence threshold; fallback to English |
| **Voice recognition browser support** | Low (feature unavailable) | Medium | Graceful degradation (hide button if unsupported); provide text input fallback |

### 5.2 Mitigation Strategies

**1. Cohere API Resilience:**

```python
# backend/app/core/cohere.py
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

class CohereClient:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate(self, prompt: str, **kwargs) -> str:
        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                **kwargs
            )
            return response.generations[0].text.strip()
        except cohere.CohereError as e:
            if "rate limit" in str(e).lower():
                # Fallback to rule-based parsing
                return self._fallback_parse(prompt)
            raise
```

**2. JWT Token Refresh:**

```typescript
// frontend/lib/api-client.ts
class APIClient {
  async refreshAccessToken(): Promise<string> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data.token;
  }

  async fetchWithAuth(url: string, options: RequestInit): Promise<Response> {
    let token = localStorage.getItem('token');

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Refresh token and retry
      token = await this.refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    return response;
  }
}
```

**3. MCP Tool Timeout Handling:**

```python
# backend/app/agents/tool_caller.py
import asyncio
from typing import Dict, Any

class CohereToolCaller:
    async def call_tool(self, tool_name: str, **parameters) -> Dict[str, Any]:
        try:
            result = await asyncio.wait_for(
                self._execute_tool(tool_name, **parameters),
                timeout=30.0  # 30s timeout
            )
            return result

        except asyncio.TimeoutError:
            # Log timeout
            logger.error(f"Tool '{tool_name}' timed out")
            raise ToolError(f"Tool '{tool_name}' took too long. Please try again.")

    async def _execute_tool(self, tool_name: str, **parameters):
        from app.mcp.tools.todo_tools import mcp
        return await mcp.call_tool(tool_name, **parameters)
```

**4. User Isolation Enforcement:**

```python
# backend/app/mcp/auth.py
from fastapi import HTTPException, Request

async def get_current_user_id(request: Request) -> str:
    """Extract user_id from JWT context (set by middleware)."""
    user_id = getattr(request.state, 'user_id', None)

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Missing user context"
        )

    return user_id

# All MCP tools must use this function
@mcp.tool()
async def add_task(title: str, priority: str = "medium") -> dict:
    # ALWAYS get user_id from context, never from user input
    user_id = await get_current_user_id(request)

    # Database query MUST include user_id
    task = Task(user_id=user_id, title=title, priority=priority)
    ...
```

**5. Security Testing:**

```python
# tests/test_user_isolation.py
import pytest
from fastapi.testclient import TestClient

def test_user_cannot_access_other_users_tasks(client: TestClient):
    # Create two users
    user_a_token = create_user_and_get_token("user_a")
    user_b_token = create_user_and_get_token("user_b")

    # User A creates a task
    response = client.post(
        "/api/mcp/tools/add_task",
        json={"title": "User A's task"},
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    task_id = response.json()["id"]

    # User B tries to access User A's task
    response = client.get(
        f"/api/mcp/tools/get_task?task_id={task_id}",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    # Should return 404, not the task
    assert response.status_code == 404

    # User B cannot delete User A's task
    response = client.delete(
        f"/api/mcp/tools/delete_task?task_id={task_id}",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    # Should return 404, task should still exist
    assert response.status_code == 404

    # User A can still access their task
    response = client.get(
        f"/api/mcp/tools/get_task?task_id={task_id}",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert response.status_code == 200
```

---

## 6. Development & Testing

### 6.1 Local Development Setup

**Prerequisites:**
- Node.js 18+ (for Next.js)
- Python 3.11+ (for FastAPI)
- PostgreSQL 14+ (Neon DB recommended)
- Cohere API key (provided)

**Frontend Setup:**

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
# NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
# BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev

# Open http://localhost:3000
```

**Backend Setup:**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your values
# DATABASE_URL=postgresql://user:pass@host:port/db
# BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5
# COHERE_API_KEY=

# Run database migrations (if any)
# alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Open http://localhost:8000/docs for API docs
```

**MCP Server (Separate Process):**

```bash
cd backend

# Run MCP server with stdio transport (for local dev)
python -m app.mcp.server

# OR run with SSE transport (for production-like testing)
python -m app.mcp.server --transport sse --port 8001
```

### 6.2 Testing Approach

**Frontend Testing:**

```bash
cd frontend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests with Playwright
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

**Backend Testing:**

```bash
cd backend

# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# E2E tests
pytest tests/e2e/

# Coverage report
pytest --cov=app --cov-report=html

# Linting
ruff check app/
```

**Security Testing:**

```bash
# User isolation tests
pytest tests/security/test_user_isolation.py

# JWT security tests
pytest tests/security/test_jwt_security.py

# SQL injection tests
pytest tests/security/test_sql_injection.py
```

### 6.3 Verification Steps

**Phase 2 Functionality (Must Not Break):**

1. [ ] User signup works
2. [ ] User login works and issues JWT
3. [ ] All 5 CRUD operations work via UI:
   - [ ] Add task
   - [ ] List tasks
   - [ ] Update task
   - [ ] Complete task
   - [ ] Delete task
4. [ ] User isolation verified (test with 2 users)
5. [ ] UI responsive on mobile/tablet/desktop

**Phase 3 Core Functionality:**

1. [ ] ChatKit widget renders on dashboard
2. [ ] Chat toggle button opens/closes widget
3. [ ] Natural language processing works for all 5 intents:
   - [ ] "Add task: Buy groceries" → Creates task
   - [ ] "Show my tasks" → Lists tasks
   - [ ] "Mark task 123 as complete" → Completes task
   - [ ] "Update task priority to high" → Updates task
   - [ ] "Delete task 456" → Deletes task
4. [ ] Streaming responses display in real-time
5. [ ] Tool execution indicators show when MCP tools are called
6. [ ] Error handling works (ambiguity, missing params, not found)
7. [ ] JWT verification on all agent requests
8. [ ] User isolation enforced via MCP tools

**Bonus Features Verification:**

1. [ ] **Urdu Support:**
   - [ ] "مجھے کام شامل کریں" → Creates task
   - [ ] "میرے تمام کام دکھائیں" → Lists tasks
   - [ ] RTL text renders correctly
2. [ ] **Voice Input:**
   - [ ] Microphone button visible
   - [ ] Speech converts to text
   - [ ] Works on Chrome/Edge/Safari
3. [ ] **Cloud-Native Blueprints:**
   - [ ] Kubernetes manifests exist
   - [ ] CI/CD pipeline configured
   - [ ] Monitoring setup

---

## 7. Next Steps

### 7.1 Immediate Actions

1. **Review and Approve Specs:**
   - Read all specs: `@specs/ui/chatbot-widget.md`, `@specs/features/chatbot-integration.md`, `@specs/api/mcp-tools.md`, `@specs/agent-logic.md`
   - Confirm technical decisions
   - Identify any missing requirements

2. **Create Task Breakdown:**
   ```bash
   # Generate detailed task list from this plan
   /sp.tasks "Implement Phase 3 AI chatbot"
   ```

3. **Initialize Environment:**
   ```bash
   # Set up frontend
   cd frontend && npm install

   # Set up backend
   cd backend && pip install -r requirements.txt

   # Configure environment variables
   cp .env.example .env.local  # Frontend
   cp .env.example .env         # Backend
   ```

### 7.2 Implementation Order

**Phase 1: Foundation (Days 1-2)**
1. Set up project structure (monorepo)
2. Configure environment variables
3. Test Phase 2 functionality still works

**Phase 2: Backend Core (Days 3-4)**
4. Implement MCP tools (add_task, list_tasks, update_task, complete_task, delete_task)
5. Implement JWT authentication for MCP tools
6. Test MCP tools via Postman/curl
7. Implement NLP intent parser with Cohere
8. Implement agent orchestrator
9. Implement /api/agent/chat endpoint with streaming

**Phase 3: Frontend Core (Days 5-6)**
10. Implement ChatKit widget components
11. Implement chat toggle and state management
12. Implement useChat hook with streaming
13. Integrate ChatKit with dashboard
14. Test end-to-end chat flow

**Phase 4: Polish & Testing (Days 7-8)**
15. Implement error handling and ambiguity resolution
16. Add tool execution indicators
17. Test all 5 intents extensively
18. Verify user isolation
19. Test multi-user scenarios
20. Performance optimization

**Phase 5: Bonus Features (Days 9-10)**
21. Add Urdu language support
22. Add voice input
23. Create cloud-native blueprints
24. Final testing and documentation

### 7.3 Command Reference

```bash
# Create feature spec (if not exists)
/sp.specify "Implement AI chatbot with natural language Todo management"

# Generate task list from spec
/sp.tasks @specs/features/chatbot-integration.md

# Implement specific component using spec
/sp.implement @specs/ui/chatbot-widget.md

# Create architecture decision record
/sp.adr "Use Cohere instead of OpenAI for LLM"

# View task list
/sp.tasks

# Mark task as in progress
/sp.task <task-id> --status in_progress

# Mark task as completed
/sp.task <task-id> --status completed
```

### 7.4 Success Criteria

**Must Have (for Hackathon submission):**
- [ ] All Phase 2 CRUD operations work via UI
- [ ] Chatbot handles all 5 CRUD operations via natural language
- [ ] JWT authentication enforced on all endpoints
- [ ] User isolation verified (zero data leaks)
- [ ] Cyberpunk theme with neon accents
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Demo video <120s showing all features
- [ ] Public GitHub repository with README

**Should Have (for competitive score):**
- [ ] Streaming responses for real-time feedback
- [ ] Tool execution indicators
- [ ] Error handling with helpful messages
- [ ] Ambiguity resolution (asks clarifying questions)
- [ ] Multi-turn conversations (maintains context)
- [ ] Clean code with linting/tests passing

**Nice to Have (for bonus points):**
- [ ] Urdu language support (+100)
- [ ] Voice input commands (+200)
- [ ] Reusable intelligence via subagents/skills (+200)
- [ ] Cloud-native blueprints (+200)

---

## 8. Appendices

### 8.1 File Checklist

**Spec Files to Create:**
- [x] `specs/phase3-plan.md` (this document)
- [x] `specs/ui/chatbot-widget.md`
- [x] `specs/features/chatbot-integration.md`
- [x] `specs/api/mcp-tools.md`
- [x] `specs/agent-logic.md`

**Implementation Files to Create:**

**Frontend:**
- [ ] `frontend/components/chat/chat-widget.tsx`
- [ ] `frontend/components/chat/chat-toggle.tsx`
- [ ] `frontend/components/chat/chat-header.tsx`
- [ ] `frontend/components/chat/chat-messages.tsx`
- [ ] `frontend/components/chat/chat-message.tsx`
- [ ] `frontend/components/chat/chat-input-area.tsx`
- [ ] `frontend/components/chat/typing-indicator.tsx`
- [ ] `frontend/components/chat/tool-call-indicator.tsx`
- [ ] `frontend/lib/hooks/use-chat.ts`
- [ ] `frontend/lib/hooks/use-message-history.ts`

**Backend:**
- [ ] `backend/app/api/routes/agent.py`
- [ ] `backend/app/api/routes/mcp.py`
- [ ] `backend/app/agents/orchestrator.py`
- [ ] `backend/app/agents/nlp_parser.py`
- [ ] `backend/app/agents/tool_caller.py`
- [ ] `backend/app/agents/response_generator.py`
- [ ] `backend/app/core/cohere.py`
- [ ] `backend/app/mcp/server.py`
- [ ] `backend/app/mcp/auth.py`
- [ ] `backend/app/mcp/errors.py`
- [ ] `backend/app/mcp/tools/todo_tools.py`

**Bonus Features:**
- [ ] `frontend/components/voice/voice-input-button.tsx`
- [ ] `frontend/lib/hooks/use-speech-recognition.ts`
- [ ] `backend/app/agents/urdu_support.py`

**Deployment:**
- [ ] `specs/blueprints/mcp-todo-server/blueprint.md`
- [ ] `specs/blueprints/mcp-todo-server/manifests/deployment.yaml`
- [ ] `specs/blueprints/mcp-todo-server/ci-cd/github-actions.yaml`

### 8.2 Environment Variable Template

**`frontend/.env.example`:**

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Cohere API (Optional - for client-side calls)
# NEXT_PUBLIC_COHERE_API_KEY=your_key_here
```

**`backend/.env.example`:**

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Better Auth Secret (MUST match frontend)
BETTER_AUTH_SECRET=Ix8VG1V8AcbECliujtd2snDxAmMvVxX5

# JWT Configuration
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Cohere API Key
COHERE_API_KEY=

# MCP Server Configuration
MCP_BASE_URL=http://localhost:8000/api/mcp
MCP_TRANSPORT=sse

# Optional: Bonus Features
ENABLE_URDU_SUPPORT=true
ENABLE_VOICE_INPUT=true

# Logging
LOG_LEVEL=info
```

### 8.3 Testing Commands

```bash
# Frontend Tests
cd frontend
npm run test                 # Unit tests
npm run test:e2e            # E2E tests
npm run lint                # ESLint
npm run type-check          # TypeScript

# Backend Tests
cd backend
pytest tests/unit/          # Unit tests
pytest tests/integration/   # Integration tests
pytest tests/e2e/           # E2E tests
pytest --cov=app            # Coverage report
ruff check app/             # Linting

# Security Tests
pytest tests/security/      # Security tests

# Manual Testing
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to review the PR"}'
```

---

**End of Phase 3 Implementation Plan**

**Version:** 1.0
**Last Updated:** 2026-02-09
**Status:** Active
**Next Action:** Run `/sp.tasks` to generate detailed task breakdown
