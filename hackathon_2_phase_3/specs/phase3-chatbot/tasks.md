# Phase 3 Tasks - AI-Powered Todo Chatbot

**Feature:** AI-Powered Todo Chatbot
**Branch:** main
**Spec:** @specs/phase3-plan.md
**User Stories:** 8 (US1-US8 from @specs/features/chatbot-integration.md)
**Implementation Strategy:** Backend-first (MCP tools → Agent logic → Frontend UI → Integration)

---

## Phase 1: Setup & Configuration

**Goal:** Project initialization, dependencies, and environment setup.

- [X] T001 [P] [Setup] Create frontend/.env.local with COHERE_API_KEY and BETTER_AUTH_SECRET @frontend/.env.local
- [X] T002 [P] [Setup] Create backend/.env with COHERE_API_KEY, DATABASE_URL, and BETTER_AUTH_SECRET @backend/.env
- [X] T003 [P] [Setup] Install frontend dependencies: npm install @ai-sdk/openai @ai-sdk/cohere fastmcp @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-scroll-area @radix-ui/react-avatar @radix-ui/react-dropdown-menu lucide-react class-variance-authority clsx tailwind-merge @frontend/package.json
- [X] T004 [P] [Setup] Install backend dependencies: pip install fastmcp cohere python-dotenv python-multipart uvicorn[standard] sse-starlette @backend/requirements.txt
- [X] T005 [P] [Setup] Update frontend/next.config.js with AI SDK configuration @frontend/next.config.js
- [X] T006 [P] [Setup] Create backend/config.py with Cohere client and MCP settings @backend/config.py
- [X] T007 [P] [Setup] Add TypeScript types for ChatKit components @frontend/types/chatkit.ts
- [X] T008 [P] [Setup] Create backend/services/__init__.py for MCP service imports @backend/services/__init__.py

---

## Phase 2: Foundational Components

**Goal:** Core infrastructure (JWT, database, MCP server, Cohere client). **BLOCKS all later phases.**

- [X] T010 [P] [Setup] Create backend/middleware/jwt_auth.py with verify_and_extract_user function @backend/middleware/jwt_auth.py
- [X] T011 [P] [Setup] Create backend/database/session.py with get_session dependency @backend/database/session.py
- [X] T012 [P] [Setup] Create backend/services/cohere_service.py with CohereClient class @backend/services/cohere_service.py
- [X] T013 [P] [Setup] Create backend/mcp/server.py with FastMCP server initialization @backend/mcp/server.py
- [X] T014 [P] [Setup] Create backend/mcp/middleware.py with JWT context injection @backend/mcp/middleware.py
- [X] T015 [P] [Setup] Create backend/models/__init__.py with Task model import @backend/models/__init__.py

---

## Phase 3: US1 - Natural Language Task Creation (P1)

**User Story:** As a user, I want to create tasks using natural language so that I don't have to fill out forms.

**Acceptance:**
- User types "Add grocery shopping for tomorrow afternoon high priority"
- Chatbot parses intent (add_task), entities (title, due_date, priority)
- MCP tool add_task invoked with JWT-authenticated user_id
- Task created in database
- Streaming response confirms creation with task details

**Tasks:**

- [X] T020 [P] [US1] Create backend/mcp/tools/task_tools.py with add_task tool @backend/mcp/tools/task_tools.py
- [X] T021 [P] [US1] Create backend/services/nlp_parser.py with IntentParser class (add intent) @backend/services/nlp_parser.py
- [X] T022 [P] [US1] Create backend/agents/todo_agent.py with TodoAgent class @backend/agents/todo_agent.py
- [X] T023 [P] [US1] Create backend/api/agent.py with /agent/chat endpoint (SSE streaming) @backend/api/agent.py
- [X] T024 [P] [US1] Create frontend/components/chatkit/ChatWidget.tsx floating component @frontend/components/chatkit/ChatWidget.tsx
- [X] T025 [P] [US1] Create frontend/components/chatkit/FloatingToggle.tsx with cyberpunk styling @frontend/components/chatkit/FloatingToggle.tsx
- [X] T026 [P] [US1] Create frontend/hooks/useChat.ts with sendMessage and streaming @frontend/hooks/useChat.ts
- [X] T027 [P] [US1] Create frontend/lib/api/chat.ts with chat API client @frontend/lib/api/chat.ts
- [X] T028 [P] [US1] Integrate ChatWidget in dashboard layout @frontend/app/dashboard/layout.tsx

---

## Phase 4: US2 - Natural Language Task Queries (P1)

