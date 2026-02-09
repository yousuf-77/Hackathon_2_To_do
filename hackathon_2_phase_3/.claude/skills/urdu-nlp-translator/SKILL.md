---
name: urdu-nlp-translator
description: |
  This skill guides Claude Code to add Urdu language support for Phase 3 bonus features. Covers Urdu language detection, translation using multilingual OpenAI models (GPT-4), Urdu Todo command parsing, RTL text rendering, and response translation. Integrates with existing NLP intent parser and chatbot systems. This skill activates automatically when users mention adding Urdu support, multi-language features, translation capabilities, Phase 3 bonus features, Urdu NLP parsing, or multilingual chatbot.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
related_skills:
  - nlp-intent-parser
  - chatbot-integrator
  - agents-sdk-integration
  - chatkit-ui-setup
---

# Urdu NLP Translator Skill

## Overview

This skill provides comprehensive guidance for adding Urdu language support to chatbot and NLP systems. It covers language detection, translation using multilingual AI models, Urdu Todo command parsing, RTL (right-to-left) text rendering, and bidirectional response translation for Phase 3 bonus features.

## When to Use This Skill

- Adding Urdu language support to chatbot systems
- Implementing multilingual NLP parsing for Todo commands
- Creating translation pipelines for Urdu-English
- Setting up RTL text rendering for Urdu script
- Parsing Urdu Todo commands (e.g., "مجھے کام شامل کریں")
- Translating responses back to Urdu
- Phase 3 bonus feature implementation
- Multi-language chatbot integration

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing NLP parser, chatbot implementation, UI components |
| **Conversation** | User's Urdu support requirements, translation preferences |
| **Skill References** | Multilingual model capabilities, Urdu NLP patterns, RTL best practices |
| **User Guidelines** | Target audience, dialect preferences (Roman Urdu vs Urdu script) |

Ensure all required context is gathered before implementing.

## Quick Start: Language Detection

### 1. Install Language Detection Library

```bash
# Install language detection library (supports Urdu)
pip install langdetect

# Alternative: polyglot (more accurate, supports Urdu explicitly)
pip install polyglot pycld2

# Or: lingua (most accurate for short text)
pip install lingua
```

### 2. Basic Language Detection

```python
# backend/app/nlp/language_detection.py
"""Language detection for multilingual support."""
from langdetect import detect, DetectorFactory
from typing import Optional

# Set seed for consistent results
DetectorFactory.seed = 0

def detect_language(text: str) -> Optional[str]:
    """
    Detect the language of input text.

    Args:
        text: Input text to analyze

    Returns:
        Language code (e.g., 'ur' for Urdu, 'en' for English) or None

    Example:
        detect_language("مجھے کام شامل کریں")  # Returns 'ur'
        detect_language("Add a task")        # Returns 'en'
    """
    try:
        # Detect language
        lang = detect(text)

        # Normalize language codes
        lang_map = {
            'ur': 'ur',      # Urdu
            'en': 'en',      # English
            'hi': 'hi',      # Hindi (often confused with Urdu)
        }

        return lang_map.get(lang, lang)

    except Exception as e:
        # Handle detection errors (empty text, etc.)
        return None


def is_urdu(text: str) -> bool:
    """
    Check if text is in Urdu language.

    Args:
        text: Input text to check

    Returns:
        True if Urdu, False otherwise
    """
    lang = detect_language(text)
    return lang == 'ur'


def is_mixed_language(text: str) -> bool:
    """
    Check if text contains multiple languages (code-switching).

    Args:
        text: Input text to analyze

    Returns:
        True if mixed language detected
    """
    # Simple heuristic: check for Urdu script range
    urdu_chars = set(range(0x0600, 0x06FF))  # Arabic/Persian/Urdu range
    english_chars = set(range(0x0041, 0x005A)) | set(range(0x0061, 0x007A))

    has_urdu = any(ord(c) in urdu_chars for c in text)
    has_english = any(ord(c) in english_chars for c in text)

    return has_urdu and has_english
```

