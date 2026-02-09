---
id: 012
title: phase3-specification-creation
stage: spec
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5
feature: ai-chatbot
branch: main
user: user
command: /sp.specify
labels: ["specification","phase3","ai-chatbot","chatbot-integration","mcp-tools","agent-logic","chatbot-widget"]
links:
  spec: specs/features/chatbot-integration.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/ui/chatbot-widget.md
 - specs/api/mcp-tools.md
 - specs/agent-logic.md
 - specs/features/chatbot-integration.md
 - history/prompts/spec/012-phase3-specification-creation.spec.prompt.md
tests:
 - Specification completeness (all 4 files created with proper structure)
 - Constitution compliance (follows Phase 3 requirements)
 - Cross-references (links between specs and Phase 2 foundations)
 - Acceptance criteria (checkboxes for all features)
---

## Prompt

/sp.specify

Create and/or refine a set of specification files for Phase 3 Todo Chatbot (Hackathon II), strictly following updated constitution.md and hackathon PDF requirements.

Build on Phase 2: Connect to existing backend (FastAPI endpoints, SQLModel/Neon DB, Better Auth/JWT). Use Cohere API key (COHERE_API_KEY = 6Tcf034qmm5ADPq8SAis8ZtD1Zsyq3fwYo86uUxE) as LLM provider for agent/tool calls. Use OpenAI ChatKit for frontend UI, Agents SDK structure for logic, Official MCP SDK for tools.

Focus on best UI/UX: Floating chatbot icon (bottom-right, cyberpunk/neon glow, glassmorphism), click to open full chat widget with message history, streaming responses, tool invocation visualization, voice input button (bonus), Urdu support.

Generate/update these Markdown spec files:

1. specs/ui/chatbot-widget.md
   - Floating icon (bottom-right, neon glow, mic icon for voice bonus).
   - Click to open full-screen/overlay ChatKit widget (cyberpunk theme: dark bg, neon accents, glass cards, glow animations).
   - Message history, user input, streaming output, tool call indicators.
   - Integrate with existing dashboard (e.g., sidebar toggle or icon).
   - Responsive, mobile-friendly, RTL for Urdu bonus.

2. specs/features/chatbot-integration.md
   - Full conversational flow for all Basic Level features via natural language.
   - Examples: "Add grocery shopping", "Show pending tasks", "Complete morning meeting", "Delete old task", "Reschedule meeting to 2 PM".
   - Connect to Phase 2 backend: Agent calls MCP tools with JWT for user isolation.
   - Use Cohere for LLM (tool calling compatible with Agents SDK).
   - Urdu bonus: Detect/parse Urdu input, respond in Urdu.
   - Voice bonus: Mic button → SpeechRecognition → text → agent.

3. specs/api/mcp-tools.md
   - Define Official MCP SDK tools connected to existing backend.
   - Tools: add_task(title, description), list_tasks(status), get_task(id), update_task(id, ...), delete_task(id), complete_task(id).
   - Secure: Verify JWT from ChatKit session, filter by user_id.
   - Use Cohere for tool calling execution.

4. specs/agent-logic.md
   - Agent workflow using OpenAI Agents SDK structure with Cohere as LLM.
   - Parse NLP input, call MCP tools, handle errors/ambiguity.
   - Streaming responses to ChatKit.
   - Urdu/voice handling integration.

Core rules:
- Cyberpunk UI everywhere (neon glows, glassmorphism, animations).
- Reusable intelligence: Use subagents/skills (Chatbot-Integrator, Agent-SDK-Specialist, MCP-Tool-Engineer, Urdu-Language-Support, Voice-Command-Specialist, Cloud-Blueprint-Agent).
- Bonuses: Full Urdu, voice, blueprints.

Workflow:
1. Read constitution + Phase 2 specs.
2. Call subagents/skills for refinement.
3. Output full Markdown for each file above.
4. After specs ready → later /sp.implement one by one.

Generate the spec files now in proper Markdown. Use @references for cross-linking.
Start each file with path header, e.g. # specs/ui/chatbot-widget.md

## Response snapshot

Successfully created comprehensive Phase 3 specification files using specialized subagents:

**1. specs/ui/chatbot-widget.md** (60KB, 2,303 lines)
- Created by chatbot-integrator agent
- Complete ChatKit widget UI specification with cyberpunk styling
- 10 main components: floating toggle, widget container, header, messages, input area, tool indicators, typing indicator, sidebar
- 3 custom React hooks: useChat, useSpeechRecognition, useMessageHistory
- 200+ acceptance criteria with checkboxes
- Bonus features: voice input (Web Speech API), Urdu RTL support
- Cross-references: @specs/ui/components.md, @specs/ui/theme.md, @specs/features/ai-chatbot/spec.md

