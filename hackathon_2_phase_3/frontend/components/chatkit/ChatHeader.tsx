"use client";

import { useState } from "react";
import { X, Trash2, Settings, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHeaderProps {
  onClose?: () => void;
  onClearHistory?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  showLanguageToggle?: boolean;
}

/**
 * ChatHeader Component with enhanced glowing effects
 *
 * Header for chat widget with session controls:
 * - Close button
 * - Clear history button
 * - Language toggle (for Urdu support)
 * - Settings menu
 *
 * Features:
 * - Cyberpunk glassmorphism styling
 * - Animated glowing effects
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
        "relative overflow-hidden",
        "flex items-center justify-between px-4 py-3",
        "bg-gradient-to-r from-slate-900/95 to-slate-800/95",
        "backdrop-blur-xl border-b border-cyan-500/30",
        "shadow-lg shadow-cyan-500/10",
        className
      )}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3), transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3), transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.3), transparent 50%)",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left: Title and Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Animated icon container */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex items-center justify-center"
          >
            {/* Glow effect behind icon */}
            <div
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 opacity-50 blur-md"
              style={{
                boxShadow: `
                  0 0 15px rgba(6, 182, 212, 0.5),
                  0 0 30px rgba(168, 85, 247, 0.3),
                  inset 0 0 10px rgba(6, 182, 212, 0.2)
                `.trim(),
              }}
            />
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40">
              <MessageSquare className="w-5 h-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            </div>
          </motion.div>

          <div className="flex flex-col min-w-0">
            <motion.h3
              className="text-sm font-semibold text-white truncate flex items-center gap-2"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {title}
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </motion.h3>
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle (hidden by default, shown for Urdu support) */}
          {showLanguageToggle && (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-600/50 hover:border-slate-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              title="Switch language"
            >
              EN
            </motion.button>
          )}

          {/* Clear History Button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: [-5, 5, -5] }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            className={cn(
              "relative p-2 rounded-lg transition-all duration-200",
              "flex items-center justify-center",
              "overflow-hidden",
              showConfirm
                ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                : "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            )}
            title={showConfirm ? "Click to confirm" : "Clear conversation"}
          >
            {/* Animated glow on hover */}
            {!showConfirm && (
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                animate={{
                  boxShadow: [
                    "inset 0 0 0px rgba(255,255,255,0)",
                    "inset 0 0 10px rgba(6,182,212,0.2)",
                    "inset 0 0 0px rgba(255,255,255,0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <Trash2 className="w-4 h-4 relative z-10" />
          </motion.button>

          {/* Close Button */}
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: [0, 90, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="relative p-2 rounded-lg bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-white hover:border-slate-500 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all overflow-hidden"
              title="Close chat"
            >
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                animate={{
                  boxShadow: [
                    "inset 0 0 0px rgba(255,255,255,0)",
                    "inset 0 0 10px rgba(236,72,153,0.2)",
                    "inset 0 0 0px rgba(255,255,255,0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <X className="w-4 h-4 relative z-10" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Confirmation Tooltip with animation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-16 right-16 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-xl shadow-lg z-20"
            style={{
              boxShadow: `
                0 0 20px rgba(239, 68, 68, 0.4),
                inset 0 0 10px rgba(239, 68, 68, 0.1)
              `.trim(),
            }}
          >
            <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚠
              </motion.div>
              Click again to confirm
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
