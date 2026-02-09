"""
Urdu Language Translator for Phase 3 Chatbot
Handles Urdu language detection, translation, and RTL support
"""
from typing import Optional, Dict, Any
import re


class UrduTranslator:
    """Handles Urdu language translation and detection"""

    # Urdu character ranges (Unicode)
    URDU_RANGE = (0x0600, 0x06FF)
    URDU_EXT_RANGE = (0x0750, 0x077F)

    # Common Urdu words for detection
    COMMON_URDU_WORDS = {
        "میں", "ہے", "کے", "کی", "کا", "سے", "پر", "کو", "میں",
        "یہ", "وہ", "آپ", "ہم", "تم", "Meri", "Mera", "Mujhe",
        "kriye", "krna", "dia", "dayen", "liya", "le", "kar", "ho",
        "acha", "theek", "kaisa", "kaisi", "kidhar", "kahan", "kab",
        "kaun", "kon", "kya", "kyun", "kis", "kise", "iske", "iski",
        "add", "task", "delete", "complete", "list", "show", "update"
    }

    def __init__(self, confidence_threshold: float = 0.3):
        """Initialize Urdu translator

        Args:
            confidence_threshold: Minimum confidence for Urdu detection
        """
        self.confidence_threshold = confidence_threshold

    def detect_urdu(self, text: str) -> tuple[bool, float]:
        """Detect if text contains Urdu language

        Args:
            text: Text to analyze

        Returns:
            Tuple of (is_urdu, confidence)
        """
        if not text:
            return False, 0.0

        total_chars = len(text)
        urdu_chars = 0
        urdu_words = 0
        total_words = 0

        # Check for Urdu characters
        for char in text:
            code_point = ord(char)
            if self.URDU_RANGE[0] <= code_point <= self.URDU_RANGE[1] or \
               self.URDU_EXT_RANGE[0] <= code_point <= self.URDU_EXT_RANGE[1]:
                urdu_chars += 1

        # Check for common Urdu words
        words = re.findall(r'\w+', text.lower())
        total_words = len(words)

        for word in words:
            if word in self.COMMON_URDU_WORDS:
                urdu_words += 1

        # Calculate confidence based on character and word analysis
        char_confidence = urdu_chars / max(total_chars, 1)
        word_confidence = urdu_words / max(total_words, 1)

        # Combined confidence (weighted)
        combined_confidence = (char_confidence * 0.7) + (word_confidence * 0.3)

        is_urdu = combined_confidence >= self.confidence_threshold

        return is_urdu, combined_confidence

    def translate_to_english(self, urdu_text: str) -> Dict[str, Any]:
        """Translate Urdu text to English (placeholder for Cohere integration)

        Args:
            urdu_text: Urdu text to translate

        Returns:
            Dictionary with translation result and metadata
        """
        # For now, this is a placeholder that would call Cohere's multilingual model
        # In production, this would use Cohere's translation or multilingual chat endpoint

        return {
            "original": urdu_text,
            "translated": urdu_text,  # Placeholder - would be actual translation
            "detected_language": "urdu",
            "confidence": 1.0,
            "method": "cohere_multilingual",  # Would use actual Cohere API
        }

    def translate_to_urdu(self, english_text: str) -> Dict[str, Any]:
        """Translate English text to Urdu (placeholder for Cohere integration)

        Args:
            english_text: English text to translate

        Returns:
            Dictionary with translation result and metadata
        """
        # Placeholder for Cohere translation API
        return {
            "original": english_text,
            "translated": english_text,  # Placeholder
            "target_language": "urdu",
            "method": "cohere_multilingual",
        }

    def get_direction(self, text: str) -> str:
        """Get text direction (LTR or RTL) based on language detection

        Args:
            text: Text to analyze

        Returns:
            "rtl" for Urdu, "ltr" otherwise
        """
        is_urdu, _ = self.detect_urdu(text)
        return "rtl" if is_urdu else "ltr"

    def should_translate(self, text: str) -> bool:
        """Determine if text should be translated based on confidence

        Args:
            text: Text to analyze

        Returns:
            True if translation is recommended
        """
        is_urdu, confidence = self.detect_urdu(text)
        return is_urdu and confidence >= self.confidence_threshold


# Global translator instance
_urdu_translator: Optional[UrduTranslator] = None


def get_urdu_translator() -> UrduTranslator:
    """Get or create global Urdu translator

    Returns:
        UrduTranslator singleton
    """
    global _urdu_translator
    if _urdu_translator is None:
        _urdu_translator = UrduTranslator()
    return _urdu_translator


def is_urdu_text(text: str, threshold: float = 0.3) -> bool:
    """Quick check if text is Urdu

    Args:
        text: Text to check
        threshold: Confidence threshold (default: 0.3)

    Returns:
        True if text is Urdu
    """
    translator = get_urdu_translator()
    is_urdu, _ = translator.detect_urdu(text)
    return is_urdu


def get_text_direction(text: str) -> str:
    """Get text direction for a given text

    Args:
        text: Text to analyze

    Returns:
        "rtl" or "ltr"
    """
    translator = get_urdu_translator()
    return translator.get_direction(text)