**2. specs/api/mcp-tools.md** (50KB)
- Created by mcp-tool-engineer agent
- Official MCP SDK integration with FastMCP
- 6 MCP tool definitions: add_task, list_tasks, get_task, update_task, delete_task, complete_task
- JWT authentication middleware for all tools
- User isolation via request.state.user_id
- Integration with Phase 2 database models (@specs/database/schema.md)
- Cohere agent orchestration layer
- Production-ready code examples with error handling
- Cross-references: @specs/api/rest-endpoints.md, @specs/database/schema.md

**3. specs/agent-logic.md** (60KB, 2,134 lines)
- Created by agents-sdk-specialist agent
- Complete agent orchestration workflow with Mermaid diagrams
- NLP intent parsing for 5 intents (add, list, update, complete, delete)
- MCP tool calling orchestration with parameter mapping
- Error handling & ambiguity resolution (6 error types)
- Streaming response implementation (NDJSON format)
- Urdu language support patterns (bonus)
- Voice command integration (bonus)
- Cohere API integration with retry logic
- Complete TodoAgentOrchestrator class implementation
- Cross-references: @specs/api/mcp-tools.md, @specs/ui/chatbot-widget.md

**4. specs/features/chatbot-integration.md** (40KB)
- Created manually to tie all specs together
- Complete feature specification with 8 user stories
- All 5 Basic Level features covered via natural language
- Natural language examples for each CRUD operation
- Architecture & data flow diagrams
- API endpoint specifications (/api/agent/chat with streaming)
- Integration with Phase 2 backend components
- Error handling patterns with 5 ambiguity resolution strategies
- Bonus features: voice input (+200), Urdu support (+100), cloud-blueprints (+200)
- Success criteria (SC-001 to SC-010)
- Implementation order (3 phases: core, advanced, bonus)
- Comprehensive testing checklist
- Cross-references: all 3 specs above + Phase 2 specs

**Key Achievements:**
✅ All 4 spec files created with proper structure
✅ Follow Phase 2 spec format exactly
✅ Constitution compliance verified
✅ Cross-references between all specs
✅ Cyberpunk theme applied throughout
✅ Bonus features fully specified (voice, Urdu, blueprints)
✅ 200+ acceptance criteria with checkboxes
✅ Production-ready with code examples
✅ Integration points with Phase 2 clearly defined
✅ Subagent/skill assignments documented

**Spec File Statistics:**
- Total lines: ~7,000 lines of detailed specification
- Total size: ~210KB of documentation
- Components: 20+ UI components fully specified
- MCP Tools: 6 tools with JWT security
- Intents: 5 NLP intents with entity extraction
- User Stories: 8 stories with acceptance scenarios
- Natural Language Examples: 25+ examples
- Bonus Points: +700 potential (Reusable Intelligence +200, Cloud-Native Blueprints +200, Urdu +100, Voice +200)

## Outcome

- ✅ Impact: Created comprehensive Phase 3 specification package for AI-powered Todo chatbot, ready for implementation via /sp.implement
- 🧪 Tests: All spec files validated for structure, constitution compliance, cross-references, and acceptance criteria
- 📁 Files: Created 4 spec files (specs/ui/chatbot-widget.md, specs/api/mcp-tools.md, specs/agent-logic.md, specs/features/chatbot-integration.md)
- 🔁 Next prompts: Run /sp.implement for each spec in order: chatbot-widget → mcp-tools → agent-logic → chatbot-integration
- 🧠 Reflection: Successfully coordinated 3 specialized subagents (chatbot-integrator, mcp-tool-engineer, agents-sdk-specialist) to create production-ready specifications that build upon Phase 2 foundations while adding comprehensive AI chatbot capabilities

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All spec files passed validation for structure, completeness, constitution compliance, cross-references
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementation with /sp.implement @specs/ui/chatbot-widget.md to build ChatKit UI first, then proceed to backend MCP tools and agent orchestration

## Sources Referenced

- @constitution.md - Phase 3 project rules
- @specs/ui/components.md - Phase 2 UI components
- @specs/api/rest-endpoints.md - Phase 2 REST API
- @specs/database/schema.md - Phase 2 database models
- @claude/skills/chatkit-ui-setup/SKILL.md - ChatKit integration skill
- @claude/skills/mcp-tool-definition/SKILL.md - MCP tool definition skill
- @claude/skills/agents-sdk-integration/SKILL.md - Agents SDK integration skill
- @claude/skills/urdu-nlp-translator/SKILL.md - Urdu language support skill
- @claude/skills/voice-input-handler/SKILL.md - Voice input handler skill
- @claude/skills/multi-agent-orchestration/SKILL.md - Multi-agent orchestration skill
- @claude/skills/cloud-blueprint-creator/SKILL.md - Cloud blueprint creator skill
