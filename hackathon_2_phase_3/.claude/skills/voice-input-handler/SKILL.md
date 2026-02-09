---
name: voice-input-handler
description: |
  This skill guides Claude Code to add voice input capabilities for Phase 3 bonus using browser Web Speech API. Covers SpeechRecognition integration, speech-to-text conversion, microphone button UI, continuous listening mode, browser permission handling, error recovery, ChatKit widget integration, and Agents SDK connectivity. This skill activates automatically when users mention adding voice input, speech-to-text features, multi-modal input, Phase 3 voice bonus, voice commands, or SpeechRecognition API.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, WebSearch
related_skills:
  - chatkit-ui-setup
  - agents-sdk-integration
  - chatbot-integrator
  - urdu-nlp-translator
---

# Voice Input Handler Skill

## Overview

This skill provides comprehensive guidance for implementing voice input capabilities using the browser Web Speech API. It covers SpeechRecognition setup, speech-to-text conversion, microphone UI components, continuous listening, browser compatibility, permission handling, error recovery, and integration with ChatKit widgets and Agents SDK for Phase 3 bonus features.

## When to Use This Skill

- Adding voice input to chatbot applications
- Implementing speech-to-text with Web Speech API
- Creating microphone buttons for voice commands
- Setting up continuous listening mode
- Handling browser microphone permissions
- Integrating voice with ChatKit widgets
- Connecting speech to Agents SDK
- Phase 3 voice bonus features
- Multi-modal input (text + voice)

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing ChatKit widget, agent integration, UI components |
| **Conversation** | User's voice input requirements, supported languages, continuous mode needs |
| **Skill References** | Web Speech API docs, React hooks patterns, browser compatibility |
| **User Guidelines** | Target browsers, accessibility requirements, fallback strategies |

Ensure all required context is gathered before implementing.

## Quick Start: Web Speech API Hook

### 1. Create Speech Recognition Hook

```typescript
// frontend/hooks/use-speech-recognition.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition({
  lang = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 1,
  onResult,
  onError,
  onEnd,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition ||
                                   (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;
        recognition.maxAlternatives = maxAlternatives;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          let isFinal = false;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            currentTranscript += result[0].transcript;
            if (result.isFinal) isFinal = true;
          }

          setTranscript(currentTranscript);

          if (isFinal) {
            setInterimTranscript('');
            onResult?.(currentTranscript, true);
          } else {
            setInterimTranscript(currentTranscript);
            onResult?.(currentTranscript, false);
          }
        };

        recognition.onerror = (event: any) => {
          const errorMessage = `Speech recognition error: ${event.error}`;
          setError(errorMessage);
          onError?.(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          onEnd?.();
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, continuous, interimResults, maxAlternatives, onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
```

## Microphone Button Component

### Cyberpunk-Styled Mic Button

```typescript
// frontend/components/voice/microphone-button.tsx
"use client";

import { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';

interface MicrophoneButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

export function MicrophoneButton({ onTranscript, className }: MicrophoneButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous = false,
    interimResults = true,
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setIsProcessing(true);
        onTranscript(transcript);
        setTimeout(() => setIsProcessing(false), 1000);
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
    },
  });

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        className={cn(
          "cursor-not-allowed opacity-50",
          className
        )}
        disabled
        title="Voice input not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Indicator */}
      {(isListening || isProcessing) && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full glass-effect border border-cyber-neon-blue/50">
          {isListening && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyber-neon-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-neon-blue"></span>
              </span>
              <span className="text-xs text-cyber-text-secondary">
                Listening...
              </span>
            </>
          )}
          {isProcessing && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-cyber-neon-green" />
              <span className="text-xs text-cyber-text-secondary">
                Processing...
              </span>
            </>
          )}
        </div>
      )}

      {/* Microphone Button */}
      <Button
        onClick={handleClick}
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        className={cn(
          "transition-all duration-200",
          isListening && "animate-pulse shadow-[0_0_20px_rgba(var(--cyber-priority-high)_/_0.5)]",
          !isListening && "cyber-glow-blue",
          className
        )}
        title={isListening ? "Stop recording" : "Start voice input"}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4 text-cyber-neon-blue" />
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="text-xs text-cyber-priority-high">
          {error}
        </div>
      )}

      {/* Interim Transcript Preview */}
      {interimTranscript && (
        <div className="text-sm text-cyber-text-secondary italic">
          "{interimTranscript}"
        </div>
      )}
    </div>
  );
}
```

