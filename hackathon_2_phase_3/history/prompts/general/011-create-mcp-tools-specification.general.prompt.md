---
id: 011
title: create-mcp-tools-specification
stage: spec
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: yousuf
command: Claude Code conversation
labels: ["mcp", "tools", "specification", "phase3", "ai-chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/e/Hackathon_2_To_do/hackathon_2_phase_3/specs/api/mcp-tools.md
tests:
  - Specification validation pending implementation
---

## Prompt

Create specs/api/mcp-tools.md specification for Phase 3 MCP tool definitions.

Requirements from constitution:
- Use Official MCP SDK for tool definitions
- Tools: add_task(title, description), list_tasks(status), get_task(id), update_task(id, ...), delete_task(id), complete_task(id)
- Secure: Verify JWT from ChatKit session, filter by user_id
- Use Cohere for tool calling execution
- Connect to existing Phase 2 backend endpoints (@specs/api/rest-endpoints.md)

The spec should follow the same format as specs/api/rest-endpoints.md (Phase 2) and include:
1. Overview section with status, priority, dependencies
2. MCP server setup (Official MCP SDK)
3. Tool definitions (all 5 Todo CRUD tools)
4. JWT authentication for MCP endpoints
5. Request/response schemas (JSON Schema)
6. Error handling and user isolation
7. Integration with existing Phase 2 database models (@specs/database/schema.md)
8. Code examples for MCP tool decorators
9. Acceptance criteria (checkboxes)
10. Testing checklist

Make it production-ready with proper security patterns. Use @references for cross-linking.

## Response snapshot

Created comprehensive MCP tools specification at specs/api/mcp-tools.md with the following sections:

1. **Overview**: Defined MCP server architecture using Official MCP SDK, authentication via JWT, and Cohere integration for tool calling.

2. **MCP Server Setup**: FastMCP server initialization with stdio/SSE transport options, tool registration patterns.

3. **JWT Authentication**: Middleware implementation for verifying tokens from ChatKit sessions, extracting user_id, and enforcing user isolation at request level.

4. **Tool Definitions** (6 tools implemented):
   - `add_task`: Create new tasks with validation
   - `list_tasks`: List user's tasks with filtering/sorting
   - `get_task`: Get single task with ownership check
   - `update_task`: Partial updates with ownership check
   - `delete_task`: Delete with ownership check
   - `complete_task`: Toggle/set completion status

5. **Request/Response Schemas**: Complete JSON Schema definitions for all tool inputs and outputs.

6. **Error Handling**: Comprehensive error taxonomy (Unauthorized, ValidationError, NotFound, InternalServerError) with user isolation guarantees.

7. **Phase 2 Integration**: Reuses existing Task model, JWT verification, and database schema without migrations.

8. **Cohere Integration**: Agent orchestration layer for natural language processing and tool calling.

9. **Code Examples**: Production-ready implementations with proper error handling, validation, and security patterns.

10. **Acceptance Criteria & Testing**: Complete checklists for security, functionality, validation, integration, and E2E testing.

All tools enforce strict user isolation via JWT verification and database query filtering. Security patterns prevent data leakage between users. Specification is ready for implementation via `/sp.implement`.

## Outcome

- ✅ Impact: Created production-ready MCP tools specification for Phase 3 AI chatbot, enabling secure Todo CRUD operations via natural language
- 🧪 Tests: Specification includes comprehensive testing checklist covering unit, integration, security, and E2E tests
- 📁 Files: Created specs/api/mcp-tools.md (800+ lines) with complete tool definitions, schemas, and code examples
- 🔁 Next prompts: Request `/sp.implement @specs/api/mcp-tools.md` to generate MCP tool implementations
- 🧠 Reflection: Specification successfully bridges Phase 2 REST endpoints with Phase 3 AI capabilities while maintaining strict security boundaries. User isolation patterns are architecturally guaranteed at multiple layers (JWT verification, request state, database queries).

## Evaluation notes (flywheel)

- Failure modes observed: None - specification created successfully on first attempt
- Graders run and results (PASS/FAIL): Pending implementation and testing
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): After implementation, test MCP tools with Cohere API to validate tool calling integration works correctly
