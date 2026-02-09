"""
Backend Services for Phase 3 AI Chatbot

This package contains all service modules for:
- Cohere LLM integration (cohere_service.py)
- NLP intent parsing (nlp_parser.py)
- Context management (context_manager.py)
- Urdu translation (urdu_translator.py - bonus)
"""

from .cohere_service import CohereService, get_cohere_service

__all__ = [
    "CohereService",
    "get_cohere_service",
]