**User Story:** As a user, I want to query my tasks using natural language so that I can quickly find what I need.

**Acceptance:**
- User types "Show my pending tasks"
- Chatbot parses intent (list_tasks), filter (status=pending)
- MCP tool list_tasks invoked with user_id filter
- Results streamed back in natural language

**Tasks:**

- [X] T030 [P] [US2] Extend backend/mcp/tools/task_tools.py with list_tasks tool @backend/mcp/tools/task_tools.py
- [X] T031 [P] [US2] Extend backend/services/nlp_parser.py with list_task intent parsing @backend/services/nlp_parser.py
- [X] T032 [P] [US2] Extend backend/agents/todo_agent.py with list_task handler @backend/agents/todo_agent.py
- [X] T033 [P] [US2] Create frontend/components/chatkit/MessageList.tsx @frontend/components/chatkit/MessageList.tsx
- [X] T034 [P] [US2] Create frontend/components/chatkit/ChatMessage.tsx with user/assistant variants @frontend/components/chatkit/ChatMessage.tsx
- [X] T035 [P] [US2] Create frontend/components/chatkit/TypingIndicator.tsx @frontend/components/chatkit/TypingIndicator.tsx

---

## Phase 5: US3 - Natural Language Task Updates (P1)

**User Story:** As a user, I want to update tasks using natural language so that I can modify tasks without forms.

**Acceptance:**
- User types "Reschedule morning meeting to 2 PM tomorrow"
- Chatbot parses intent (update_task), entities (task_id, new due_date)
- MCP tool update_task invoked with user_id filter
- Task updated, confirmation streamed

**Tasks:**

- [X] T040 [P] [US3] Extend backend/mcp/tools/task_tools.py with update_task tool @backend/mcp/tools/task_tools.py
- [X] T041 [P] [US3] Extend backend/mcp/tools/task_tools.py with get_task tool @backend/mcp/tools/task_tools.py
- [X] T042 [P] [US3] Extend backend/services/nlp_parser.py with update_task intent and entity extraction @backend/services/nlp_parser.py
- [X] T043 [P] [US3] Extend backend/agents/todo_agent.py with update_task handler @backend/agents/todo_agent.py
- [X] T044 [P] [US3] Create frontend/components/chatkit/ToolCallIndicator.tsx @frontend/components/chatkit/ToolCallIndicator.tsx
- [X] T045 [P] [US3] Extend frontend/hooks/useChat.ts with tool invocation state @frontend/hooks/useChat.ts

---

## Phase 6: US4 - Natural Language Task Deletion (P1)

**User Story:** As a user, I want to delete tasks using natural language so that I can remove tasks quickly.

**Acceptance:**
- User types "Delete the old grocery shopping task"
- Chatbot parses intent (delete_task), entity (task_id)
- MCP tool delete_task invoked with user_id filter
- Task deleted, confirmation streamed

**Tasks:**

- [X] T050 [P] [US4] Extend backend/mcp/tools/task_tools.py with delete_task tool @backend/mcp/tools/task_tools.py
- [X] T051 [P] [US4] Extend backend/services/nlp_parser.py with delete_task intent parsing @backend/services/nlp_parser.py
- [X] T052 [P] [US4] Extend backend/agents/todo_agent.py with delete_task handler @backend/agents/todo_agent.py

---

## Phase 7: US6 - Error Handling & Ambiguity Resolution (P1)

**User Story:** As a user, I want the chatbot to handle errors gracefully so that I'm not stuck when something goes wrong.

**Acceptance:**
- MCP tool errors caught and formatted as user-friendly messages
- Ambiguous input triggers clarification questions
- Network errors trigger retry with exponential backoff
- JWT expiration triggers automatic token refresh

**Tasks:**

- [X] T060 [P] [US6] Create backend/agents/error_handler.py with ErrorOrchestrator class @backend/agents/error_handler.py
- [X] T061 [P] [US6] Implement retry logic with exponential backoff in cohere_service.py @backend/services/cohere_service.py
- [X] T062 [P] [US6] Create ambiguity resolution patterns in nlp_parser.py @backend/services/nlp_parser.py
- [X] T063 [P] [US6] Implement JWT refresh flow in frontend/lib/api/chat.ts @frontend/lib/api/chat.ts
- [X] T064 [P] [US6] Create frontend/components/chatkit/ErrorMessage.tsx @frontend/components/chatkit/ErrorMessage.tsx
- [X] T065 [P] [US6] Create frontend/components/chatkit/ClarificationPrompt.tsx @frontend/components/chatkit/ClarificationPrompt.tsx

