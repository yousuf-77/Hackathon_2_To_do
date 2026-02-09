---
id: 006
title: create-mcp-tool-definition-skill
stage: general
date: 2025-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /skill skill-creator-pro
labels: ["skill-creation","mcp","model-context-protocol","fastapi","tools"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/mcp-tool-definition/SKILL.md
 - history/prompts/general/006-create-mcp-tool-definition-skill.general.prompt.md
tests:
 - Skill file validation (YAML frontmatter, structure, <500 lines)
 - Documentation completeness (installation, server setup, tool definitions, security, testing)
---
## Prompt

Use skill-creator-pro to create a new production-grade reusable skill called "mcp-tool-definition".

Skill purpose: Define and implement Official MCP SDK tools for Phase 3 Todo operations (add_task, update_task, list_tasks, complete_task, delete_task). Integrate with FastAPI backend, enforce JWT security and user isolation. Reference fastapi-mcp examples and official MCP tool schemas.

Skill Type: Hybrid (Builder + Guide)

Auto-Activation Triggers: Defining MCP tools, MCP tool schemas, backend tool execution, Phase 3 AI governance, Model Context Protocol, MCP tool implementation

Domain: Model Context Protocol (MCP) SDK with FastAPI

Step-by-Step Content to Include:
1. MCP SDK installation: pip install mcp, fastapi-mcp
2. MCP server setup: Initialize MCP server with FastAPI
3. Tool definitions: Define schemas for add_task, update_task, list_tasks, complete_task, delete_task
4. Tool registration: Register tools with MCP server
5. JWT security: Enforce authentication on tool execution
6. User isolation: Scope all tools to user_id
7. Error handling: Tool execution errors, validation failures
8. FastAPI integration: Expose MCP tools via FastAPI endpoints
9. Testing: Test tool execution, validation, security

YAML Frontmatter Required:
- name: mcp-tool-definition
- description: Clear purpose about MCP tool definition and implementation
- allowed-tools: Appropriate tool restrictions
- related_skills: Dependencies on agents-sdk-integration, fastapi-jwt-middleware, mcp-tool-engineer

Make it high-quality with official MCP schemas, security patterns, and production-ready code examples.

## Response snapshot

Created the "mcp-tool-definition" production-grade hybrid skill with the following components:

**Skill Metadata (YAML Frontmatter):**
- name: mcp-tool-definition
- description: Comprehensive guide for MCP tool definition and implementation with FastAPI, JWT security, and user isolation
- allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
- related_skills: agents-sdk-integration, fastapi-jwt-middleware-neon, mcp-tool-engineer, chatbot-integrator

**Key Sections Included:**
1. Quick Start: MCP SDK installation (pip install mcp), project structure
2. MCP Server Setup: FastMCP initialization with server configuration
3. Tool Definitions: Complete implementations for all 5 Todo operations:
   - add_task (with title, description, priority)
   - list_tasks (with status filter and limit)
   - update_task (with optional field updates)
   - complete_task (toggle completion status)
   - delete_task (permanent deletion)
4. Tool Schemas: Pydantic models for input/output validation with JSON Schema compliance
5. MCP Tool Registration: Functions using @mcp.tool() decorator pattern
6. JWT Security Middleware: User context extraction and isolation
7. FastAPI Integration: HTTP endpoints for tool execution with authentication
8. Manual Schema Definitions: Official JSON Schema format for MCP tools
9. Testing Strategy: Unit tests for tool execution, integration tests for FastAPI endpoints
10. Configuration: Environment variables and requirements.txt updates
11. 16-point Quality Assurance Checklist

**Code Examples Provided:**
- FastMCP server initialization
- All 5 Todo tool implementations with async database operations
- Pydantic input/output schemas with validation
- JWT middleware for user context extraction
- FastAPI routes for tool execution (/api/mcp/tools/{tool_name})
- Tool listing endpoint (/api/mcp/tools)
- JSON Schema definitions following official MCP spec
- Unit and integration test examples

**Security Patterns:**
- User context extraction from JWT token
- User isolation enforced in all tool operations
- Context variables for thread-safe user tracking
- Ownership verification before task modifications

**Integration Points:**
- Uses existing get_db() database session pattern
- Integrates with existing JWT verification (decode_jwt, verify_jwt_payload)
- Follows existing Todo model structure
- Compatible with existing error handling patterns

Saved to: `.claude/skills/mcp-tool-definition/SKILL.md`

## Outcome

- ✅ Impact: Created reusable skill that enables autonomous MCP tool definition for FastAPI backends with JWT security and user isolation
- 🧪 Tests: Skill structure validation passed; includes testing strategy with unit/integration tests
- 📁 Files: Created SKILL.md (~500 lines with comprehensive code examples)
- 🔁 Next prompts: None - skill ready for use
- 🧠 Reflection: Successfully integrated domain knowledge from official MCP documentation, fastapi-mcp examples, existing FastAPI backend structure, and JWT middleware patterns

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Skill frontmatter valid, structure follows skill-creator-pro guidelines, related to existing backend skills (JWT, agents, MCP)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill activation by triggering with "MCP tools" or "tool schemas" mentions in future prompts

## Sources Referenced

- [Official MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Official Documentation](https://modelcontextprotocol.io/docs/sdk)
- [MCP Tools Documentation](https://modelcontextprotocol.info/docs/concepts/tools/)
- [Build an MCP Server](https://modelcontextprotocol.io/docs/develop/build-server)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol/modelcontextprotocol)
- [Integrating MCP Servers with FastAPI](https://medium.com/@ruchi.awasthi63/integrating-mcp-servers-with-fastapi-2c6d0c9a4749)
- [fastapi_mcp GitHub](https://github.com/tadata-org/fastapi_mcp)
- [Build Your First MCP Server](https://medium.com/data-science-collective/build-your-first-mcp-server-in-15-minutes-complete-code-d63f85c0ce79)
- [JSON Schema Specification](https://json-schema.org/specification)
- [MCP Schema Reference](https://commands.com/docs/mcp/schemas/)
