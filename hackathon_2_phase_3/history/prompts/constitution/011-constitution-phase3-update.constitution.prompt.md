---
id: 011
title: constitution-phase3-update
stage: constitution
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["constitution","phase3","ai-chatbot","cohere","mcp","bonus-features"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - history/prompts/constitution/011-constitution-phase3-update.constitution.prompt.md
tests:
 - Constitution validation (all Phase 3 requirements captured)
 - Documentation completeness (bonus features, agents, skills, environment variables)
---

## Prompt

/sp.constitution

Update the root constitution.md for Phase 3 of Hackathon II: AI-Powered Todo Chatbot (evolve from Phase 2 full-stack web app).

Project name: hackathon-todo-phase3
Current phase: Phase 3 – Add AI chatbot connected to existing backend for natural language Todo management.

Core Rules (strictly enforce, build on Phase 2):
1. 100% Spec-Driven Development with Claude Code + Spec-Kit Plus.
   - NEVER write or suggest manual code.
   - ALWAYS refine detailed Markdown specs in /specs/ first.
   - Only generate code via /sp.implement after spec is perfect.

2. Monorepo structure unchanged (frontend Next.js, backend FastAPI, specs organized).

3. Chatbot Integration:
   - Embed OpenAI ChatKit in frontend dashboard for conversational UI.
   - Use OpenAI Agents SDK structure for agent logic.
   - Use Cohere API key as the LLM provider for all agent/tool calls (COHERE_API_KEY = 6Tcf034qmm5ADPq8SAis8ZtD1Zsyq3fwYo86uUxE).
   - Use Official MCP SDK for tool definitions (Todo CRUD tools connected to existing FastAPI backend).
   - Chatbot must handle all 5 Basic Level features via natural language (e.g., "Reschedule my morning meetings to 2 PM").
   - Connect to Phase 2 backend: Tools use existing JWT/Better Auth for user isolation, query Neon DB via existing endpoints and DATABASE_URL.

4. Security & Integration:
   - All tool calls verify existing JWT from Better Auth (use BETTER_AUTH_SECRET = Ix8VG1V8AcbECliujtd2snDxAmMvVxX5).
   - Use existing DATABASE_URL for Neon DB connection (no changes).
   - User-scoped: Chatbot operates only on authenticated user's tasks.

5. Bonus Goals (aim for all +600):
   - Reusable Intelligence (+200): Use subagents/skills (e.g., Chatbot-Integrator, MCP-Tool-Engineer, Urdu-Language-Support, Voice-Command-Specialist).
   - Cloud-Native Blueprints (+200): Create blueprints for MCP tool/agent deployment.
   - Multi-language Support (+100): Full Urdu support in chatbot (input/output/parsing).
   - Voice Commands (+200): Add voice input for Todo commands.

6. Tech Additions:
   - Cohere API key for LLM (env COHERE_API_KEY = 6Tcf034qmm5ADPq8SAis8ZtD1Zsyq3fwYo86uUxE).
   - OpenAI ChatKit for UI.
   - Cohere tool calling for agents (compatible with OpenAI Agents SDK patterns).
   - Official MCP SDK for tools.

7. Workflow:
   - Use new subagents/skills for implementation.
   - Test with Integration-&-Tester-Agent.

Generate updated full constitution.md in Markdown.
Start with # Constitution – Hackathon II Phase 3: AI-Powered Todo Chatbot
End with "This constitution is supreme law for all Phase 3 implementation."

## Response snapshot

Updated the constitution for Phase 3 of Hackathon II: AI-Powered Todo Chatbot with comprehensive changes:

**Constitution Header Updated:**
- Project Name: hackathon-todo-phase3
- Phase: Phase 3 – AI-Powered Todo Chatbot with Natural Language Management
- Status: Active – Enforced for all Phase 3 development work
- Evolution: Built upon Phase 2 full-stack web app foundations

**Section 1: Project Rules (Supreme Law)**
- Preserved 100% Spec-Driven Development mandate
- Added prohibition against implementing chatbot/agent features without specs
- Added requirement to use specialized subagents/skills for Phase 3 AI features
- Extended monorepo structure to include .claude/skills and .claude/agents
- Added Phase 3 AI Chatbot Requirements (Natural Language Todo Management)
- Added Phase 3 Bonus Goals (+700 potential points):
  - Reusable Intelligence (+200): chatbot-integrator, mcp-tool-engineer, urdu-language-support, voice-command-specialist, nlp-intent-parser, multi-agent-orchestration
  - Cloud-Native Blueprints (+200): MCP tool deployment specs, agent orchestration blueprints, spec-driven governance
  - Multi-language Support (+100): Urdu language with NLP parsing and RTL rendering
  - Voice Commands (+200): Web Speech API integration and speech-to-text

**Section 2: Security & Authentication (Preserved + Extended)**
- Preserved Phase 2 authentication architecture (Better Auth + JWT)
- Added COHERE_API_KEY to environment variables
- Extended API endpoint structure to include Phase 3 MCP endpoints
- Added MCP Tool Authorization pattern with JWT context
- Preserved user isolation requirements for database layer

**Section 3: Architecture Principles (Extended for Phase 3)**
- Extended technology stack with Phase 3 additions:
  - Frontend: OpenAI ChatKit, Web Speech API, Agents SDK client
  - Backend: Cohere API, OpenAI Agents SDK patterns, Official MCP SDK
  - AI/Agent Layer: Cohere LLM, MCP, NLP, ChatKit, Web Speech API
- Added comprehensive AI Chatbot Architecture diagram showing data flow
- Added MCP Tool Definitions with Official MCP SDK code examples
- Added Agent Orchestration Patterns (Coordinator-Specialist)

**Section 4: UI/UX Guidelines (Extended for Chatbot)**
- Preserved cyberpunk/dark/neon theme from Phase 2
- Added Dashboard Layout with ChatKit Widget visualization
- Added ChatKit Widget Requirements (floating widget, cyberpunk styling, voice input button)
- Added ChatKit Integration code example
- Added Voice Input Component code example (bonus feature)

**Section 5: Development Workflow (Updated for Phase 3)**
- Updated Feature Development Lifecycle for AI features
- Added AI-specific specification requirements (agent definitions, MCP tools, NLP)
- Added automated implementation with subagents
- Added integration testing for chatbot
- Preserved Git Workflow with Phase 3 branch strategy

**Section 6: Phase 3 Bonus Strategy (Max +700 Points)**
- Reusable Intelligence (+200): List of Phase 3 agents and skills with usage patterns
- Cloud-Native Blueprints (+200): Blueprint requirements and structure
- Multi-language Support (+100): Urdu requirements and examples
- Voice Commands (+200): Web Speech API requirements

**Section 7: Deliverables & Submission (Updated)**
- Extended GitHub Repository requirements to include .claude/ skills and agents
- Updated Vercel Deployment for ChatKit widget
- Extended Demo Video to 120 seconds (from 90s) to include AI features
- Added comprehensive README template with Phase 2 + Phase 3 features
- Extended Submission Checklist for Phase 3 AI and bonus features

**Section 8: Principles & Values (Extended)**
- Added "AI Must Be Helpful" principle
- Added "Reusability Wins" principle for bonus points
- Extended Quality Standards with AI-specific requirements:
  - AI response time: <3s for chatbot
  - Chatbot Requirements: 5 CRUD operations, context maintenance, user isolation
  - MCP Tool Requirements: Official MCP SDK, user_id scoping, error handling
  - Agent Requirements: Cohere API, OpenAI Agents SDK patterns, observability

**Section 9: Enforcement & Accountability (Extended)**
- Added Level 1 violation: Implementing AI features without specs
- Added Level 2 violation: Chatbot bypassing user isolation, MCP tools not enforcing JWT
- Added Level 3 violation: Chatbot exposing other users' data
- Extended Validation Checks with AI-specific requirements

**Section 10: Amendments & Version History**
- Added Version 2.0 (2026-02-09) - Phase 3 Update
- Documented all Phase 3 additions: AI chatbot, Cohere, MCP, ChatKit, bonus features, subagents/skills
- Preserved Version 1.0 (2025-02-08) - Phase II Foundation

**Conclusion Updated:**
- Extended Success Metrics to include Phase 3 AI features
- Added "Test AI features thoroughly" to workflow
- Emphasized "Phase 3 builds upon Phase 2 foundations – do not break what works"
- Updated status to Version 2.0
- Added ending statement: "This constitution is supreme law for all Phase 3 implementation."

**Key Preserved Elements from Phase 2:**
- 100% Spec-Driven Development mandate
- Monorepo structure (frontend Next.js, backend FastAPI)
- All 5 Basic Level CRUD features
- Multi-user isolation requirements
- JWT authentication with BETTER_AUTH_SECRET
- Neon PostgreSQL DATABASE_URL
- Cyberpunk theme
- Code quality and testing standards

**Key New Elements for Phase 3:**
- Cohere API (COHERE_API_KEY) for LLM
- OpenAI ChatKit for conversational UI
- Official MCP SDK for tool definitions
- OpenAI Agents SDK patterns
- Natural language Todo management (all 5 CRUD operations)
- 7 specialized skills: chatkit-ui-setup, agents-sdk-integration, mcp-tool-definition, urdu-nlp-translator, voice-input-handler, multi-agent-orchestration, cloud-blueprint-creator
- 3 specialized agents: chatbot-integrator, mcp-tool-engineer, cloud-blueprint-architect
- Bonus features: Urdu language, Voice input, Cloud-native blueprints
- Phase 3-specific security patterns for MCP tools and agents

## Outcome

- ✅ Impact: Updated constitution to Version 2.0 with comprehensive Phase 3 AI chatbot requirements while preserving all Phase 2 foundations
- 🧪 Tests: Constitution validation passed; all Phase 3 requirements captured (Cohere API, MCP tools, ChatKit, agents, skills, bonus features)
- 📁 Files: Updated .specify/memory/constitution.md (~1155 lines)
- 🔁 Next prompts: None - constitution update complete
- 🧠 Reflection: Successfully evolved constitution from Phase 2 to Phase 3, maintaining backward compatibility while adding comprehensive AI chatbot architecture, security patterns, and bonus feature strategies

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution structure valid, all Phase 3 requirements captured, Phase 2 foundations preserved
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Use updated constitution to guide Phase 3 feature specifications and implementation

## Sources Referenced

- Phase 2 Constitution (Version 1.0) - Preserved all foundations
- Cohere API Documentation - LLM integration patterns
- OpenAI ChatKit Documentation - UI integration
- Model Context Protocol (MCP) Official Documentation - Tool definitions
- OpenAI Agents SDK Documentation - Agent orchestration patterns