## Translation Pipeline with OpenAI

### Urdu to English Translation

```python
# backend/app/nlp/translation.py
"""Translation pipeline for Urdu-English."""
from openai import OpenAI
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)


async def translate_urdu_to english(
    urdu_text: str,
    context: Optional[str] = None,
) -> Optional[str]:
    """
    Translate Urdu text to English for intent parsing.

    Args:
        urdu_text: Urdu input text
        context: Optional context (e.g., "todo command", "chat message")

    Returns:
        English translation or None if translation fails

    Example:
        translate_urdu_to_english("مجھے کام شامل کریں")
        # Returns: "Add a task for me"
    """
    system_prompt = """You are a professional Urdu-to-English translator specializing in Todo management commands.

Guidelines:
- Provide accurate, natural-sounding English translations
- Preserve the intent and meaning of the original Urdu text
- For Todo commands, focus on action verbs (add, list, update, delete, complete)
- Maintain informal/conversational tone if present in original
- If uncertain, provide the most likely interpretation

Common Todo command patterns:
- "مجھے کام شامل کریں" → "Add a task for me"
- "میرے کام دکھائیں" → "Show my tasks"
- "کام مکمل کریں" → "Complete the task"
- "کام ختم کریں" → "Delete the task"
- "کام اپ ڈیٹ کریں" → "Update the task"

Translate the Urdu text to English."""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,  # Use gpt-4 for best Urdu support
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Translate this Urdu text to English: {urdu_text}"}
            ],
            temperature=0.2,  # Lower temperature for consistent translations
            max_tokens=500,
        )

        translation = response.choices[0].message.content.strip()
        logger.info(f"Translated Urdu to English: '{urdu_text}' → '{translation}'")

        return translation

    except Exception as e:
        logger.error(f"Translation error: {e}")
        return None


async def translate_english_to_urdu(
    english_text: str,
    context: Optional[str] = None,
) -> Optional[str]:
    """
    Translate English response to Urdu for user.

    Args:
        english_text: English response text
        context: Optional context for translation

    Returns:
        Urdu translation or None if translation fails

    Example:
        translate_english_to_urdu("Task created successfully")
        # Returns: "کام کامیابی سے شامل کر دیا گیا"
    """
    system_prompt = """You are a professional English-to-Urdu translator specializing in Todo management responses.

Guidelines:
- Provide natural, conversational Urdu translations
- Use commonly spoken Urdu (not overly formal)
- For technical terms, you may keep them in English if no common Urdu equivalent exists
- Maintain the tone (informal, formal, friendly, etc.)
- Ensure translations are culturally appropriate

Common response patterns:
- "Task created" → "کام شامل کر دیا گیا"
- "Here are your tasks" → "یہاں آپ کے کام ہیں"
- "Task completed" → "کام مکمل کر دیا گیا"
- "Task deleted" → "کام ختم کر دیا گیا"
- "Task updated" → "کام اپ ڈیٹ کر دیا گیا"

Translate the English text to Urdu."""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Translate this English text to Urdu: {english_text}"}
            ],
            temperature=0.2,
            max_tokens=500,
        )

        translation = response.choices[0].message.content.strip()
        logger.info(f"Translated English to Urdu: '{english_text}' → '{translation}'")

        return translation

    except Exception as e:
        logger.error(f"Translation error: {e}")
        return None
```

## Urdu Intent Parsing

### Parse Urdu Todo Commands

