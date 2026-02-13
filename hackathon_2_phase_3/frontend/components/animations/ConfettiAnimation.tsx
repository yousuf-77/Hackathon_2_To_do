"use client";

/**
 * ConfettiAnimation - Celebration animation using canvas-confetti
 * Phase 3: AI-Powered Todo Chatbot Enhancements
 *
 * Trigger confetti celebrations for:
 * - Task completion
 * - First task of the day
 * - All tasks completed
 * - Milestone achievements
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiAnimationProps {
  /**
   * Trigger animation on mount
   * @default false
   */
  trigger?: boolean;
  /**
   * Confetti configuration preset
   * @default "celebration"
   */
  preset?: "celebration" | "fireworks" | "cannon" | "stars" | "minimal";
  /**
   * Duration in milliseconds
   * @default 3000
   */
  duration?: number;
  /**
   * Particle count
   * @default 100
   */
  particleCount?: number;
  /**
   * Spread angle
   * @default 70
   */
  spread?: number;
  /**
   * Origin position (0-1)
   * @default { x: 0.5, y: 0.5 }
   */
  origin?: { x: number; y: number };
  /**
   * Custom colors
   * @default undefined (uses cyberpunk colors)
   */
  colors?: string[];
}

/**
 * Cyberpunk neon color palette
 */
const CYBERPUNK_COLORS = [
  "#00d4ff", // Neon Blue (cyan)
  "#ff00ff", // Neon Magenta
  "#00ff88", // Neon Green
  "#ffff00", // Neon Yellow
  "#ff6b00", // Neon Orange
];

/**
 * Confetti presets
 */
const PRESETS = {
  celebration: {
    particleCount: 150,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors: CYBERPUNK_COLORS,
    scalar: 1.2,
    ticks: 200,
    gravity: 0.5,
  },
  fireworks: {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: CYBERPUNK_COLORS,
    scalar: 1.5,
    ticks: 150,
    gravity: 1,
  },
  cannon: {
    particleCount: 200,
    spread: 90,
    origin: { x: 0.5, y: 1 },
    colors: CYBERPUNK_COLORS,
    scalar: 1.3,
    ticks: 250,
    gravity: 0.8,
    startVelocity: 60,
  },
  stars: {
    particleCount: 80,
    spread: 55,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#ffffff", "#00d4ff", "#ffff00"],
    scalar: 0.8,
    ticks: 300,
    gravity: 0.2,
    shapes: ["star"],
  },
  minimal: {
    particleCount: 30,
    spread: 50,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#00d4ff"],
    scalar: 0.6,
    ticks: 100,
    gravity: 0.6,
  },
};

/**
 * Confetti animation component
 *
 * @example
 * ```tsx
 * // Trigger on task complete
 * function TaskCompleteButton() {
 *   const [showConfetti, setShowConfetti] = useState(false);
 *
 *   const handleComplete = () => {
 *     setShowConfetti(true);
 *     // ... complete task logic
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleComplete}>Complete Task</button>
 *       {showConfetti && (
 *         <ConfettiAnimation
 *           trigger={showConfetti}
 *           preset="celebration"
 *           duration={3000}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function ConfettiAnimation({
  trigger = false,
  preset = "celebration",
  duration = 3000,
  particleCount,
  spread,
  origin,
  colors,
}: ConfettiAnimationProps) {
  useEffect(() => {
    if (!trigger) return;

    // Get preset configuration
    const presetConfig = PRESETS[preset];

    // Merge with custom overrides
    const config = {
      ...presetConfig,
      ...(particleCount !== undefined && { particleCount }),
      ...(spread !== undefined && { spread }),
      ...(origin !== undefined && { origin }),
      ...(colors !== undefined && { colors }),
    };

    // Fire confetti
    // @ts-ignore - canvas-confetti types don't include the 'end' property
    const result = confetti({
      ...config,
    } as any);
    const { end } = result as any;

    // Auto-stop after duration
    const timer = setTimeout(() => {
      end();
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, preset, duration, particleCount, spread, origin, colors]);

  // This component doesn't render anything visible
  // It only triggers the canvas-confetti side effect
  return null;
}

/**
 * Hook to trigger confetti programmatically
 *
 * @example
 * ```tsx
 * function TaskCard() {
 *   const fireConfetti = useConfetti();
 *
 *   const handleComplete = () => {
 *     fireConfetti({ preset: "celebration" });
 *   };
 *
 *   return <button onClick={handleComplete}>Complete</button>;
 * }
 * ```
 */
export function useConfetti() {
  return (options: Omit<ConfettiAnimationProps, "trigger"> = {}) => {
    const {
      preset = "celebration",
      duration = 3000,
      particleCount,
      spread,
      origin,
      colors,
    } = options;

    // Get preset configuration
    const presetConfig = PRESETS[preset];

    // Merge with custom overrides
    const config = {
      ...presetConfig,
      ...(particleCount !== undefined && { particleCount }),
      ...(spread !== undefined && { spread }),
      ...(origin !== undefined && { origin }),
      ...(colors !== undefined && { colors }),
    };

    // Fire confetti
    // @ts-ignore - canvas-confetti types don't include the 'end' property
    const result = confetti({
      ...config,
    } as any);
    const { end } = result as any;

    // Auto-stop after duration
    setTimeout(() => {
      end();
    }, duration);
  };
}

/**
 * Specialized confetti functions for specific scenarios
 */

/**
 * Fire confetti when task is completed
 */
export function celebrateTaskComplete() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ["#00ff88", "#00d4ff"], // Green + Blue
    scalar: 1.2,
    ticks: 150,
  });
}

/**
 * Fire confetti for first task of the day
 */
export function celebrateFirstTask() {
  const duration = 4000;
  const end = Date.now() + duration;

  // Fire multiple bursts
  const colors = CYBERPUNK_COLORS;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Fire confetti when all tasks are completed
 */
export function celebrateAllTasksComplete() {
  const defaults = {
    spread: 360,
    ticks: 200,
    gravity: 0,
    colors: CYBERPUNK_COLORS,
  };

  // Fire from all sides
  confetti({
    ...defaults,
    particleCount: 100,
    origin: { x: 0.5, y: 0.5 },
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 80,
      origin: { x: 0.2, y: 0.5 },
    });
    confetti({
      ...defaults,
      particleCount: 80,
      origin: { x: 0.8, y: 0.5 },
    });
  }, 250);

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 60,
      origin: { x: 0.3, y: 0.5 },
    });
    confetti({
      ...defaults,
      particleCount: 60,
      origin: { x: 0.7, y: 0.5 },
    });
  }, 500);
}

export default ConfettiAnimation;