---

## Phase 8: US5 - Multi-Turn Conversations (P2)

**User Story:** As a user, I want to have multi-turn conversations with the chatbot so that I can refine my requests naturally.

**Acceptance:**
- Chatbot maintains conversation context across turns
- User can reference previous messages ("make it high priority")
- Context window limited to last 10 messages
- Session history stored in memory (not persisted)

**Tasks:**

- [ ] T070 [P] [US5] Extend backend/agents/todo_agent.py with conversation context manager @backend/agents/todo_agent.py
- [ ] T071 [P] [US5] Create backend/services/context_manager.py for message history @backend/services/context_manager.py
- [ ] T072 [P] [US5] Extend frontend/hooks/useChat.ts with message history state @frontend/hooks/useChat.ts
- [ ] T073 [P] [US5] Create frontend/components/chatkit/ChatHeader.tsx with session controls @frontend/components/chatkit/ChatHeader.tsx

---

## Phase 9: US8 - Urdu Language Support (P3 - BONUS)

**User Story:** As a user, I want to interact with the chatbot in Urdu so that I can manage tasks in my preferred language.

**Acceptance:**
- Urdu input detected and parsed correctly
- Responses generated in Urdu
- UI supports RTL rendering
- Cohere multilingual model used for translation

**Tasks:**

- [ ] T080 [P] [US8] Create backend/services/urdu_translator.py with UrduTranslator class @backend/services/urdu_translator.py
- [ ] T081 [P] [US8] Extend backend/services/nlp_parser.py with Urdu language detection @backend/services/nlp_parser.py
- [ ] T082 [P] [US8] Extend frontend/components/chatkit/ChatWidget.tsx with RTL support @frontend/components/chatkit/ChatWidget.tsx
- [ ] T083 [P] [US8] Add Urdu language toggle in ChatHeader.tsx @frontend/components/chatkit/ChatHeader.tsx
- [ ] T084 [P] [US8] Configure Tailwind for RTL in tailwind.config.ts @frontend/tailwind.config.ts

---

## Phase 10: US7 - Voice Input Integration (P3 - BONUS)

**User Story:** As a user, I want to use voice commands to manage tasks so that I can be hands-free.

**Acceptance:**
- Mic button in chat widget
- Web Speech API integration
- Speech-to-text conversion
- Transcribed text sent to agent

**Tasks:**

- [ ] T090 [P] [US7] Create frontend/hooks/useSpeechRecognition.ts with SpeechRecognition integration @frontend/hooks/useSpeechRecognition.ts
- [ ] T091 [P] [US7] Create frontend/components/chatkit/VoiceInputButton.tsx with mic icon @frontend/components/chatkit/VoiceInputButton.tsx
- [ ] T092 [P] [US7] Integrate voice input in ChatInput.tsx @frontend/components/chatkit/ChatInput.tsx
- [ ] T093 [P] [US7] Add voice activity indicator (pulsing animation) @frontend/components/chatkit/VoiceInputButton.tsx

---

## Phase 11: Polish & Cross-Cutting Concerns

**Goal:** Documentation, optimization, security, deployment.

- [ ] T100 [P] [Polish] Create backend/main.py with MCP server startup @backend/main.py
- [ ] T101 [P] [Polish] Create frontend/components/chatkit/index.ts for component exports @frontend/components/chatkit/index.ts
- [ ] T102 [P] [Polish] Add cyberpunk theme utilities in frontend/lib/utils/cn.ts @frontend/lib/utils/cn.ts
- [ ] T103 [P] [Polish] Create MCP server startup script backend/start_mcp.sh @backend/start_mcp.sh
- [ ] T104 [P] [Polish] Update backend/README.md with Phase 3 setup instructions @backend/README.md
- [ ] T105 [P] [Polish] Update frontend/README.md with ChatKit integration docs @frontend/README.md
- [ ] T106 [P] [Polish] Create root README.md with Phase 3 features overview @README.md
- [ ] T107 [P] [Polish] Run Integration-and-Tester-Agent for end-to-end flow verification
- [ ] T108 [P] [Polish] Test JWT authentication flow across all MCP tools
- [ ] T109 [P] [Polish] Test user isolation (verify users can't access each other's tasks)
- [ ] T110 [P] [Polish] Test streaming responses with NDJSON format
- [ ] T111 [P] [Polish] Test error handling (network errors, JWT expiry, invalid input)
- [ ] T112 [P] [Polish] Test Urdu language detection and translation
- [ ] T113 [P] [Polish] Test voice input with Web Speech API
- [ ] T114 [P] [Polish] Performance test: Chatbot response time <3s
- [ ] T115 [P] [Polish] Security audit: Ensure JWT secrets never exposed in client code
- [ ] T116 [P] [Polish] Deploy frontend to Vercel with environment variables
- [ ] T117 [P] [Polish] Deploy backend MCP server to Railway
- [ ] T118 [P] [Polish] Update demo video with AI chatbot features (120 seconds)

