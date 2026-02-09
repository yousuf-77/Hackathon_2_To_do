---
id: 007
title: create-urdu-nlp-translator-skill
stage: general
date: 2025-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /skill skill-creator-pro
labels: ["skill-creation","urdu","nlp","translation","multilingual"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/urdu-nlp-translator/SKILL.md
 - history/prompts/general/007-create-urdu-nlp-translator-skill.general.prompt.md
tests:
 - Skill file validation (YAML frontmatter, structure, <500 lines)
 - Documentation completeness (language detection, translation, intent parsing, RTL support)
---
## Prompt

Use skill-creator-pro to create a new production-grade reusable skill called "urdu-nlp-translator".

Skill purpose: Add Urdu language support for Phase 3 bonus. Detect/translate Urdu input, parse Urdu Todo commands using multilingual OpenAI models (e.g., GPT-4 or strong Urdu-capable models).

Skill Type: Hybrid (Builder + Guide)

Auto-Activation Triggers: Adding Urdu support, multi-language features, translation capabilities, Phase 3 bonus features, Urdu NLP parsing, multilingual chatbot

Domain: Urdu NLP, multilingual AI models, translation, intent parsing

Step-by-Step Content to Include:
1. Language detection: Detect Urdu input vs English
2. Model selection: Choose models with strong Urdu support (GPT-4, Qwen, etc.)
3. Translation prompts: Translate Urdu to English for intent parsing
4. Urdu intent parsing: Parse Urdu Todo commands (e.g., "مجھے کام شامل کریں")
5. Response translation: Translate English responses back to Urdu
6. Integration: Work with existing NLP intent parser
7. RTL support: Right-to-left text rendering
8. Testing: Urdu command examples and validation

YAML Frontmatter Required:
- name: urdu-nlp-translator
- description: Clear purpose about Urdu language support and translation
- allowed-tools: Appropriate tool restrictions
- related_skills: Dependencies on nlp-intent-parser, chatbot-integrator, agents-sdk-integration

Make it high-quality with Urdu script examples, translation patterns, and multilingual best practices.

## Response snapshot

Created the "urdu-nlp-translator" production-grade hybrid skill with the following components:

**Skill Metadata (YAML Frontmatter):**
- name: urdu-nlp-translator
- description: Comprehensive guide for Urdu language support with detection, translation, intent parsing, and RTL rendering
- allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
- related_skills: nlp-intent-parser, chatbot-integrator, agents-sdk-integration, chatkit-ui-setup

**Key Sections Included:**
1. Quick Start: Language detection with langdetect/polyglot libraries
2. Language Detection: detect_language(), is_urdu(), is_mixed_language() functions
3. Translation Pipeline: translate_urdu_to_english() and translate_english_to_urdu() with OpenAI
4. Urdu Intent Parsing: Regex patterns for Urdu Todo commands
5. Multilingual Integration: parse_multilingual_command() combining Urdu and English
6. RTL Text Rendering: CSS for right-to-left text, Urdu fonts
7. Frontend Components: MultilingualMessage component with RTL support
8. Configuration: Backend and frontend settings for multilingual support
9. Testing Strategy: Unit tests for detection, translation, and intent parsing
10. Urdu Command Examples: Table of common Urdu Todo commands with translations
11. Roman Urdu Support: Support for Urdu written in Latin script
12. 16-point Quality Assurance Checklist

**Code Examples Provided:**
- Language detection with langdetect library
- Translation functions using GPT-4 with specialized prompts
- Urdu command patterns (create_task, list_tasks, update_task, complete_task, delete_task)
- Intent extraction from Urdu text
- Multilingual command parser
- RTL CSS styling for Urdu text
- React component with automatic RTL detection
- Urdu font integration (Noto Nastaliq Urdu)
- Configuration updates for backend and frontend

**Urdu Script Examples:**
- "مجھے کام شامل کریں" (Add a task for me)
- "میرے کام دکھائیں" (Show my tasks)
- "کام مکمل کریں" (Complete the task)
- "یہ کام ختم کریں" (Delete this task)
- "اہم کام کے ساتھ کام بنائیں" (Create a task with high priority)

**Integration Patterns:**
- Works with existing NLP intent parser
- Falls back to English parsing if Urdu parsing fails
- Translates responses back to user's language
- Automatic RTL detection and styling
- Language indicator in UI

Saved to: `.claude/skills/urdu-nlp-translator/SKILL.md`

## Outcome

- ✅ Impact: Created reusable skill that enables autonomous Urdu language support for Phase 3 bonus features with detection, translation, and intent parsing
- 🧪 Tests: Skill structure validation passed; includes testing strategy for language detection, translation, and RTL rendering
- 📁 Files: Created SKILL.md (~500 lines with comprehensive code examples)
- 🔁 Next prompts: None - skill ready for use
- 🧠 Reflection: Successfully integrated domain knowledge from langdetect library documentation, W3C RTL guidelines, CSS logical properties, and multilingual NLP best practices

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Skill frontmatter valid, structure follows skill-creator-pro guidelines, related to existing NLP and chatbot skills
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill activation by triggering with "Urdu support" or "multilingual" mentions in future prompts

## Sources Referenced

- [langdetect PyPI](https://pypi.org/project/langdetect/)
- [Polyglot Language Detection](http://polyglot.readthedocs.io/en/latest/Detection.html)
- [Lingua Language Detection](https://github.com/pemistahl/lingua-py)
- [W3C HTML RTL Guidelines](https://www.w3.org/International/questions/qa-html-dir.en.html)
- [RTL Frontend Best Practices](https://medium.com/@nderdweik/from-left-to-right-to-right-to-left-frontend-best-practices-1a21aa2ce1d0)
- [CSS Logical Properties for RTL](https://curity.io/docs/idsvr/latest/developer-guide/front-end-development/right-to-left-languages.html)
- [Tailwind CSS RTL Documentation](https://flowbite.com/docs/customize/rtl/)
- [CSS Direction Property Guide](https://medium.com/@er-raj-aryan/understanding-the-css-direction-property-a-practical-guide-e048f8eb2728)
