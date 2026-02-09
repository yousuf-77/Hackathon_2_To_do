---
id: 005
title: create-agents-sdk-skill
stage: general
date: 2025-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /skill skill-creator-pro
labels: ["skill-creation","agents-sdk","fastapi","openai","mcp"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/agents-sdk-integration/SKILL.md
 - history/prompts/general/005-create-agents-sdk-skill.general.prompt.md
tests:
 - Skill file validation (YAML frontmatter, structure, <500 lines)
 - Documentation completeness (installation, agent config, tools, endpoints, error handling)
---
## Prompt

Use skill-creator-pro to create a new production-grade reusable skill called "agents-sdk-integration".

Skill purpose: Help Claude set up OpenAI Agents SDK in FastAPI backend for Phase 3. Create agents that parse natural language input and call MCP tools for Todo CRUD, with robust error handling and intent extraction. Reference OpenAI Agents SDK docs and examples (function_tool, agent loop).

Skill Type: Hybrid (Builder + Guide)

Auto-Activation Triggers: Agents SDK setup, agent workflows, NLP parsing for Todo commands, tool calling with MCP, Phase 3 chatbot logic, natural language intent extraction, OpenAI agent integration

Domain: OpenAI Agents SDK with FastAPI backend integration

Step-by-Step Content to Include:
1. Installation: pip install openai, agents SDK setup
2. Agent configuration: function_tool decorators, agent loop setup
3. NLP intent parsing: Extract user intents from natural language (e.g., "add task buy groceries")
4. MCP tool integration: Connect to MCP tools for Todo CRUD operations
5. JWT verification: Verify user identity before tool execution
6. Error handling: Retry logic, graceful failures, user-friendly error messages
7. Code skeletons: Spec-form examples for agent setup, tool definitions, FastAPI endpoints
8. Integration: Connect with existing FastAPI backend and JWT middleware

YAML Frontmatter Required:
- name: agents-sdk-integration
- description: Clear purpose statement about Agents SDK for FastAPI
- allowed-tools: Appropriate tool restrictions
- related_skills: Dependencies on fastapi-jwt-middleware, mcp-tool-engineer, nlp-intent-parser, chatbot-integrator

Make it high-quality with comprehensive workflows, code skeletons, error handling patterns, and best practices for production deployment.

## Response snapshot

Created the "agents-sdk-integration" production-grade hybrid skill with the following components:

**Skill Metadata (YAML Frontmatter):**
- name: agents-sdk-integration
- description: Comprehensive guide for OpenAI Agents SDK in FastAPI with NLP parsing, MCP tools, and JWT security
- allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
- related_skills: fastapi-jwt-middleware-neon, mcp-tool-engineer, nlp-intent-parser, chatbot-integrator, nextjs-api-client-with-jwt

**Key Sections Included:**
1. Quick Start: Installation with pip install openai[agents], environment configuration
2. Project Structure: Recommended file layout for agents/ directory
3. Agent Configuration: Complete create_todo_agent() function with system prompt and tool definitions
4. Agent Conversation Loop: run_agent_conversation() with tool calling, iteration limits, and error handling
5. MCP Tool Integration: Function tool definitions for all Todo CRUD operations (create, list, update, delete, toggle)
6. Tool Execution: execute_tool_call() routing function with database session management
7. FastAPI Endpoints: /api/agent/chat endpoint with JWT security and response schemas
8. Error Handling: Comprehensive error handler with retry logic, rate limiting, and user-friendly messages
9. Configuration Updates: Settings class additions for agent configuration
10. Integration Guide: How to add agent router to main app
11. Testing Strategy: Unit tests for tool execution and integration tests for agent flow
12. 16-point Quality Assurance Checklist

**Code Skeletons Provided:**
- Agent creation with OpenAI client and system prompt
- Function tool definitions for create_task, list_tasks, update_task, delete_task, toggle_task
- Async tool execution wrappers with database operations
- FastAPI router with /chat and /parse endpoints
- Pydantic schemas for request/response validation
- Error handling with exponential backoff retry
- Configuration class updates

**Integration Points:**
- JWT verification via existing get_current_user dependency
- User isolation enforced in all tool calls
- SQLModel async session integration
- Existing error handler patterns

Saved to: `.claude/skills/agents-sdk-integration/SKILL.md`

## Outcome

- ✅ Impact: Created reusable skill that enables autonomous OpenAI Agents SDK integration for FastAPI backends with NLP parsing and MCP tool calling
- 🧪 Tests: Skill structure validation passed; includes testing strategy with unit/integration tests
- 📁 Files: Created SKILL.md (~500 lines with comprehensive code examples)
- 🔁 Next prompts: None - skill ready for use
- 🧠 Reflection: Successfully integrated domain knowledge from OpenAI Agents SDK docs, existing FastAPI backend structure (JWT middleware, Todo routes, SQLModel), and MCP tool patterns

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Skill frontmatter valid, structure follows skill-creator-pro guidelines, related to existing backend skills (JWT middleware, MCP tools)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill activation by triggering with "Agents SDK" or "agent workflows" mentions in future prompts

## Sources Referenced

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-python/)
- [Building Production-Ready AI Agents with FastAPI](https://dev.to/parupati/building-production-ready-ai-agents-with-openai-agents-sdk-and-fastapi-abd)
- [AI-Powered APIs with FastAPI and Agents SDK](https://blog.devgenius.io/building-ai-powered-apis-with-fastapi-and-openai-agents-sdk-deployment-on-hugging-face-2ce34d3eb766)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Agents SDK Tools Documentation](https://openai.github.io/openai-agents-python/tools/)
- [OpenAI Agents SDK on GitHub](https://github.com/openai/openai-agents-python/releases)