```python
# backend/app/nlp/urdu_intent_parser.py
"""Urdu-specific intent parsing for Todo commands."""
from typing import Dict, Any, Optional
import re
import logging

logger = logging.getLogger(__name__)


# Urdu command patterns
URDU_PATTERNS = {
    'create_task': [
        r'کام\s+شامل\s+کریں',
        r'نیا\s+کام',
        r'کام\s+بنائیں',
        r'مجھے\s+کام\s+شامل\s+کریں',
    ],
    'list_tasks': [
        r'میرے\s+کام\s+دکھائیں',
        r'کام\s+کی\s+فہرست',
        r'سب\s+کام',
        r'میرے\s+تمام\s+کام',
    ],
    'update_task': [
        r'کام\s+اپڈیٹ\s+کریں',
        r'کام\s+تبدیل\s+کریں',
        r'کام\s+میں\s+تبدیلی',
    ],
    'complete_task': [
        r'کام\s+مکمل\s+کریں',
        r'کام\s+ختم\s+کریں',
        r'کام\s+پورا\s+کریں',
        r'�اسک\s+کام\s+کو\s+مکمل\s+کریں',
    ],
    'delete_task': [
        r'کام\s+ختم\s+کریں',
        r'کام\s+ڈیلیٹ\s+کریں',
        r'اس\s+کام\s+کو\s+ختم\s+کریں',
    ],
}


def detect_urdu_intent(urdu_text: str) -> Optional[str]:
    """
    Detect intent from Urdu text using regex patterns.

    Args:
        urdu_text: Urdu command text

    Returns:
        Intent name (e.g., 'create_task') or None

    Example:
        detect_urdu_intent("مجھے کام شامل کریں")
        # Returns: 'create_task'
    """
    for intent, patterns in URDU_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, urdu_text, re.IGNORECASE):
                logger.info(f"Detected intent '{intent}' from Urdu text")
                return intent

    return None


def extract_urdu_task_details(urdu_text: str, intent: str) -> Dict[str, Any]:
    """
    Extract task details from Urdu command text.

    Args:
        urdu_text: Urdu command text
        intent: Detected intent type

    Returns:
        Dictionary with extracted parameters

    Example:
        extract_urdu_task_details("خریداری کے لیے کام شامل کریں", "create_task")
        # Returns: {'title': 'خریداری کے لیے', 'priority': None}
    """
    details = {}

    if intent == 'create_task':
        # Extract task title (text after command keywords)
        title_match = re.search(r'(?:کام\s+شامل\s+کریں|نیا\s+کام)\s*(.+)', urdu_text)
        if title_match:
            details['title'] = title_match.group(1).strip()

        # Extract priority if mentioned
        if re.search(r' زیادہ\s+اہم', urdu_text):
            details['priority'] = 'high'
        elif re.search(r' عام', urdu_text):
            details['priority'] = 'medium'
        elif re.search(r' کم\s+اہم', urdu_text):
            details['priority'] = 'low'

    elif intent == 'list_tasks':
        # Check for status filter
        if re.search(r'مکمل\s+نہیں|زیر\s+التوا', urdu_text):
            details['status'] = 'pending'
        elif re.search(r'مکمل', urdu_text):
            details['status'] = 'completed'

    elif intent in ['update_task', 'complete_task', 'delete_task']:
        # Extract task ID or reference (simplified)
        # In real implementation, would use NLP to identify task references
        pass

    logger.info(f"Extracted details from Urdu: {details}")
    return details


async def parse_urdu_command(urdu_text: str) -> Dict[str, Any]:
    """
    Parse Urdu command into structured format.

    Args:
        urdu_text: Urdu command text

    Returns:
        Structured command with intent and parameters

    Example:
        parse_urdu_command("مجھے خریداری کے لیے کام شامل کریں")
        # Returns: {
        #     'intent': 'create_task',
        #     'parameters': {'title': 'خریداری کے لیے', 'priority': None},
        #     'original_text': 'مجھے خریداری کے لیے کام شامل کریں'
        # }
    """
    # Detect intent
    intent = detect_urdu_intent(urdu_text)

    if not intent:
        # Fallback to translation and English parsing
        from app.nlp.translation import translate_urdu_to_english
        english_translation = await translate_urdu_to_english(urdu_text)

        if english_translation:
            # Parse using English NLP parser
            from app.nlp.intent_parser import parse_english_command
            return await parse_english_command(english_translation)

        return {
            'intent': 'unknown',
            'parameters': {},
            'original_text': urdu_text,
            'error': 'Could not parse Urdu command'
        }

    # Extract parameters
    parameters = extract_urdu_task_details(urdu_text, intent)

    return {
        'intent': intent,
        'parameters': parameters,
        'original_text': urdu_text,
        'language': 'ur'
    }
```