## Continuous Listening Mode

### Enhanced Hook with Auto-Restart

```typescript
// frontend/hooks/use-continuous-speech-recognition.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export function useContinuousSpeechRecognition({
  lang = 'en-US',
  onResult,
  onError,
}: {
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRestartingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition ||
                                       (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Enable continuous mode
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptText = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcriptText;
            } else {
              interimTranscript += transcriptText;
            }
          }

          setTranscript(finalTranscript || interimTranscript);

          if (finalTranscript) {
            onResult?.(finalTranscript, true);
          } else if (interimTranscript) {
            onResult?.(interimTranscript, false);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          onError?.(event.error);

          // Don't restart on error
          setIsListening(false);
        };

        recognition.onend = () => {
          // Auto-restart if we're supposed to be listening
          if (isListening && !isRestartingRef.current) {
            isRestartingRef.current = true;
            try {
              recognition.start();
            } catch (e) {
              console.error('Failed to restart recognition:', e);
              setIsListening(false);
            } finally {
              isRestartingRef.current = false;
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  };
}
```

## Browser Permission Handling

### Permission Request Component

```typescript
// frontend/components/voice/permission-request.tsx
"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PermissionRequestProps {
  onGranted: () => void;
  onDenied: () => void;
}

export function PermissionRequest({ onGranted, onDenied }: PermissionRequestProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');

  useEffect(() => {
    // Check permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as any })
        .then((result) => {
          setPermissionStatus(result.state);
          if (result.state === 'granted') {
            onGranted();
          } else if (result.state === 'denied') {
            setShowDialog(true);
          }
        })
        .catch(() => {
          setPermissionStatus('unsupported');
        });
    }
  }, [onGranted]);

  const requestPermission = async () => {
    try {
      // Request microphone access by starting speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition ||
                               (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setPermissionStatus('unsupported');
        onDenied();
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.onstart = () => {
        setPermissionStatus('granted');
        setShowDialog(false);
        onGranted();
        recognition.stop();
      };

      recognition.onerror = () => {
        setPermissionStatus('denied');
      };

      recognition.start();
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermissionStatus('denied');
      setShowDialog(true);
    }
  };

  return (
    <>
      {/* Permission Status Indicator */}
      {permissionStatus === 'denied' && (
        <Button
          onClick={() => setShowDialog(true)}
          variant="outline"
          className="text-cyber-priority-high border-cyber-priority-high/50"
        >
          <Mic className="h-4 w-4 mr-2" />
          Enable Microphone
        </Button>
      )}

      {/* Permission Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass-effect border border-cyber-neon-blue/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-cyber-neon-blue" />
              Microphone Access Required
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-cyber-text-secondary">
            To use voice commands, we need access to your microphone.
            Your audio is processed locally and never sent to our servers.
          </DialogDescription>

          {permissionStatus === 'denied' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-cyber-priority-high/10 border border-cyber-priority-high/30 mb-4">
              <AlertCircle className="h-5 w-5 text-cyber-priority-high flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyber-priority-high">
                <p className="font-medium">Microphone access denied</p>
                <p className="mt-1">
                  Please enable microphone access in your browser settings and refresh the page.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                onDenied();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={requestPermission}
              className="cyber-glow-blue"
            >
              Allow Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## ChatKit Widget Integration

### Voice-Enabled Chat Input

```typescript
// frontend/components/chat/voice-chat-input.tsx
"use client";

