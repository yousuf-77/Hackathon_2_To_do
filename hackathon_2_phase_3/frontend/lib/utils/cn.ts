import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 *
 * Example:
 * ```tsx
 * cn("text-lg font-bold", isActive && "text-cyan-400", "hover:scale-105")
 * // => "text-lg font-bold text-cyan-400 hover:scale-105"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