## Integration with Existing NLP Pipeline

### Multilingual Intent Parser

```python
# backend/app/nlp/multilingual_parser.py
"""Multilingual intent parser integrating Urdu support."""
from app.nlp.language_detection import detect_language, is_urdu
from app.nlp.urdu_intent_parser import parse_urdu_command
from app.nlp.translation import translate_urdu_to_english, translate_english_to_urdu
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


async def parse_multilingual_command(
    text: str,
    user_language: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Parse command in any supported language (English or Urdu).

    Args:
        text: Command text
        user_language: Optional user language preference

    Returns:
        Structured command with intent and parameters

    Example:
        await parse_multilingual_command("Add a task")
        # Returns: {'intent': 'create_task', ...}

        await parse_multilingual_command("مجھے کام شامل کریں")
        # Returns: {'intent': 'create_task', ...}
    """
    # Detect language if not provided
    if not user_language:
        user_language = detect_language(text)

    logger.info(f"Detected language: {user_language} for text: {text}")

    # Handle Urdu
    if user_language == 'ur' or is_urdu(text):
        result = await parse_urdu_command(text)

        # Add translation for logging/debugging
        if result.get('intent') != 'unknown':
            english_translation = await translate_urdu_to_english(text)
            if english_translation:
                result['english_translation'] = english_translation

        return result

    # Handle English (default)
    else:
        # Use existing English parser
        from app.nlp.intent_parser import parse_english_command
        result = await parse_english_command(text)
        result['language'] = 'en'
        return result


async def format_response_for_user(
    response_text: str,
    user_language: str,
) -> str:
    """
    Format response in user's preferred language.

    Args:
        response_text: English response text
        user_language: User's language ('en' or 'ur')

    Returns:
        Response in user's language

    Example:
        await format_response_for_user("Task created", "ur")
        # Returns: "کام کامیابی سے شامل کر دیا گیا"
    """
    if user_language == 'ur':
        urdu_translation = await translate_english_to_urdu(response_text)
        if urdu_translation:
            return urdu_translation

    return response_text
```

## RTL Text Rendering for Frontend

### CSS for Urdu Script

```css
/* frontend/app/globals.css (add to existing) */

/* Urdu RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Urdu text container */
.urdu-text {
  direction: rtl;
  text-align: right;
  font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Arial', sans-serif;
  line-height: 1.8;
}

/* Urdu input field */
.urdu-input {
  direction: rtl;
  text-align: right;
  font-family: 'Noto Nastaliq Urdu', serif;
}

/* Mix of Urdu and English */
.multilingual-text {
  direction: auto;
  text-align: start;
}

/* Chat messages in Urdu */
.chat-message.urdu {
  direction: rtl;
  text-align: right;
  padding-left: 1rem;
  padding-right: 0.5rem;
}

.chat-message.english {
  direction: ltr;
  text-align: left;
  padding-left: 0.5rem;
  padding-right: 1rem;
}

/* Cyberpunk theme adjustments for Urdu */
.urdu-text.cyber-glow {
  text-shadow: 0 0 10px rgba(var(--cyber-neon-blue), 0.5);
}
```

### React Component with RTL Support

