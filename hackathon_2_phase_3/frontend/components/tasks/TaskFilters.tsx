"use client";

/**
 * TaskFilters - Enhanced task filtering with search, status, priority, tags
 * Phase 3: AI-Powered Todo Chatbot Enhancements
 * Added: Glowing effects, animations, and improved visual appeal
 */

import { Search, Filter, Sparkles, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type TaskStatus = "all" | "pending" | "completed";
export type TaskPriority = "all" | "low" | "medium" | "high";
export type SortBy = "created_at" | "due_date" | "priority";

interface TaskFiltersProps {
  /**
   * Search query filter
   */
  searchQuery: string;
  /**
   * Update search query
   */
  onSearchChange: (query: string) => void;
  /**
   * Status filter
   */
  statusFilter: TaskStatus;
  /**
   * Update status filter
   */
  onStatusChange: (status: TaskStatus) => void;
  /**
   * Priority filter
   */
  priorityFilter: TaskPriority;
  /**
   * Update priority filter
   */
  onPriorityChange: (priority: TaskPriority) => void;
  /**
   * Sort by field
   */
  sortBy: SortBy;
  /**
   * Update sort by
   */
  onSortChange: (sortBy: SortBy) => void;
  /**
   * Selected tags
   */
  selectedTags: string[];
  /**
   * Update selected tags
   */
  onTagsChange: (tags: string[]) => void;
  /**
   * Available tags from all tasks
   */
  availableTags: string[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Task filters component with search, status, priority, and tag filtering
 * Enhanced with animations, glowing effects, and improved UI
 *
 * @example
 * ```tsx
 * function TaskPage() {
 *   const [searchQuery, setSearchQuery] = useState("");
 *   const [statusFilter, setStatusFilter] = useState<TaskStatus>("all");
 *   const [priorityFilter, setPriorityFilter] = useState<TaskPriority>("all");
 *   const [sortBy, setSortBy] = useState<SortBy>("created_at");
 *   const [selectedTags, setSelectedTags] = useState<string[]>([]);
 *
 *   // Apply filters to tasks...
 *
 *   return (
 *     <TaskFilters
 *       searchQuery={searchQuery}
 *       onSearchChange={setSearchQuery}
 *       statusFilter={statusFilter}
 *       onStatusChange={setStatusFilter}
 *       priorityFilter={priorityFilter}
 *       onPriorityChange={setPriorityFilter}
 *       sortBy={sortBy}
 *       onSortChange={setSortBy}
 *       selectedTags={selectedTags}
 *       onTagsChange={setSelectedTags}
 *       availableTags={["work", "personal", "urgent"]}
 *     />
 *   );
 * }
 * ```
 */
export function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  selectedTags,
  onTagsChange,
  availableTags,
  className,
}: TaskFiltersProps) {
  // Fix prop destructuring typo
  /**
   * Toggle tag selection
   */
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
    onPriorityChange("all");
    onTagsChange([]);
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    selectedTags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
      className={cn(
        "relative group",
        "glass-card p-5 space-y-4",
        "border border-primary/20",
        "hover:border-primary/30 transition-all duration-300",
        className
      )}
      style={{
        boxShadow: `
          0 0 20px hsl(var(--primary) / 0.1),
          inset 0 0 20px hsl(var(--primary) / 0.02)
        `.trim(),
      }}
    >
      {/* Animated glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0.1), transparent 50%)",
              "radial-gradient(circle at 100% 100%, hsl(var(--secondary) / 0.1), transparent 50%)",
              "radial-gradient(circle at 100% 0%, hsl(var(--accent) / 0.1), transparent 50%)",
              "radial-gradient(circle at 0% 100%, hsl(var(--primary) / 0.1), transparent 50%)",
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* Glow behind icon */}
            <div
              className="absolute inset-0 rounded-lg blur-md opacity-50"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
              }}
            />
            <div className="relative p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
              <Filter className="w-4 h-4 text-neon-blue" />
            </div>
          </motion.div>
          <span className="text-sm font-semibold text-foreground">Filters</span>
          <Sparkles className="w-4 h-4 text-neon-blue animate-pulse" />
        </div>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all overflow-hidden"
              title="Clear all filters"
            >
              {/* Animated glow on hover */}
              <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    boxShadow: [
                      "inset 0 0 0px rgba(239, 68, 68, 0)",
                      "inset 0 0 10px rgba(239, 68, 68, 0.2)",
                      "inset 0 0 0px rgba(239, 68, 68, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <X className="w-3 h-3 relative z-10" />
              <span className="relative z-10">Clear all</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search input */}
      <div className="relative">
        <motion.div
          animate={{
            x: [0, 3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </motion.div>
        <Input
          type="text"
          placeholder="Search tasks by title or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card/50 border-primary/20 focus:border-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all"
        />
        {/* Subtle glow effect on focus */}
        <div className="absolute inset-0 rounded-lg opacity-0 pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 blur-sm" />
        </div>
      </div>

      {/* Filter row: Status, Priority, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status filter */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
        >
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="status-all" value="all">All Status</SelectItem>
              <SelectItem key="status-pending" value="pending">Pending</SelectItem>
              <SelectItem key="status-completed" value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Priority filter */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20, delay: 0.05 }}
        >
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="priority-all" value="all">All Priorities</SelectItem>
              <SelectItem key="priority-high" value="high">High</SelectItem>
              <SelectItem key="priority-medium" value="medium">Medium</SelectItem>
              <SelectItem key="priority-low" value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Sort by */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="sort-created" value="created_at">Created</SelectItem>
              <SelectItem key="sort-due" value="due_date">Due Date</SelectItem>
              <SelectItem key="sort-priority" value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Tag filters */}
      {availableTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        "border backdrop-blur-sm",
                        isSelected
                          ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-neon-blue border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                          : "hover:border-primary/40 hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      <span className="flex items-center gap-1.5">
                        #{tag}
                        {isSelected && <Sparkles className="w-3 h-3" />}
                      </span>
                    </Badge>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Active filter count */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              <span>
                {selectedTags.length > 0 && `${selectedTags.length} tag(s) selected`}
                {selectedTags.length > 0 && (
                  <span className="text-muted-foreground/60"> • </span>
                )}
                filtered by your criteria
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary/50"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TaskFilters;
