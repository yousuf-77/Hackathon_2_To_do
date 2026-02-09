"use client";

/**
 * VoiceInputButton - Voice input button with Web Speech API integration
 * Phase 3: Voice Input Bonus Feature
 */

import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInputButtonProps {
  /**
   * Callback when final transcript is available
   */
  onTranscript: (transcript: string) => void;
  /**
   * Language code for speech recognition
   * @default "en-US"
   */
  language?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Show activity indicator
   * @default true
   */
  showIndicator?: boolean;
}

/**
 * VoiceInputButton Component
 *
 * Microphone button for speech-to-text input:
 * - Integrates Web Speech API
 * - Visual feedback for listening state
 * - Pulsing animation when active
 * - Error handling and fallback
 *
 * Features:
 * - Cyberpunk styling with neon glows
 * - Real-time transcript display
 * - Interim results (shows partial transcript while speaking)
 * - Automatic language detection support
 */
export function VoiceInputButton({
  onTranscript,
  language = "en-US",
  className,
  disabled = false,
  showIndicator = true,
}: VoiceInputButtonProps) {
  const [showError, setShowError] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        onTranscript(text);
        stopListening();
      }
    },
    onError: (errorMessage) => {
      console.error("Speech recognition error:", errorMessage);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    },
  });

  const handleClick = () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={cn(
          "p-2 rounded-lg bg-slate-700/30 text-slate-500",
          "border border-slate-600/30",
          "cursor-not-allowed opacity-50",
          className
        )}
        title="Speech recognition not supported"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "flex items-center justify-center",
          "relative overflow-hidden",
          // Active state
          isListening
            ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
            : "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500",
          // Disabled state
          disabled && "opacity-50 cursor-not-allowed",
          // Pulsing animation when listening
          isListening && "animate-pulse",
          className
        )}
        title={isListening ? "Stop recording" : "Start voice input"}
      >
        {/* Pulsing circles effect when listening */}
        {isListening && showIndicator && (
          <>
            <span
              className={cn(
                "absolute inset-0 rounded-lg bg-red-500/30 animate-ping",
                "opacity-75"
              )}
              style={{ animationDuration: "1s" }}
            />
            <span
              className={cn(
                "absolute inset-0 rounded-lg bg-red-500/20 animate-ping",
                "opacity-50"
              )}
              style={{ animationDuration: "1.5s" }}
            />
          </>
        )}

        <Mic className={cn("w-5 h-5 relative z-10", isListening && "animate-pulse")} />
      </button>

      {/* Transcript tooltip */}
      {(interimTranscript || transcript) && (
        <div
          className={cn(
            "absolute bottom-full right-0 mb-2",
            "px-3 py-2 rounded-lg",
            "bg-slate-800/95 backdrop-blur-xl",
            "border border-cyan-500/30",
            "shadow-lg",
            "max-w-[200px]",
            "text-xs text-slate-300",
            "animate-in fade-in slide-in-from-bottom-2 duration-200"
          )}
        >
          <p className="line-clamp-3">
            {interimTranscript || transcript}
          </p>
          {interimTranscript && (
            <p className="text-[10px] text-slate-500 mt-1">Listening...</p>
          )}
        </div>
      )}

      {/* Error message */}
      {showError && error && (
        <div
          className={cn(
            "absolute bottom-full right-0 mb-2",
            "px-3 py-2 rounded-lg",
            "bg-red-500/20 backdrop-blur-xl",
            "border border-red-500/50",
            "shadow-lg",
            "text-xs text-red-400",
            "whitespace-nowrap"
          )}
        >
          {error}
        </div>
      )}
    </div>
  );
}
