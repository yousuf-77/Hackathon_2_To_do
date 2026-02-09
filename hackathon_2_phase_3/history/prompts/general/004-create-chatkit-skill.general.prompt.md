---
id: 004
title: create-chatkit-skill
stage: general
date: 2025-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /skill skill-creator-pro
labels: ["skill-creation","chatkit","nextjs","cyberpunk"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/chatkit-ui-setup/SKILL.md
 - history/prompts/general/004-create-chatkit-skill.general.prompt.md
tests:
 - Skill file validation (YAML frontmatter, structure, <500 lines)
 - Documentation completeness (installation, theming, examples)
---
## Prompt

Use skill-creator-pro to create a new production-grade reusable skill called "chatkit-ui-setup".

Skill purpose: Guide Claude Code to spec and implement OpenAI ChatKit in Next.js for Phase 3 Todo chatbot UI. Embed chat widget in dashboard, handle message history, tool invocations, and cyberpunk styling (neon glows, glassmorphism). Reference OpenAI ChatKit docs and starters (e.g., chatkit-starter-app on GitHub for React/Next.js integration, custom themes).

When to activate automatically: When mentioning ChatKit, conversational UI, chat widget embed, frontend chatbot integration, or Phase 3 requirements.

Make it high-quality: YAML frontmatter with name, description, triggers. Include step-by-step: install @openai/chatkit, embed in dashboard page, customize with Shadcn/cyberpunk classes, handle streaming responses. Add tips for voice input bonus integration.

Output full SKILL.md content, then save it to .claude/skills/chatkit-ui-setup/SKILL.md in the current project folder.

## Response snapshot

Created the "chatkit-ui-setup" production-grade skill with the following components:

**Skill Metadata (YAML Frontmatter):**
- name: chatkit-ui-setup
- description: Comprehensive guidance for OpenAI ChatKit integration in Next.js with cyberpunk styling
- allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch, mcp__web_reader__webReader
- related_skills: shadcn-ui-cyberpunk-theme-generator, chatbot-integrator, nextjs-api-client-with-jwt, voice-command-specialist, urdu-language-support

**Key Sections Included:**
1. Quick Start: Installation with @openai/chatkit-react and CDN script
2. Dashboard Integration: Complete ChatWidget component with open/close/minimize functionality
3. Cyberpunk Theming: Tailwind config, CSS variables, glassmorphism effects, neon glows
4. Message History: ChatHistoryManager class and useChatHistory React hook
5. Streaming Responses: StreamingChat component with chunk handling and visual feedback
6. Tool Invocation Display: ToolCallDisplay component with status indicators
7. Voice Input (Bonus): Web Speech API hook and voice-enabled input component
8. Error Handling: ChatErrorBoundary class with retry logic
9. Testing: Unit tests and E2E scenarios using Playwright

**Code Examples Provided:**
- API route for ChatKit session creation
- Chat widget with floating button and glassmorphism styling
- Custom CSS for ChatKit theme with cyberpunk colors
- Message persistence with localStorage
- Streaming response handling with real-time preview
- Tool call visualizer with status badges
- Voice recognition hook with multilingual support
- Error boundary with fallback UI

**Quality Assurance:** 16-point checklist covering installation, styling, testing, accessibility, and configuration.

Saved to: `.claude/skills/chatkit-ui-setup/SKILL.md`

## Outcome

- ✅ Impact: Created reusable skill that enables autonomous ChatKit integration for Phase 3 chatbot UI with cyberpunk styling
- 🧪 Tests: Skill structure validation passed; includes testing strategy with unit/E2E examples
- 📁 Files: Created SKILL.md (~500 lines with comprehensive code examples)
- 🔁 Next prompts: None - skill ready for use
- 🧠 Reflection: Successfully integrated domain knowledge from OpenAI docs, GitHub examples, and existing project structure (Next.js App Router, Shadcn UI, Tailwind)

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Skill frontmatter valid, structure follows skill-creator-pro guidelines, related to existing skills (cyberpunk theme, chatbot integration)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill activation by triggering with "ChatKit" or "chatbot" mentions in future prompts
