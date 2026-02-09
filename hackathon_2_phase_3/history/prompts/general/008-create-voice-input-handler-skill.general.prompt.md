---
id: 008
title: create-voice-input-handler-skill
stage: general
date: 2025-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: user
command: /skill skill-creator-pro
labels: ["skill-creation","voice-input","web-speech-api","speech-to-text","multimodal"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/voice-input-handler/SKILL.md
 - history/prompts/general/008-create-voice-input-handler-skill.general.prompt.md
tests:
 - Skill file validation (YAML frontmatter, structure, <500 lines)
 - Documentation completeness (Web Speech API, microphone UI, permissions, continuous mode, integration)
---
## Prompt

Use skill-creator-pro to create a new production-grade reusable skill called "voice-input-handler".

Skill purpose: Add voice commands for Phase 3 bonus using browser SpeechRecognition API. Convert voice to text, feed to Agents SDK for Todo operations, integrate with ChatKit widget.

Skill Type: Hybrid (Builder + Guide)

Auto-Activation Triggers: Adding voice input, speech-to-text features, multi-modal input, Phase 3 voice bonus, voice commands, SpeechRecognition API

Domain: Web Speech API, voice input, speech-to-text, browser APIs

Step-by-Step Content to Include:
1. Web Speech API integration: SpeechRecognition API setup
2. Speech-to-text conversion: Convert voice input to text
3. Microphone button UI: Add mic button to ChatKit widget
4. Continuous listening: Support continuous dictation mode
5. Permission handling: Browser microphone permissions
6. Error handling: Handle no microphone, permission denied, unsupported browser
7. Agents SDK integration: Feed transcribed text to agent
8. ChatKit widget integration: Embed voice in existing chat UI
9. Accessibility: Keyboard shortcuts, visual feedback
10. Testing: Browser compatibility, voice command examples

YAML Frontmatter Required:
- name: voice-input-handler
- description: Clear purpose about voice input and speech-to-text
- allowed-tools: Appropriate tool restrictions
- related_skills: Dependencies on chatkit-ui-setup, agents-sdk-integration, chatbot-integrator

Make it high-quality with browser compatibility patterns, permission handling, and production-ready code examples.

## Response snapshot

Created the "voice-input-handler" production-grade hybrid skill with the following components:

**Skill Metadata (YAML Frontmatter):**
- name: voice-input-handler
- description: Comprehensive guide for voice input using Web Speech API with speech-to-text, microphone UI, continuous listening, and ChatKit integration
- allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
- related_skills: chatkit-ui-setup, agents-sdk-integration, chatbot-integrator, urdu-nlp-translator

**Key Sections Included:**
1. Quick Start: Web Speech API hook creation with TypeScript
2. Speech Recognition Hook: Complete useSpeechRecognition() hook with event handlers
3. Microphone Button Component: Cyberpunk-styled mic button with status indicators
4. Continuous Listening: Enhanced useContinuousSpeechRecognition() with auto-restart
5. Permission Handling: Permission request component with browser API integration
6. ChatKit Widget Integration: Voice-enabled chat input component
7. Agents SDK Integration: Voice command processor with transcript parsing
8. FastAPI Endpoint: /api/voice/command endpoint for processing voice transcripts
9. Error Handling: Comprehensive error enum and utility functions
10. Accessibility: Keyboard shortcuts (Ctrl+Shift+V), ARIA labels, visual feedback
11. Configuration: Environment variables and feature flags
12. Testing Strategy: Unit tests for hook, E2E tests for voice commands
13. 16-point Quality Assurance Checklist

**Code Examples Provided:**
- React hook for speech recognition with browser compatibility
- Cyberpunk-styled microphone button with listening/processing states
- Continuous listening mode with automatic restart
- Permission request dialog with browser settings instructions
- Voice-enabled ChatKit input with auto-send on final transcript
- Backend voice command processor for Agents SDK integration
- FastAPI endpoint for voice command processing
- Error handling utilities for all speech recognition errors
- Keyboard shortcuts component (Ctrl+Shift+V)
- Accessible button with ARIA labels and semantic HTML

**Integration Patterns:**
- Works with existing ChatKit widget structure
- Feeds transcripts to Agents SDK for Todo operations
- Handles browser compatibility (Chrome, Edge, Safari via webkit prefix)
- HTTPS requirement for microphone access
- Graceful degradation for unsupported browsers

**Key Features:**
- Real-time interim transcript display
- Visual feedback for listening/processing states
- Auto-send command when speech is complete
- Continuous dictation mode with auto-restart
- Browser microphone permission management
- Error recovery and user-friendly error messages
- Keyboard shortcuts for accessibility
- ARIA-compliant UI components

Saved to: `.claude/skills/voice-input-handler/SKILL.md`

## Outcome

- ✅ Impact: Created reusable skill that enables autonomous voice input implementation using Web Speech API with ChatKit and Agents SDK integration
- 🧪 Tests: Skill structure validation passed; includes testing strategy for hook, browser compatibility, and voice commands
- 📁 Files: Created SKILL.md (~500 lines with comprehensive code examples)
- 🔁 Next prompts: None - skill ready for use
- 🧠 Reflection: Successfully integrated domain knowledge from MDN Web Speech API docs, React hooks patterns, continuous listening best practices, and browser compatibility requirements

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Skill frontmatter valid, structure follows skill-creator-pro guidelines, related to existing chatbot and agent skills
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test skill activation by triggering with "voice input" or "speech-to-text" mentions in future prompts

## Sources Referenced

- [MDN: Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [Web Speech API Specification](https://webaudio.github.io/web-speech-api/)
- [React Speech Recognition Hook Tutorial](https://medium.com/@kom50/a-reusable-usespeechrecognition-hook-for-react-aab358681c23)
- [AssemblyAI: React Speech Recognition](https://www.assemblyai.com/blog/react-speech-recognition-with-react-hooks)
- [Continuous Speech Recognition Stack Overflow](https://stackoverflow.com/questions/29996350/speech-recognition-run-continuously)
- [Build Voice Commands in JavaScript](https://medium.com/@codebyumar/build-voice-basics-in-javascript-with-the-speechrecognition-api-a9e4b19181c5)
- [Next.js Audio to Text Recognition](https://github.com/KuroshHusseini/nextjs-audio-to-text-recognition)
- [AI Voice Translator with Next.js](https://spacejelly.dev/posts/how-to-build-an-ai-voice-translator-in-next-js-with-web-speech-api-openai)
