"use client";

/**
 * ClarificationPrompt - Interactive clarification for ambiguous input
 * Phase 3: Error Handling & Ambiguity Resolution
 */

import React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClarificationOption {
  id: string;
  label: string;
  description?: string;
}

interface ClarificationPromptProps {
  question: string;
  options: ClarificationOption[];
  onSelect?: (optionId: string) => void;
  className?: string;
}

export function ClarificationPrompt({
  question,
  options,
  onSelect,
  className,
}: ClarificationPromptProps) {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setIsSubmitted(true);
      onSelect?.(selectedOption);
    }
  };

  if (isSubmitted) return null;

  return (
    <div
      className={cn(
        "space-y-3",
        "px-4 py-3",
        "rounded-xl",
        "bg-purple-500/10",
        "border border-purple-500/30",
        "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        "animate-in",
        "slide-in-from-bottom-2",
        "fade-in-50",
        "duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-8 h-8",
              "rounded-full",
              "bg-purple-500/20",
              "flex items-center justify-center",
              "animate-pulse"
            )}
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-purple-100">
            {question}
          </p>
          <p className="text-xs text-purple-300/70 mt-1">
            Please select an option:
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2 pl-11">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "w-full",
              "text-left",
              "px-3 py-2",
              "rounded-lg",
              "border",
              "transition-all",
              "duration-200",
              selectedOption === option.id
                ? [
                    "bg-purple-500/30",
                    "border-purple-500",
                    "text-purple-100",
                    "shadow-[0_0_15px_rgba(168,85,247,0.4)]",
                  ]
                : [
                    "bg-slate-800/50",
                    "border-slate-700/50",
                    "text-slate-300",
                    "hover:bg-slate-700/50",
                    "hover:border-slate-600/50",
                  ]
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                {option.description && (
                  <p className="text-xs opacity-70 mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>

              {selectedOption === option.id && (
                <div
                  className={cn(
                    "w-4 h-4",
                    "rounded-full",
                    "bg-purple-400",
                    "shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                  )}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <div className="pl-11">
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className={cn(
            "px-4 py-2",
            "rounded-lg",
            "text-sm font-medium",
            "transition-all",
            "duration-200",
            selectedOption
              ? [
                  "bg-gradient-to-r from-purple-500 to-pink-500",
                  "text-white",
                  "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
                  "hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]",
                  "hover:scale-105",
                ]
              : [
                  "bg-slate-800",
                  "text-slate-500",
                  "cursor-not-allowed",
                ]
          )}
        >
          {selectedOption ? "Continue" : "Select an option"}
        </button>
      </div>
    </div>
  );
}