```tsx
// frontend/components/chat/multilingual-message.tsx
"use client";

import { useEffect, useState } from 'react';
import { detectLanguage, isUrdu } from '@/lib/language-detection';

interface MultilingualMessageProps {
  content: string;
  className?: string;
}

export function MultilingualMessage({ content, className }: MultilingualMessageProps) {
  const [language, setLanguage] = useState<string>('en');
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    // Detect language
    const detected = detectLanguage(content);
    setLanguage(detected || 'en');
    setIsRtl(detected === 'ur' || isUrdu(content));
  }, [content]);

  return (
    <div
      className={className}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        textAlign: isRtl ? 'right' : 'left',
      }}
    >
      <span className={isRtl ? 'urdu-text' : ''}>
        {content}
      </span>

      {/* Optional: Show language indicator */}
      <span className="text-xs text-cyber-text-muted ml-2">
        {language === 'ur' ? 'اردو' : 'EN'}
      </span>
    </div>
  );
}
```

### Urdu Font Support

```tsx
// frontend/app/layout.tsx (add to existing)
import { Noto_Nastaliq_Urdu } from 'next/font/google';

const notoUrdu = Noto_Nastaliq_Urdu({
  weight: ['400', '700'],
  subsets: ['arabic'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={notoUrdu.className}>
      {/* ... existing layout ... */}
    </html>
  );
}
```

## Configuration and Environment

### Backend Configuration

```python
# backend/app/core/config.py (add to existing)

class Settings(BaseSettings):
    """Application settings."""

    # ... existing settings ...

    # Multilingual Support
    enable_urdu_support: bool = Field(default=True, env="ENABLE_URDU_SUPPORT")
    default_language: str = Field(default="en", env="DEFAULT_LANGUAGE")
    supported_languages: list = Field(default=["en", "ur"], env="SUPPORTED_LANGUAGES")

    # Translation Settings
    translation_model: str = Field(default="gpt-4", env="TRANSLATION_MODEL")
    translation_temperature: float = Field(default=0.2, env="TRANSLATION_TEMPERATURE")
```

### Frontend Configuration

```typescript
// frontend/lib/config.ts (add to existing)

export const MULTILINGUAL_CONFIG = {
  enabled: true,
  defaultLanguage: 'en',
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ],
  rtlLanguages: ['ur', 'ar'], // Right-to-left languages
};
```

## Testing Urdu Support

### Unit Tests for Language Detection

```python
# backend/tests/test_urdu_support.py
"""Test Urdu language support."""

def test_detect_urdu_language():
    """Test Urdu language detection."""
    from app.nlp.language_detection import detect_language, is_urdu

    assert detect_language("مجھے کام شامل کریں") == 'ur'
    assert detect_language("Add a task") == 'en'
    assert is_urdu("مجھے کام شامل کریں") is True
    assert is_urdu("Add a task") is False


def test_detect_urdu_intent():
    """Test Urdu intent detection."""
    from app.nlp.urdu_intent_parser import detect_urdu_intent

    assert detect_urdu_intent("مجھے کام شامل کریں") == 'create_task'
    assert detect_urdu_intent("میرے کام دکھائیں") == 'list_tasks'
    assert detect_urdu_intent("کام مکمل کریں") == 'complete_task'


@pytest.mark.asyncio
async def test_urdu_to_english_translation():
    """Test Urdu to English translation."""
    from app.nlp.translation import translate_urdu_to_english

    result = await translate_urdu_to_english("مجھے کام شامل کریں")

    assert result is not None
    assert 'add' in result.lower() or 'create' in result.lower() or 'task' in result.lower()


@pytest.mark.asyncio
async def test_parse_urdu_command():
    """Test parsing Urdu commands."""
    from app.nlp.multilingual_parser import parse_multilingual_command

    result = await parse_multilingual_command("مجھے خریداری کے لیے کام شامل کریں")

    assert result['intent'] == 'create_task'
    assert 'title' in result['parameters']
    assert result['language'] == 'ur'
```

### Frontend Tests for RTL Rendering

