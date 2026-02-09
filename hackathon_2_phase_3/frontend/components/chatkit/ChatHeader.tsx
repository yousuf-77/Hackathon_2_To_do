"use client";

import { useState } from "react";
import { X, Trash2, Settings, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChatHeaderProps {
  onClose?: () => void;
  onClearHistory?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  showLanguageToggle?: boolean;
}

/**
 * ChatHeader Component
 *
 * Header for chat widget with session controls:
 * - Close button
 * - Clear history button
 * - Language toggle (for Urdu support)
 * - Settings menu
 *
 * Features:
 * - Cyberpunk glassmorphism styling
 * - Confirmation before clearing history
 * - Responsive design
 */
export function ChatHeader({
  onClose,
  onClearHistory,
  title = "AI Task Assistant",
  subtitle = "Manage tasks with natural language",
  className,
  showLanguageToggle = false,
}: ChatHeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    if (showConfirm) {
      onClearHistory?.();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3",
        "bg-gradient-to-r from-slate-900/95 to-slate-800/95",
        "backdrop-blur-xl border-b border-cyan-500/30",
        "shadow-lg shadow-cyan-500/10",
        className
      )}
    >
      {/* Left: Title and Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle (hidden by default, shown for Urdu support) */}
        {showLanguageToggle && (
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-600/50 hover:border-slate-500"
            title="Switch language"
          >
            EN
          </button>
        )}

        {/* Clear History Button */}
        <button
          onClick={handleClear}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "flex items-center justify-center",
            showConfirm
              ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
              : "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500"
          )}
          title={showConfirm ? "Click to confirm" : "Clear conversation"}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Confirmation Tooltip */}
      {showConfirm && (
        <div className="absolute top-16 right-16 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-xl shadow-lg">
          <p className="text-xs text-red-400 font-medium">
            Click again to confirm
          </p>
        </div>
      )}
    </div>
  );
}