---

## Dependencies

### Critical Path (Serial)
```
T001-T008 (Setup)
  ↓
T010-T015 (Foundational - BLOCKS ALL)
  ↓
T020-T028 (US1: Task Creation)
  ↓
T030-T035 (US2: Task Queries)
  ↓
T040-T045 (US3: Task Updates)
  ↓
T050-T052 (US4: Task Deletion)
  ↓
T060-T065 (US6: Error Handling)
  ↓
T070-T073 (US5: Multi-Turn)
  ↓
T080-T084 (US8: Urdu - BONUS)
  ↓
T090-T093 (US7: Voice - BONUS)
  ↓
T100-T118 (Polish)
```

### Parallel Opportunities
- **Phase 1 (Setup):** T001-T008 can all run in parallel
- **Phase 2 (Foundational):** T010-T015 can all run in parallel (after Phase 1)
- **Within User Stories:** Backend tasks (T020-T023) can run in parallel with frontend tasks (T024-T028)
- **Bonus Features:** T080-T084 (Urdu) and T090-T093 (Voice) can run in parallel after US6
- **Polish:** T100-T106 can run in parallel; T107-T118 are sequential testing tasks

---

## Implementation Strategy

### Backend-First Approach
1. **MCP Tools First:** Build secure, JWT-authenticated MCP tools
2. **Agent Logic:** Build NLP parser and agent orchestrator
3. **API Layer:** Build streaming /agent/chat endpoint
4. **Frontend UI:** Build ChatKit components with cyberpunk styling
5. **Integration:** Connect frontend to backend with error handling
6. **Bonus Features:** Add Urdu and voice support
7. **Testing:** Comprehensive integration testing
8. **Deployment:** Deploy to Vercel (frontend) and Railway (backend)

### Risk Mitigation
- **JWT Expiry:** Implement automatic token refresh (T063)
- **User Isolation:** Database-level enforcement in all MCP tools (T020, T030, T040, T050)
- **Cohere Rate Limits:** Retry with exponential backoff (T061)
- **Streaming Latency:** Optimistic UI with loading indicators (T035, T064)
- **Urdu Translation:** Confidence thresholds with fallback to English (T081)

### Quality Gates
- Each user story must be independently testable
- All MCP tools must enforce JWT user_id filtering
- All errors must have user-friendly messages
- All streaming responses must use NDJSON format
- All UI components must follow cyberpunk theme

---

## Task Count Summary

- **Total Tasks:** 118
- **Setup:** 8 tasks (T001-T008)
- **Foundational:** 6 tasks (T010-T015)
- **US1 (Task Creation):** 9 tasks (T020-T028)
- **US2 (Task Queries):** 6 tasks (T030-T035)
- **US3 (Task Updates):** 6 tasks (T040-T045)
- **US4 (Task Deletion):** 3 tasks (T050-T052)
- **US6 (Error Handling):** 6 tasks (T060-T065)
- **US5 (Multi-Turn):** 4 tasks (T070-T073)
- **US8 (Urdu - BONUS):** 5 tasks (T080-T084)
- **US7 (Voice - BONUS):** 4 tasks (T090-T093)
- **Polish:** 19 tasks (T100-T118)

---

## Bonus Feature Tracking

**Total Bonus Points:** +700 potential

- **+200 Reusable Intelligence:** Uses subagents (chatbot-integrator, mcp-tool-engineer, agents-sdk-specialist, urdu-language-support, voice-command-specialist)
- **+200 Cloud-Native Blueprints:** MCP tool deployment specs, K8s manifests (T103, T116, T117)
- **+100 Urdu Language Support:** US8 (T080-T084) - Full Urdu NLP with RTL UI
- **+200 Voice Commands:** US7 (T090-T093) - Web Speech API integration

---

**Generated:** 2026-02-09
**From Plan:** @specs/phase3-plan.md
**From Spec:** @specs/features/chatbot-integration.md
**Template:** .specify/templates/tasks-template.md