```typescript
// frontend/components/__tests__/MultilingualMessage.test.tsx
import { render, screen } from '@testing-library/react';
import { MultilingualMessage } from '../MultilingualMessage';

describe('MultilingualMessage', () => {
  it('renders English text LTR', () => {
    render(<MultilingualMessage content="Hello" />);
    const container = screen.getByText('Hello').parentElement;
    expect(container).toHaveAttribute('dir', 'ltr');
  });

  it('renders Urdu text RTL', () => {
    render(<MultilingualMessage content="مجھے کام شامل کریں" />);
    const container = screen.getByText('مجھے کام شامل کریں').parentElement;
    expect(container).toHaveAttribute('dir', 'rtl');
  });

  it('shows language indicator', () => {
    render(<MultilingualMessage content="مجھے کام شامل کریں" />);
    expect(screen.getByText('اردو')).toBeInTheDocument();
  });
});
```

## Urdu Command Examples

### Common Urdu Todo Commands

| Urdu Command | Translation | Intent |
|--------------|-------------|--------|
| مجھے کام شامل کریں | Add a task for me | create_task |
| خریداری کے لیے کام بنائیں | Create a task for shopping | create_task |
| میرے تمام کام دکھائیں | Show all my tasks | list_tasks |
| زیر التوا کام | Pending tasks | list_tasks (status=pending) |
| اس کام کو مکمل کریں | Complete this task | complete_task |
| کام اپ ڈیٹ کریں | Update the task | update_task |
| یہ کام ختم کریں | Delete this task | delete_task |
| اہم کام کے ساتھ کام بنائیں | Create a task with high priority | create_task (priority=high) |

### Roman Urdu Support

```python
# backend/app/nlp/roman_urdu.py
"""Support for Roman Urdu (Urdu written in Latin script)."""

ROMAN_URDU_PATTERNS = {
    'create_task': [
        r'mujhe\s+kaam\s+shamil\s+karein',
        r'naya\s+kaam\s+banaein',
        r'task\s+add\s+karein',
    ],
    'list_tasks': [
        r'mere\s+kaam\s+dikhain',
        r'sab\s+kaam',
        r'task\s+list',
    ],
}

def is_roman_urdu(text: str) -> bool:
    """Check if text is Roman Urdu."""
    # Check if text contains Latin characters but Urdu words
    urdu_words = ['kaam', 'shamil', 'karein', 'dikhain', 'mujhe', 'mere']
    return any(word in text.lower() for word in urdu_words)
```

## Quality Assurance Checklist

- [ ] Language detection library installed (langdetect/polyglot)
- [ ] Language detection tests pass for Urdu and English
- [ ] Urdu to English translation pipeline implemented
- [ ] English to Urdu translation pipeline implemented
- [ ] Urdu intent parser with regex patterns
- [ ] Multilingual command parser integrated
- [ ] RTL CSS styling added for Urdu text
- [ ] Urdu fonts loaded in frontend
- [ ] Multilingual message component created
- [ ] Configuration updated for language support
- [ ] Unit tests written for language detection
- [ ] Unit tests written for translation
- [ ] Unit tests written for intent parsing
- [ ] Frontend tests for RTL rendering
- [ ] Urdu command examples documented

## References and Further Reading

- [langdetect PyPI](https://pypi.org/project/langdetect/)
- [Polyglot Language Detection](http://polyglot.readthedocs.io/en/latest/Detection.html)
- [W3C HTML RTL Guidelines](https://www.w3.org/International/questions/qa-html-dir.en.html)
- [RTL Frontend Best Practices](https://medium.com/@nderdweik/from-left-to-right-to-right-to-left-frontend-best-practices-1a21aa2ce1d0)
- [CSS Logical Properties for RTL](https://curity.io/docs/idsvr/latest/developer-guide/front-end-development/right-to-left-languages.html)
- [Tailwind CSS RTL Documentation](https://flowbite.com/docs/customize/rtl/)
- [Lingua Language Detection](https://github.com/pemistahl/lingua-py)
- [Urdu NLP Research Papers](https://scholar.google.com/scholar?q=urdu+nlp+language+processing)
