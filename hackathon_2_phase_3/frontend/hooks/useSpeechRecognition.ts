"use client";

/**
 * useSpeechRecognition - Custom hook for Web Speech API integration
 * Phase 3: Voice Input Bonus Feature
 */

import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechRecognitionOptions {
  /**
   * Language code for speech recognition
   * @default "en-US"
   */
  language?: string;
  /**
   * Continuous listening mode
   * @default false
   */
  continuous?: boolean;
  /**
   * Interim results (show partial results while speaking)
   * @default true
   */
  interimResults?: boolean;
  /**
   * Callback when transcript is available
   */
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  /**
   * Callback when error occurs
   */
  onError?: (error: string) => void;
}

interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    language = "en-US",
    continuous = false,
    interimResults = true,
    onTranscript,
    onError,
  } = options;

  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const isSupported = !!SpeechRecognitionAPI;

      setState((prev) => ({ ...prev, isSupported }));

      if (isSupported && SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;

        recognition.onstart = () => {
          setState((prev) => ({ ...prev, isListening: true, error: null }));
        };

        recognition.onend = () => {
          setState((prev) => ({ ...prev, isListening: false }));
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          // Update final transcript
          if (finalTranscript) {
            finalTranscriptRef.current += finalTranscript;
          }

          setState((prev) => ({
            ...prev,
            transcript: finalTranscriptRef.current,
            interimTranscript,
          }));

          // Call callback
          if (onTranscript) {
            if (finalTranscript) {
              onTranscript(finalTranscriptRef.current.trim(), true);
            } else if (interimTranscript && interimResults) {
              onTranscript(
                (finalTranscriptRef.current + interimTranscript).trim(),
                false
              );
            }
          }
        };

        recognition.onerror = (event: any) => {
          const errorMessage = event.error || "Unknown error";
          setState((prev) => ({
            ...prev,
            error: errorMessage,
            isListening: false,
          }));

          if (onError) {
            onError(errorMessage);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start recognition";
        setState((prev) => ({ ...prev, error: errorMessage }));
        if (onError) {
          onError(errorMessage);
        }
      }
    }
  }, [state.isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
      error: null,
    }));
  }, []);

  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setState((prev) => ({ ...prev, isListening: false }));
    }
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    abortListening,
  };
}
