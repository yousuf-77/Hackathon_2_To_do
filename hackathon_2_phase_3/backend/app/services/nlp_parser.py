"""
NLP Intent Parser for Phase 3 Todo Chatbot
Extracts intents and entities from natural language input
"""
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import re
from datetime import datetime, timedelta

# Import Urdu translator for language detection
try:
    from app.services.urdu_translator import get_urdu_translator
except ImportError:
    # Fallback if translator not available
    def get_urdu_translator():
        return None


class Intent(Enum):
    """Todo chatbot intents"""
    ADD_TASK = "add_task"
    LIST_TASKS = "list_tasks"
    UPDATE_TASK = "update_task"
    DELETE_TASK = "delete_task"
    COMPLETE_TASK = "complete_task"
    UNKNOWN = "unknown"


class IntentParser:
    """Parse natural language input into intents and entities"""

    # Intent patterns (keyword-based for simplicity)
    INTENT_PATTERNS = {
        Intent.ADD_TASK: [
            r"\badd\b",
            r"\bcreate\b",
            r"\bnew\b",
            r"\bmake\b",
            r"\binsert\b",
        ],
        Intent.LIST_TASKS: [
            r"\bshow\b",
            r"\blist\b",
            r"\bdisplay\b",
            r"\bwhat\b",
            r"\bget\b",
            r"\bfind\b",
            r"\bmy\b.*\btasks?\b",
        ],
        Intent.UPDATE_TASK: [
            r"\bupdate\b",
            r"\bchange\b",
            r"\bmodify\b",
            r"\bedit\b",
            r"\breschedule\b",
            r"\bmove\b",
        ],
        Intent.DELETE_TASK: [
            r"\bdelete\b",
            r"\bremove\b",
            r"\bcancel\b",
            r"\berase\b",
        ],
        Intent.COMPLETE_TASK: [
            r"\bcomplete\b",
            r"\bfinish\b",
            r"\bdone\b",
            r"\bmark.*done\b",
            r"\btick\b",
            r"\bcheck.*off\b",
        ],
    }

    # Entity patterns
    PRIORITY_PATTERNS = {
        "high": [r"\bhigh\s*priority\b", r"\burgent\b", r"\bimportant\b", r"\basap\b"],
        "medium": [r"\bmedium\s*priority\b", r"\bnormal\b"],
        "low": [r"\blow\s*priority\b", r"\bwhen.*free\b", r"\bno rush\b"],
    }

    STATUS_PATTERNS = {
        "pending": [r"\bpending\b", r"\bincomplete\b", r"\bnot done\b", r"\bunfinished\b"],
        "completed": [r"\bcompleted\b", r"\bdone\b", r"\bfinished\b", r"\bcomplete\b"],
    }

    DATE_PATTERNS = {
        "today": r"\btoday\b",
        "tomorrow": r"\btomorrow\b",
        "monday": r"\bmonday\b",
        "tuesday": r"\btuesday\b",
        "wednesday": r"\bwednesday\b",
        "thursday": r"\bthursday\b",
        "friday": r"\bfriday\b",
        "saturday": r"\bsaturday\b",
        "sunday": r"\bsunday\b",
        "next_week": r"\bnext\sweek\b",
    }

    def __init__(self):
        """Initialize intent parser"""
        self._compile_patterns()
        self.urdu_translator = get_urdu_translator()

    def _compile_patterns(self):
        """Compile regex patterns for efficiency"""
        self.compiled_intents = {}
        for intent, patterns in self.INTENT_PATTERNS.items():
            self.compiled_intents[intent] = [re.compile(p, re.IGNORECASE) for p in patterns]

        self.compiled_priorities = {}
        for priority, patterns in self.PRIORITY_PATTERNS.items():
            self.compiled_priorities[priority] = [
                re.compile(p, re.IGNORECASE) for p in patterns
            ]

        self.compiled_statuses = {}
        for status, patterns in self.STATUS_PATTERNS.items():
            self.compiled_statuses[status] = [re.compile(p, re.IGNORECASE) for p in patterns]

        self.compiled_dates = {}
        for date_name, pattern in self.DATE_PATTERNS.items():
            self.compiled_dates[date_name] = re.compile(pattern, re.IGNORECASE)

    def parse(self, text: str) -> Dict[str, Any]:
        """Parse natural language input into intent and entities

        Args:
            text: User input text

        Returns:
            Dictionary with intent, entities, and confidence
        """
        text_lower = text.lower().strip()

        # Detect language (Urdu vs English)
        detected_language = "en"  # Default to English
        is_urdu = False
        language_confidence = 0.0

        if self.urdu_translator:
            is_urdu, language_confidence = self.urdu_translator.detect_urdu(text)
            detected_language = "ur" if is_urdu else "en"

        # Detect intent
        intent = self._detect_intent(text_lower)

        # Extract entities based on intent
        entities = self._extract_entities(text, text_lower, intent)

        # Calculate confidence (simple heuristic)
        confidence = self._calculate_confidence(text_lower, intent, entities)

        return {
            "intent": intent.value,
            "entities": entities,
            "confidence": confidence,
            "original_text": text,
            "detected_language": detected_language,
            "is_urdu": is_urdu,
            "language_confidence": language_confidence,
        }

    def _detect_intent(self, text: str) -> Intent:
        """Detect intent from text using pattern matching

        Args:
            text: Lowercase text

        Returns:
            Detected intent (or UNKNOWN if no match)
        """
        intent_scores = {}

        # Score each intent based on pattern matches
        for intent, patterns in self.compiled_intents.items():
            score = 0
            for pattern in patterns:
                if pattern.search(text):
                    score += 1
            if score > 0:
                intent_scores[intent] = score

        # Return intent with highest score
        if intent_scores:
            return max(intent_scores, key=intent_scores.get)

        return Intent.UNKNOWN

    def _extract_entities(
        self, text: str, text_lower: str, intent: Intent
    ) -> Dict[str, Any]:
        """Extract entities from text based on intent

        Args:
            text: Original text
            text_lower: Lowercase text
            intent: Detected intent

        Returns:
            Dictionary of extracted entities
        """
        entities = {}

        # Extract title (for add_task)
        if intent == Intent.ADD_TASK:
            entities["title"] = self._extract_title(text)

        # Extract task reference (for update, delete, complete)
        if intent in [Intent.UPDATE_TASK, Intent.DELETE_TASK, Intent.COMPLETE_TASK]:
            entities["task_reference"] = self._extract_task_reference(text)
            entities["task_id"] = None  # Will be resolved by agent

        # Extract priority
        priority = self._extract_priority(text_lower)
        if priority:
            entities["priority"] = priority

        # Extract status (for list_tasks)
        if intent == Intent.LIST_TASKS:
            status = self._extract_status(text_lower)
            if status:
                entities["status"] = status

        # Extract date/time
        due_date = self._extract_date(text_lower)
        if due_date:
            entities["due_date"] = due_date

        return entities

    def _extract_title(self, text: str) -> Optional[str]:
        """Extract task title from add command

        Args:
            text: Original text

        Returns:
            Task title or None
        """
        # Remove command words
        for intent, patterns in self.INTENT_PATTERNS.items():
            if intent == Intent.ADD_TASK:
                for pattern in patterns:
                    text = re.sub(pattern, "", text, flags=re.IGNORECASE)

        # Clean up and return
        title = text.strip()
        if title:
            return title[:200]  # Max length
        return None

    def _extract_task_reference(self, text: str) -> Optional[str]:
        """Extract task reference (e.g., "task 1", "the meeting task")

        Args:
            text: Original text

        Returns:
            Task reference string or None
        """
        # Look for patterns like "task 1", "the meeting task", "my grocery task"
        patterns = [
            r"\btask\s+(\d+)\b",
            r"\bthe\s+(\w+)\s+task\b",
            r"\bmy\s+(\w+)\s+task\b",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)

        return None

    def _extract_priority(self, text: str) -> Optional[str]:
        """Extract priority from text

        Args:
            text: Lowercase text

        Returns:
            Priority ('low', 'medium', 'high') or None
        """
        for priority, patterns in self.compiled_priorities.items():
            for pattern in patterns:
                if pattern.search(text):
                    return priority
        return None

    def _extract_status(self, text: str) -> Optional[str]:
        """Extract status from text

        Args:
            text: Lowercase text

        Returns:
            Status ('pending', 'completed') or None
        """
        for status, patterns in self.compiled_statuses.items():
            for pattern in patterns:
                if pattern.search(text):
                    return status
        return None

    def _extract_date(self, text: str) -> Optional[str]:
        """Extract and parse date from text

        Args:
            text: Lowercase text

        Returns:
            ISO date string or None
        """
        for date_name, pattern in self.compiled_dates.items():
            if pattern.search(text):
                # Convert date name to actual date
                date = self._parse_date_name(date_name)
                if date:
                    return date.isoformat()

        # Look for time patterns (e.g., "2 PM", "3:30 PM")
        time_pattern = r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b"
        match = re.search(time_pattern, text, re.IGNORECASE)
        if match:
            hour = int(match.group(1))
            minute = int(match.group(2)) if match.group(2) else 0
            ampm = match.group(3).lower()

            # Convert to 24-hour format
            if ampm == "pm" and hour < 12:
                hour += 12
            elif ampm == "am" and hour == 12:
                hour = 0

            # Create datetime for today at that time
            now = datetime.now()
            try:
                date = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
                # If time has passed, set for tomorrow
                if date < now:
                    date += timedelta(days=1)
                return date.isoformat()
            except ValueError:
                pass

        return None

    def _parse_date_name(self, date_name: str) -> Optional[datetime]:
        """Parse date name to datetime

        Args:
            date_name: Date name (e.g., 'today', 'tomorrow', 'monday')

        Returns:
            Datetime object or None
        """
        now = datetime.now()

        if date_name == "today":
            return now.replace(hour=23, minute=59, second=59, microsecond=0)

        if date_name == "tomorrow":
            tomorrow = now + timedelta(days=1)
            return tomorrow.replace(hour=23, minute=59, second=59, microsecond=0)

        # Weekdays
        weekdays = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
            "saturday": 5,
            "sunday": 6,
        }

        if date_name in weekdays:
            target_day = weekdays[date_name]
            current_day = now.weekday()
            days_ahead = (target_day - current_day + 7) % 7

            if days_ahead == 0:
                days_ahead = 7  # Next week, not today

            target_date = now + timedelta(days=days_ahead)
            return target_date.replace(hour=23, minute=59, second=59, microsecond=0)

        if date_name == "next_week":
            return now + timedelta(weeks=1)

        return None

    def _calculate_confidence(
        self, text: str, intent: Intent, entities: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for parsing result

        Args:
            text: Original text
            intent: Detected intent
            entities: Extracted entities

        Returns:
            Confidence score (0.0 to 1.0)
        """
        if intent == Intent.UNKNOWN:
            return 0.0

        confidence = 0.5  # Base confidence

        # Increase confidence if we have clear intent keywords
        intent_patterns = self.compiled_intents.get(intent, [])
        for pattern in intent_patterns:
            if pattern.search(text):
                confidence += 0.1

        # Increase confidence based on entities extracted
        if intent == Intent.ADD_TASK and entities.get("title"):
            confidence += 0.2

        if entities.get("priority"):
            confidence += 0.1

        if entities.get("due_date"):
            confidence += 0.1

        # Cap at 1.0
        return min(confidence, 1.0)


# Global parser instance
_parser: Optional[IntentParser] = None


def get_intent_parser() -> IntentParser:
    """Get or create global intent parser"""
    global _parser
    if _parser is None:
        _parser = IntentParser()
    return _parser
