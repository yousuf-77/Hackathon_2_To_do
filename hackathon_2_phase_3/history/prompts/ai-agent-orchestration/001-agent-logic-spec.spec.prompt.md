---
id: 001
title: Agent orchestration specification for Phase 3
stage: spec
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5
feature: agent-orchestration
branch: main
user: yousuf
command: (manual)
labels: ["specification","phase3","agent-orchestration","nlp","mcp-tools"]
links:
  spec: specs/agent-logic.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/agent-logic.md
tests:
  - (no tests run - specification only)
---

## Prompt

Create specs/agent-logic.md specification for Phase 3 agent orchestration.

Requirements from constitution:
- Use OpenAI Agents SDK structure with Cohere as LLM 
- Parse NLP input, call MCP tools, handle errors/ambiguity
- Streaming responses to ChatKit
- Urdu/voice handling integration
- Handle all 5 Basic Level features via natural language

Examples to support:
- "Add grocery shopping" → add_task tool
- "Show pending tasks" → list_tasks with status=pending
- "Complete morning meeting" → complete_task tool
- "Delete old task" → delete_task (ask clarification if ambiguous)
- "Reschedule meeting to 2 PM" → update_task with time entity

The spec should include:
1. Overview section with status, priority, dependencies
2. Agent workflow architecture (diagram)
3. NLP intent parsing patterns
4. MCP tool calling orchestration
5. Error handling and ambiguity resolution
6. Streaming response implementation
7. Urdu language support patterns (@specs/features/urdu-support.md - bonus)
8. Voice command integration (@specs/features/voice-input.md - bonus)
9. Cohere API integration patterns
10. Acceptance criteria (checkboxes)
11. Testing checklist

Make it production-ready with proper error handling. Use @references for cross-linking.

## Response snapshot

Created comprehensive specification at `/mnt/e/Hackathon_2_To_do/hackathon_2_phase_3/specs/agent-logic.md` covering:

**Core Sections:**
1. Overview with technology stack (Cohere API, OpenAI Agents SDK patterns, MCP protocol)
2. Mermaid architecture diagram showing full workflow from user input → language detection → NLP parsing → agent routing → MCP tools → database → streaming response
3. 5 intent categories (add_task, list_tasks, update_task, complete_task, delete_task) with entity extraction patterns
4. Complete MCP tool definitions using Official MCP SDK (FastMCP) with all 5 Todo CRUD tools
5. Detailed parameter mapping from natural language to tool calls with examples
6. Comprehensive error handling taxonomy (6 error types) with recovery strategies
7. Ambiguity resolution patterns for fuzzy task matching, missing parameters, invalid dates
8. Streaming response implementation using NDJSON format with real-time status updates
9. Urdu language support (bonus) with detection, translation, and RTL rendering
10. Voice command integration (bonus) using Web Speech API
11. Cohere API integration patterns with retry logic and fallback parsing
12. Complete TodoAgentOrchestrator class with async generators for streaming

**Key Features:**
- User isolation enforced via JWT on all MCP tool calls
- Exponential backoff retry logic for tool failures
- Rule-based fallback parsing when LLM fails
- 10+ natural language command examples covering all 5 CRUD operations
- Production-ready error messages with actionable suggestions
- Cross-references to existing Phase 2 specs (@specs/features/task-crud-backend.md, @specs/api/rest-endpoints.md)
- 13 sections with detailed implementation patterns
- 11 subsections of acceptance criteria with checkboxes
- 4 testing checklists (unit, integration, E2E, security)

**Bonus Features Covered:**
- Urdu language detection (>30% Urdu characters), translation via Cohere multilingual model, RTL CSS rendering
- Voice input with Web Speech API, real-time transcription, visual feedback

## Outcome

- ✅ Impact: Created production-ready specification for Phase 3 agent orchestration covering all 5 Basic Level features with natural language processing, MCP tool integration, streaming responses, and bonus features (Urdu + voice)
- 🧪 Tests: No tests run (specification only)
- 📁 Files: Created specs/agent-logic.md (13 sections, ~1300 lines)
- 🔁 Next prompts: Run `/sp.implement @specs/agent-logic.md` to implement the agent orchestration layer
- 🧠 Reflection: Specification successfully bridges Phase 2 REST API foundation with Phase 3 AI chatbot requirements. All natural language examples from user prompt are covered with detailed intent parsing and tool calling patterns.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate specification completeness by reviewing against constitution Section 3.2-3.4 requirements before implementation
