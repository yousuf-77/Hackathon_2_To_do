# Phase 3 AI-Powered Todo Chatbot – Actionable Tasks

**Generated:** 2026-02-11
**Source:** specs/phase3-enhancements-plan.md
**Status:** Ready for Implementation
**Total Tasks:** 87

---

## Task Format Legend

```
- [ ] TXXX [P?] [USY] Task description
       └─> file/path/to/modify.ts

Where:
- TXXX: Unique task ID (T001-T087)
- P?: Priority (P1=Critical, P2=Important, P3=Bonus)
- USY: User Story ID (US0-US8, or USF for Foundation)
```

---

## Phase 1: Setup & Infrastructure

- [X] T001 [P1] [USF] Install frontend dependencies: swr, framer-motion, canvas-confetti
    `frontend/package.json`
- [X] T002 [P1] [USF] Install backend dependencies: cohere, python-mcp, websockets
    `backend/requirements.txt` (Already installed: cohere 5.20.4, fastmcp 2.14.5, mcp 1.26.0)
- [X] T003 [P1] [USF] Create environment variable template with Cohere API key
    `backend/.env.example` (Updated with COHERE_API_KEY)
- [X] T004 [P1] [USF] Set up NEXT_PUBLIC_API_URL for FastAPI backend communication
    `frontend/.env.local` (Already configured: NEXT_PUBLIC_API_URL=http://localhost:8000)

---

## Phase 2: Foundation (BLOCKS ALL USER STORIES)

**⚠️ CRITICAL:** Complete ALL foundation tasks before starting user story implementation.

### Database & Schema

- [X] T005 [P1] [USF] Add tags column (TEXT[]) to task table in Neon PostgreSQL
    `backend/database/migrations/001_add_tags.sql` (Created)
- [X] T006 [P1] [USF] Add due_date column (TIMESTAMPTZ) to task table
    `backend/database/migrations/002_add_due_date.sql` (Created)
- [X] T007 [P1] [USF] Add priority column (VARCHAR) with default 'medium' to task table
    `backend/database/migrations/003_add_priority.sql` (Created)
- [X] T008 [P1] [USF] Add recurring_pattern column (JSONB) for recurring tasks
    `backend/database/migrations/004_add_recurring_pattern.sql` (Created)
- [X] T009 [P1] [USF] Create GIN index on tags column for fast tag queries
    `backend/database/migrations/005_index_tags.sql` (Created)
    `backend/app/models/task.py` (Updated with enhanced fields)

### JWT & Authentication

- [ ] T010 [P1] [USF] Create JWT verification middleware for FastAPI using BETTER_AUTH_SECRET
    `backend/middleware/jwt_auth.py`
- [ ] T011 [P1] [USF] Implement get_current_user_id() dependency to extract user_id from JWT
    `backend/dependencies/auth.py`
- [ ] T012 [P1] [USF] Add JWT authentication to all FastAPI /api/{user_id}/ endpoints
    `backend/routers/tasks.py`

### MCP Tools Foundation

- [ ] T013 [P1] [USF] Create MCP server base class with user_id isolation
    `backend/mcp/server.py`
- [ ] T014 [P1] [USF] Implement MCP tool: add_task with enhanced fields (priority, tags, due_date)
    `backend/mcp/tools/task_tools.py`
- [ ] T015 [P1] [USF] Implement MCP tool: list_tasks with filters (status, priority, tags, due_date_range)
    `backend/mcp/tools/task_tools.py`
- [ ] T016 [P1] [USF] Implement MCP tool: get_task by task_id with user_id filter
    `backend/mcp/tools/task_tools.py`
- [ ] T017 [P1] [USF] Implement MCP tool: update_task with user_id filter
    `backend/mcp/tools/task_tools.py`
- [ ] T018 [P1] [USF] Implement MCP tool: delete_task with user_id filter
    `backend/mcp/tools/task_tools.py`
- [ ] T019 [P1] [USF] Implement MCP tool: complete_task with user_id filter
    `backend/mcp/tools/task_tools.py`
- [ ] T020 [P1] [USF] Add user_id parameter validation to all MCP tools (security critical)
    `backend/mcp/tools/task_tools.py`

### Agent Foundation

- [ ] T021 [P1] [USF] Create NLPIntentParser class using Cohere API for intent detection
    `backend/services/nlp_parser.py`
- [ ] T022 [P1] [USF] Create TodoAgent class with conversation context management (10 messages)
    `backend/agents/todo_agent.py`
- [ ] T023 [P1] [USF] Create cyberpunk system prompt with personality, confirmation rules, error templates
    `backend/agents/prompts/system_prompt.py`
- [ ] T024 [P1] [USF] Create intent detection prompt template for entity extraction
    `backend/agents/prompts/intent_prompts.py`
- [ ] T025 [P1] [USF] Create response templates for success, error, and confirmation messages
    `backend/agents/prompts/response_templates.py`
- [ ] T026 [P1] [USF] Implement ErrorHandler class with user-friendly error messages
    `backend/agents/error_handler.py`

### Backend API Endpoints

- [ ] T027 [P1] [USF] Create FastAPI endpoint POST /api/agent/chat for streaming chatbot responses
    `backend/routers/agent.py`
- [ ] T028 [P1] [USF] Implement SSE (Server-Sent Events) streaming for chatbot responses
    `backend/routers/agent.py`
- [ ] T029 [P1] [USF] Add JWT verification to /api/agent/chat endpoint
    `backend/routers/agent.py`

### Frontend Foundation

- [ ] T030 [P1] [USF] Create useTasks SWR hook with 30s polling and auto-revalidation
    `frontend/hooks/useTasks.ts`
- [ ] T031 [P1] [USF] Create useAgentChat hook for streaming chatbot responses via SSE
    `frontend/hooks/useAgentChat.ts`
- [ ] T032 [P1] [USF] Create ToastProvider component using Shadcn/UI toast notifications
    `frontend/components/providers/ToastProvider.tsx`
- [ ] T033 [P1] [USF] Create TaskFilters component with search, status, priority, tag filters
    `frontend/components/tasks/TaskFilters.tsx`
- [ ] T034 [P1] [USF] Create ConfettiAnimation component using canvas-confetti library
    `frontend/components/animations/ConfettiAnimation.tsx`

---

## Phase 3: US1 – Natural Language Task Creation

**User Story:** As a user, I want to create tasks using natural language with rich metadata so that I don't have to fill out forms.

**Priority:** P1 (Critical)

**Dependencies:** Foundation (T001-T034)

- [ ] T035 [P1] [US1] Implement entity extraction for title, priority, due_date, tags in NLPIntentParser
    `backend/services/nlp_parser.py`
- [ ] T036 [P1] [US1] Implement parse() method to detect add_task intent and extract entities
    `backend/services/nlp_parser.py`
- [ ] T037 [P1] [US1] Create _handle_add_task() handler in TodoAgent to call add_task MCP tool
    `backend/agents/todo_agent.py`
- [ ] T038 [P1] [US1] Generate witty success response template after task creation
    `backend/agents/prompts/response_templates.py`
- [ ] T039 [P1] [US1] Test natural language parsing: "Add grocery shopping for tomorrow 2pm high priority #personal"
    `tests/integration/test_nlp_parsing.test.ts`

**Parallel Execution:** T035-T038 can be developed in parallel after foundation is complete.

---

## Phase 4: US2 – Natural Language Task Queries

**User Story:** As a user, I want to query my tasks using natural language with filters so that I can quickly find what I need.

**Priority:** P1 (Critical)

**Dependencies:** Foundation (T001-T034), US1 (T035-T039)

- [ ] T040 [P1] [US2] Implement filter extraction logic for status, priority, tags, due_date_range in NLPIntentParser
    `backend/services/nlp_parser.py`
- [ ] T041 [P1] [US2] Create _handle_list_tasks() handler in TodoAgent to call list_tasks MCP tool with filters
    `backend/agents/todo_agent.py`
- [ ] T042 [P1] [US2] Format task list response with emoji indicators for priority and status
    `backend/agents/prompts/response_templates.py`
- [ ] T043 [P1] [US2] Implement SWR cache invalidation after task list queries
    `frontend/hooks/useTasks.ts`
- [ ] T044 [P1] [US2] Test natural language queries: "Show my pending high priority tasks due this week"
    `tests/integration/test_task_queries.test.ts`

**Parallel Execution:** T040-T043 can be developed in parallel.

---

## Phase 5: US3 – Natural Language Task Updates

**User Story:** As a user, I want to update tasks using natural language with confirmation so that I can modify tasks safely.

**Priority:** P1 (Critical)

**Dependencies:** Foundation (T001-T034), US1 (T035-T039), US2 (T040-T044)

- [ ] T045 [P1] [US3] Implement task reference resolution (e.g., "it", "that one") using conversation context
    `backend/agents/todo_agent.py`
- [ ] T046 [P1] [US3] Create _request_confirmation() method to store pending actions in conversation state
    `backend/agents/todo_agent.py`
- [ ] T047 [P1] [US3] Create _handle_confirmation() method to process yes/no responses
    `backend/agents/todo_agent.py`
- [ ] T048 [P1] [US3] Implement _handle_update_task() handler with confirmation flow
    `backend/agents/todo_agent.py`
- [ ] T049 [P1] [US3] Generate confirmation message template: "⚠️ Confirm: Change priority to HIGH? (yes/no)"
    `backend/agents/prompts/response_templates.py`
- [ ] T050 [P1] [US3] Test multi-turn conversation: "Make it high priority" → confirm → update
    `tests/integration/test_multi_turn.test.ts`

**Parallel Execution:** T045-T049 can be developed in parallel.

---

## Phase 6: US4 – Natural Language Task Deletion

**User Story:** As a user, I want to delete tasks using natural language with confirmation so that I can remove tasks safely.

**Priority:** P1 (Critical)

**Dependencies:** Foundation (T001-T034), US3 (T045-T050)

- [ ] T051 [P1] [US4] Implement _handle_delete_task() handler with confirmation requirement
    `backend/agents/todo_agent.py`
- [ ] T052 [P1] [US4] Generate deletion confirmation template with warning about irreversibility
    `backend/agents/prompts/response_templates.py`
- [ ] T053 [P1] [US4] Show task details in confirmation message (title, due date, priority)
    `backend/agents/prompts/response_templates.py`
- [ ] T054 [P1] [US4] Trigger SWR mutate() after successful deletion for real-time update
    `frontend/hooks/useTasks.ts`
- [ ] T055 [P1] [US4] Test deletion flow: "Delete grocery task" → confirm → delete → real-time update
    `tests/integration/test_deletion.test.ts`

**Parallel Execution:** T051-T054 can be developed in parallel.

---

## Phase 7: US5 – Multi-Turn Conversations with Context

**User Story:** As a user, I want to have multi-turn conversations so that I can refine my requests naturally.

**Priority:** P2 (Important)

**Dependencies:** Foundation (T001-T034), US3 (T045-T050)

- [ ] T056 [P2] [US5] Implement conversation context storage (last 10 messages) in TodoAgent
    `backend/agents/todo_agent.py`
- [ ] T057 [P2] [US5] Create context-aware entity resolution for pronouns and references
    `backend/services/nlp_parser.py`
- [ ] T058 [P2] [US5] Implement ambiguity detection when multiple tasks match reference
    `backend/services/nlp_parser.py`
- [ ] T059 [P2] [US5] Create clarification question template: "Which task? I see multiple: [list]"
    `backend/agents/prompts/clarification_templates.py`
- [ ] T060 [P2] [US5] Test context window behavior: Add task → "Make it high priority" → "Set it to Friday"
    `tests/integration/test_context.test.ts`

**Parallel Execution:** T056-T059 can be developed in parallel.

---

## Phase 8: US6 – Error Handling & Ambiguity Resolution

**User Story:** As a user, I want the chatbot to handle errors gracefully so that I'm not stuck when something goes wrong.

**Priority:** P1 (Critical)

**Dependencies:** Foundation (T001-T034)

- [ ] T061 [P1] [US6] Implement MCP tool error catching in TodoAgent with ErrorHandler
    `backend/agents/todo_agent.py`
- [ ] T062 [P1] [US6] Create toast notification component for user-friendly error display
    `frontend/components/ui/toast.tsx`
- [ ] T063 [P1] [US6] Implement exponential backoff retry logic for network errors
    `frontend/hooks/useAgentChat.ts`
- [ ] T064 [P1] [US6] Add JWT expiration detection and automatic token refresh
    `frontend/lib/auth.ts`
- [ ] T065 [P1] [US6] Create user-friendly error message mappings for all error types
    `backend/agents/error_handler.py`
- [ ] T066 [P1] [US6] Test error handling: Network error, auth error, 404, validation error
    `tests/integration/test_error_handling.test.ts`

**Parallel Execution:** T061-T065 can be developed in parallel.

---

## Phase 9: US7 – Voice Input (BONUS +200)

**User Story:** As a user, I want to use voice commands to manage tasks so that I can be hands-free.

**Priority:** P3 (Bonus)

**Dependencies:** Foundation (T001-T034), US6 (T061-T066)

- [ ] T067 [P3] [US7] Create VoiceInputButton component with mic icon and pulsing animation
    `frontend/components/chat/VoiceInputButton.tsx`
- [ ] T068 [P3] [US7] Implement Web Speech API (SpeechRecognition) integration
    `frontend/lib/speechRecognition.ts`
- [ ] T069 [P3] [US7] Create waveform animation component for recording visual feedback
    `frontend/components/animations/WaveformAnimation.tsx`
- [ ] T070 [P3] [US7] Implement microphone permission request flow
    `frontend/components/chat/VoiceInputButton.tsx`
- [ ] T071 [P3] [US7] Handle speech recognition errors: permission denied, not-supported, no-speech
    `frontend/lib/speechRecognition.ts`
- [ ] T072 [P3] [US7] Create VoiceProcessor service to handle low-confidence transcripts
    `backend/services/voice_processor.py`
- [ ] T073 [P3] [US7] Integrate voice transcript with TodoAgent.process_message()
    `backend/routers/agent.py`
- [ ] T074 [P3] [US7] Test voice commands: "Add task to call mom tomorrow" → task created
    `tests/integration/test_voice_input.test.ts`

**Parallel Execution:** T067-T072 can be developed in parallel.

---

## Phase 10: US8 – Urdu Language Support (BONUS +100)

**User Story:** As a user, I want to interact with the chatbot in Urdu so that I can manage tasks in my preferred language.

**Priority:** P3 (Bonus)

**Dependencies:** Foundation (T001-T034), US1 (T035-T039)

- [ ] T075 [P3] [US8] Implement language detection for Urdu vs English input
    `backend/services/nlp_parser.py`
- [ ] T076 [P3] [US8] Create Urdu system prompt with cyberpunk personality in Urdu
    `backend/agents/prompts/system_prompt_urdu.py`
- [ ] T077 [P3] [US8] Add RTL (right-to-left) support to chatbot UI components
    `frontend/components/chat/ChatMessage.tsx`
- [ ] T078 [P3] [US8] Implement Cohere multilingual model for Urdu translation
    `backend/services/nlp_parser.py`
- [ ] T079 [P3] [US8] Test Urdu input: "مجھے کام شامل کریں" → task created
    `tests/integration/test_urdu_support.test.ts`

**Parallel Execution:** T075-T078 can be developed in parallel.

---

## Phase 11: New Features (Enhanced Task Management)

**Dependencies:** Foundation (T001-T034), US1-US6 (T035-T066)

### Priorities & Tags UI

- [ ] T080 [P1] [US1] Add priority badges to task cards with color coding (red/yellow/green)
    `frontend/components/tasks/TaskCard.tsx`
- [ ] T081 [P1] [US1] Add tag chips to task cards with hashtag styling
    `frontend/components/tasks/TaskCard.tsx`

### Due Dates & Browser Notifications

- [ ] T082 [P1] [US9] Add due date display to task cards with relative time ("Tomorrow 2pm")
    `frontend/components/tasks/TaskCard.tsx`
- [ ] T083 [P1] [US9] Implement browser notification request flow
    `frontend/lib/notifications.ts`
- [ ] T084 [P1] [US9] Create scheduleNotification() function for 15-minute reminders
    `frontend/lib/notifications.ts`
- [ ] T085 [P1] [US9] Integrate notification scheduling with task creation/update
    `frontend/hooks/useTasks.ts`

### Search & Filter UI

- [ ] T086 [P1] [US2] Integrate TaskFilters component with task list page
    `frontend/app/dashboard/page.tsx`

**Parallel Execution:** T080-T086 can be developed in parallel.

---

## Phase 12: Polish & Cross-Cutting Concerns

- [ ] T087 [P2] [USF] Add neon glow CSS classes for cyberpunk theme (#00d4ff, #ff00ff, #00ff88)
    `frontend/styles/globals.css`
- [ ] T088 [P2] [USF] Implement Framer Motion animations for chatbot open/close, message appear
    `frontend/components/chat/ChatWidget.tsx`
- [ ] T089 [P2] [USF] Add glassmorphism styling to chatbot widget
    `frontend/components/chat/ChatWidget.tsx`
- [ ] T090 [P2] [USF] Trigger confetti animation on task completion
    `frontend/components/tasks/TaskCard.tsx`
- [ ] T091 [P2] [USF] Implement CSV export functionality for tasks
    `frontend/lib/exportTasks.ts`
- [ ] T092 [P2] [USF] Implement JSON export functionality for tasks
    `frontend/lib/exportTasks.ts`
- [ ] T093 [P2] [USF] Add recurring task icon to task cards
    `frontend/components/tasks/TaskCard.tsx`
- [ ] T094 [P2] [USF] Reduce chatbot widget height to 60% of viewport
    `frontend/components/chat/ChatWidget.tsx`

**Parallel Execution:** T087-T094 can be developed in parallel.

---

## Dependencies & Execution Order

### Critical Path (Must Complete Sequentially):

```
Foundation (T001-T034)
  ↓
US1: Task Creation (T035-T039)
  ↓
US2: Task Queries (T040-T044)
  ↓
US3: Task Updates (T045-T050)
  ↓
US4: Task Deletion (T051-T055)
  ↓
US5: Multi-Turn (T056-T060) [Can parallel with US6]
US6: Error Handling (T061-T066) [Can parallel with US5]
  ↓
US7: Voice Input (T067-T074) [Bonus - requires US6]
US8: Urdu Support (T075-T079) [Bonus - requires US1]
  ↓
New Features (T080-T086)
  ↓
Polish (T087-T094)
```

### Parallel Execution Groups:

**Group A (Foundation):** T001-T004 can run in parallel after project setup

**Group B (Database):** T005-T009 can run in parallel (all database migrations)

**Group C (JWT/Auth):** T010-T012 can run in parallel

**Group D (MCP Tools):** T013-T020 can run in parallel after JWT is ready

**Group E (Agent):** T021-T026 can run in parallel after MCP tools are ready

**Group F (API):** T027-T029 can run in parallel after agent is ready

**Group G (Frontend):** T030-T034 can run in parallel after API is ready

**Group H (US1):** T035-T038 can run in parallel after foundation

**Group I (US2):** T040-T043 can run in parallel after US1

**Group J (US3):** T045-T049 can run in parallel after US2

**Group K (US4):** T051-T054 can run in parallel after US3

**Group L (US5):** T056-T059 can run in parallel after US3

**Group M (US6):** T061-T065 can run in parallel after foundation

**Group N (US7):** T067-T072 can run in parallel after US6

**Group O (US8):** T075-T078 can run in parallel after US1

**Group P (New Features):** T080-T086 can run in parallel after US1-US6

**Group Q (Polish):** T087-T094 can run in parallel after new features

---

## Testing Strategy

### Unit Tests (Per Task)
- Each task T035-T094 includes corresponding test file reference
- Run: `npm test` for frontend, `pytest` for backend

### Integration Tests (Per User Story)
- T039: US1 integration test (natural language task creation)
- T044: US2 integration test (natural language queries)
- T050: US3 integration test (multi-turn updates with confirmation)
- T055: US4 integration test (deletion with confirmation)
- T060: US5 integration test (context awareness)
- T066: US6 integration test (error handling)
- T074: US7 integration test (voice input)
- T079: US8 integration test (Urdu language support)

### End-to-End Tests
- Run: `npm run test:e2e` after all phases complete

---

## Bonus Strategy

### Voice Input (+200 points)
- Tasks: T067-T074
- Requirements: Web Speech API, waveform animation, error handling
- Acceptance: User can say "Add task to call mom" → task created

### Urdu Language Support (+100 points)
- Tasks: T075-T079
- Requirements: Language detection, RTL UI, multilingual model
- Acceptance: User types "مجھے کام شامل کریں" → task created

### Cloud-Native Blueprints (+200 points)
- Create Kubernetes manifests for deployment
- Docker multi-stage builds for frontend/backend
- Vercel/Railway deployment configs

### Reusable Intelligence (+200 points)
- Modular MCP tool architecture
- Reusable NLP parsing components
- Agent orchestration patterns

**Total Bonus Potential: +700 points**

---

## Risk Mitigation

| Risk | Mitigation | Tasks |
|------|------------|-------|
| Cohere API rate limits | Implement exponential backoff (T063) | US6 |
| SWR polling overhead | Set 30s interval, revalidate on focus only (T030) | Foundation |
| MCP tool user_id leaks | Validate user_id in all tools (T020) | Foundation |
| Speech recognition browser support | Fallback to text input (T071) | US7 |
| JWT expiration | Auto-refresh token (T064) | US6 |
| Context window overflow | Limit to 10 messages (T021) | Foundation |

---

## Definition of Done

Each task is complete when:
- [ ] Code is written following specifications
- [ ] File is saved at specified path
- [ ] Code is linted (ESLint/Pylint)
- [ ] Changes are committed to git
- [ ] Test file is created (if applicable)
- [ ] Integration test passes (if applicable)

**Phase is complete when:**
- [ ] All tasks in phase are marked complete
- [ ] Integration tests for phase pass
- [ ] No console errors in browser/dev server
- [ ] Real-time updates work (SWR cache invalidates)
- [ ] Chatbot responds with cyberpunk personality

---

## Next Steps

1. **Start Phase 1:** Run T001-T004 to install dependencies
2. **Complete Foundation:** Run T005-T034 sequentially
3. **Implement User Stories:** Follow T035-T055 path for US1-US4
4. **Add Bonuses:** Implement T067-T079 for voice + Urdu
5. **Polish:** Complete T087-T094 for cyberpunk theme

**Estimated Timeline:** 4 days (7 phases as per plan.md)

---

**End of tasks.md**

**Version:** 1.0 | **Last Updated:** 2026-02-11 | **Status:** Ready for Implementation