import { useState } from 'react';
import { Mic, Send, CornerUpLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';

interface VoiceChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function VoiceChatInput({
  onSendMessage,
  placeholder = "Type or speak your message...",
  disabled = false,
}: VoiceChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous = false,
    interimResults = true,
    onResult: (transcript, isFinal) => {
      setInputValue(transcript);
      if (isFinal) {
        // Auto-send on final result
        setTimeout(() => {
          onSendMessage(transcript);
          setInputValue('');
        }, 500);
      }
    },
  });

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 glass-effect border border-cyber-text-muted/30 rounded-lg">
      {/* Voice Input Button */}
      {isSupported && (
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={cn(
            "transition-all duration-200",
            isListening && "animate-pulse"
          )}
          title={isListening ? "Stop recording" : "Start voice input"}
        >
          <Mic className={cn(
            "h-4 w-4",
            isListening ? "text-cyber-priority-high" : "text-cyber-neon-blue"
          )} />
        </Button>
      )}

      {/* Text Input */}
      <input
        type="text"
        value={isListening ? interimTranscript || transcript : inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isListening) {
            handleSend();
          }
        }}
        placeholder={isListening ? "Listening..." : placeholder}
        disabled={disabled || isListening}
        className={cn(
          "flex-1 px-4 py-2 rounded-md bg-cyber-bg-darker border border-cyber-text-muted/30",
          "text-cyber-text-primary placeholder:text-cyber-text-muted",
          "focus:outline-none focus:border-cyber-neon-blue/50 focus:shadow-[0_0_15px_rgba(var(--cyber-neon-blue)_/_0.3)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isListening && "cursor-wait"
        )}
      />

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={disabled || !inputValue.trim() || isListening}
        className="cyber-glow-blue"
        title="Send message"
      >
        {isListening ? (
          <CornerUpLeft className="h-4 w-4 animate-pulse" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
```

## Agents SDK Integration

### Voice Command Processor

```python
# backend/app/agents/voice_processor.py
"""
Process voice transcripts and feed to Agents SDK.
"""
from app.agents.todo_agent import run_agent_conversation
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


async def process_voice_command(
    transcript: str,
    user_id: str,
    conversation_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Process voice transcript through agent.

    Args:
        transcript: Speech-to-text transcript
        user_id: User ID from JWT
        conversation_id: Optional conversation ID for context

    Returns:
        Agent response with tool calls

    Example:
        await process_voice_command("Add a task buy groceries", "user-123")
        # Returns: {'response': 'Task created successfully', 'tool_calls': [...]}
    """
    try:
        # Run agent conversation with transcript
        result = await run_agent_conversation(
            user_id=user_id,
            user_message=transcript,
            conversation_history=None,  # TODO: Implement conversation persistence
        )

        logger.info(f"Processed voice command for user {user_id}: {transcript}")

        return {
            'success': True,
            'transcript': transcript,
            'response': result['response'],
            'tool_calls': result['tool_calls'],
            'iterations': result['iterations'],
        }

    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        return {
            'success': False,
            'error': str(e),
            'transcript': transcript,
        }


def extract_todo_command(transcript: str) -> Dict[str, Any]:
    """
    Extract Todo command intent from transcript.

    Args:
        transcript: Speech-to-text transcript

    Returns:
        Parsed command with intent and parameters

    Example:
        extract_todo_command("create a task called buy groceries with high priority")
        # Returns: {'intent': 'create_task', 'parameters': {'title': 'buy groceries', 'priority': 'high'}}
    """
    transcript_lower = transcript.lower()

    # Simple pattern matching (can be enhanced with NLP)
    if 'create' in transcript_lower or 'add' in transcript_lower or 'new' in transcript_lower:
        return {'intent': 'create_task', 'confidence': 'high'}

    elif 'list' in transcript_lower or 'show' in transcript_lower or 'all task' in transcript_lower:
        return {'intent': 'list_tasks', 'confidence': 'high'}

    elif 'complete' in transcript_lower or 'finish' in transcript_lower or 'done' in transcript_lower:
        return {'intent': 'complete_task', 'confidence': 'high'}

    elif 'delete' in transcript_lower or 'remove' in transcript_lower:
        return {'intent': 'delete_task', 'confidence': 'high'}

    elif 'update' in transcript_lower or 'change' in transcript_lower or 'modify' in transcript_lower:
        return {'intent': 'update_task', 'confidence': 'high'}

    else:
        return {'intent': 'unknown', 'confidence': 'low'}
```

### FastAPI Endpoint for Voice Commands

```python
# backend/app/api/routes/voice.py
"""FastAPI endpoints for voice command processing."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.api.deps import get_current_user
from app.agents.voice_processor import process_voice_command
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])


class VoiceCommandRequest(BaseModel):
    """Request schema for voice command processing."""
    transcript: str = Field(..., min_length=1, max_length=500)
    conversation_id: Optional[str] = Field(None)


class VoiceCommandResponse(BaseModel):
    """Response schema for voice command processing."""
    success: bool
    transcript: str
    response: Optional[str] = None
    tool_calls: list = []
    message: str


@router.post("/command", response_model=VoiceCommandResponse)
async def process_voice_command_endpoint(
    request: VoiceCommandRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Process voice command transcript.

    - **transcript**: Speech-to-text transcript from frontend
    - **conversation_id**: Optional conversation ID for context

    Returns:
        Agent response with tool execution results

    Example:
        POST /api/voice/command
        {
            "transcript": "Add a task buy groceries with high priority"
        }
    """
    try:
        result = await process_voice_command(
            transcript=request.transcript,
            user_id=user_id,
            conversation_id=request.conversation_id,
        )

        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Failed to process voice command')
            )

        return VoiceCommandResponse(
            success=True,
            transcript=result['transcript'],
            response=result['response'],
            tool_calls=result.get('tool_calls', []),
            message="Voice command processed successfully",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice command processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process voice command: {str(e)}"
        )
```

## Error Handling and Browser Compatibility

### Comprehensive Error Handler

```typescript
// frontend/lib/speech-recognition-errors.ts
"""Error handling utilities for speech recognition."""

export enum SpeechRecognitionError {
  NOT_SUPPORTED = 'not-supported',
  PERMISSION_DENIED = 'permission-denied',
  NO_MICROPHONE = 'no-microphone',
  NETWORK_ERROR = 'network-error',
  ABORTED = 'aborted',
  UNKNOWN = 'unknown',
}

export function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'not-supported': 'Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.',
    'no-speech': 'No speech detected. Please try again.',
    'audio-capture': 'Microphone not found or permission denied. Please check your device settings.',
    'not-allowed': 'Microphone permission denied. Please allow microphone access in your browser.',
    'network': 'Network error occurred. Please check your connection.',
    'aborted': 'Voice input was cancelled.',
  };

  return errorMessages[error] || 'An error occurred with voice input.';
}

export function isBrowserSupported(): boolean {
  if (typeof window === 'undefined') return false;

  const SpeechRecognition = (window as any).SpeechRecognition ||
                               (window as any).webkitSpeechRecognition;

  return !!SpeechRecognition;
}

export function checkMicrophonePermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return Promise.resolve('prompt');
  }

  return navigator.permissions.query({ name: 'microphone' as any })
    .then((result) => result.state)
    .catch(() => 'prompt');
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks to release microphone
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}
```

## Accessibility Features

### Keyboard Shortcuts

```typescript
// frontend/components/voice/voice-shortcuts.tsx
"use client";

import { useEffect } from 'react';

interface VoiceShortcutsProps {
  onToggleListening: () => void;
}

export function VoiceShortcuts({ onToggleListening }: VoiceShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+V or Cmd+Shift+V to toggle voice input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'v') {
        e.preventDefault();
        onToggleListening();
      }

      // Escape to stop listening
      if (e.key === 'Escape') {
        // Dispatch custom event to stop listening
        window.dispatchEvent(new CustomEvent('stop-voice-listening'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleListening]);

  return null; // This component doesn't render anything
}

// Usage in chat component:
// <VoiceShortcuts onToggleListening={() => toggleListening()} />
```

### Visual Feedback and ARIA Labels

```typescript
// Enhanced microphone button with full accessibility
<Button
  onClick={handleClick}
  variant={isListening ? "destructive" : "outline"}
  size="icon"
  aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
  aria-pressed={isListening}
  role="switch"
  aria-checked={isListening}
  className={cn(
    "transition-all duration-200",
    isListening && "animate-pulse"
  )}
>
  {isListening ? (
    <MicOff className="h-4 w-4" aria-hidden="true" />
  ) : (
    <Mic className="h-4 w-4" aria-hidden="true" />
  )}
  <span className="sr-only">
    {isListening ? "Stop recording" : "Start recording"}
  </span>
</Button>
```

## Configuration

### Environment Variables

```bash
# frontend/.env.local (add to existing)
NEXT_PUBLIC_VOICE_INPUT_ENABLED=true
NEXT_PUBLIC_SPEECH_RECOGNITION_LANG=en-US
NEXT_PUBLIC_CONTINUOUS_LISTENING=false
```

### Feature Flags

```typescript
// frontend/lib/feature-flags.ts
export const VOICE_INPUT_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_VOICE_INPUT_ENABLED === 'true',
  defaultLanguage: process.env.NEXT_PUBLIC_SPEECH_RECOGNITION_LANG || 'en-US',
  continuousListening: process.env.NEXT_PUBLIC_CONTINUOUS_LISTENING === 'true',
  supportedBrowsers: ['Chrome', 'Edge', 'Safari'],
  requiresHTTPS: true,
};
```

## Testing Strategy

### Unit Tests for Speech Hook

```typescript
// frontend/hooks/__tests__/use-speech-recognition.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpeechRecognition } from '../use-speech-recognition';

// Mock Web Speech API
const mockSpeechRecognition = jest.fn();

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    mockSpeechRecognition.mockClear();
  });

  it('should detect browser support', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
  });

  it('should start listening', async () => {
    const mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      onresult: null,
      onerror: null,
      onend: null,
    };

    mockSpeechRecognition.mockReturnValue(mockRecognition);

    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    expect(mockRecognition.start).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);
  });

  it('should handle speech results', async () => {
    let onResultCallback: any;

    const mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      onresult: null,
      onerror: null,
      onend: null,
    };

    mockSpeechRecognition.mockImplementation((mock: any) => {
      mock.onresult = onResultCallback;
      return mock;
    });

    const onResult = jest.fn();

    renderHook(() => useSpeechRecognition({ onResult }));

    // Simulate speech result
    act(() => {
      if (onResultCallback) {
        onResultCallback({
          resultIndex: 0,
          results: [
            {
              isFinal: true,
              0: {
                transcript: 'Hello world',
              },
            },
          ],
        });
      }
    });

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith('Hello world', true);
    });
  });
});
```

### E2E Voice Command Tests

```python
# backend/tests/test_voice_commands.py
"""Test voice command processing."""
import pytest
from app.agents.voice_processor import process_voice_command, extract_todo_command


@pytest.mark.asyncio
async def test_process_create_task_voice_command():
    """Test processing voice command for creating task."""
    result = await process_voice_command(
        transcript="Add a task called buy groceries",
        user_id="test-user-123"
    )

    assert result['success'] is True
    assert 'response' in result
    assert 'tool_calls' in result


def test_extract_todo_command_intent():
    """Test extracting intent from transcript."""
    result = extract_todo_command("Create a new task for shopping")

    assert result['intent'] == 'create_task'
    assert result['confidence'] == 'high'


def test_extract_list_tasks_intent():
    """Test extracting list tasks intent."""
    result = extract_todo_command("Show me all my tasks")

    assert result['intent'] == 'list_tasks'
    assert result['confidence'] == 'high'
```

## Quality Assurance Checklist

- [ ] Web Speech API hook created with proper TypeScript types
- [ ] Browser compatibility checked (Chrome, Edge, Safari)
- [ ] Microphone permission handling implemented
- [ ] Error handling for all speech recognition errors
- [ ] Visual feedback for listening state
- [ ] Microphone button integrated in ChatKit widget
- [ ] Continuous listening mode available (optional)
- [ ] Voice transcripts fed to Agents SDK
- [ ] FastAPI endpoint for voice command processing
- [ ] Keyboard shortcuts for accessibility
- [ ] ARIA labels and semantic HTML
- [ ] Unit tests for speech hook
- [ ] E2E tests for voice command flow
- [ ] HTTPS requirement documented
- [ ] Fallback for unsupported browsers

## References and Further Reading

- [MDN: Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [Web Speech API Specification](https://webaudio.github.io/web-speech-api/)
- [React Speech Recognition Hook Tutorial](https://medium.com/@kom50/a-reusable-usespeechrecognition-hook-for-react-aab358681c23)
- [AssemblyAI: React Speech Recognition](https://www.assemblyai.com/blog/react-speech-recognition-with-react-hooks)
- [Continuous Speech Recognition Stack Overflow](https://stackoverflow.com/questions/29996350/speech-recognition-run-continuously)
- [Build Voice Commands in JavaScript](https://medium.com/@codebyumar/build-voice-basics-in-javascript-with-the-speechrecognition-api-a9e4b19181c5)
- [Next.js Audio to Text Recognition](https://github.com/KuroshHusseini/nextjs-audio-to-text-recognition)
- [AI Voice Translator with Next.js](https://spacejelly.dev/posts/how-to-build-an-ai-voice-translator-in-next-js-with-web-speech-api-openai)
