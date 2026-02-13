"use client";

/**
 * TaskFilters - Enhanced task filtering with search, status, priority, tags
 * Phase 3: AI-Powered Todo Chatbot Enhancements
 */

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div
      className={cn(
        "glass-card p-4 space-y-4",
        "border border-cyan-500/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neon-blue" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-neon-blue hover:text-cyan-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-slate-900/50 border-cyan-500/20 focus:border-cyan-500/50"
        />
      </div>

      {/* Filter row: Status, Priority, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="status-all" value="all">All Status</SelectItem>
            <SelectItem key="status-pending" value="pending">Pending</SelectItem>
            <SelectItem key="status-completed" value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="priority-all" value="all">All Priorities</SelectItem>
            <SelectItem key="priority-high" value="high">High</SelectItem>
            <SelectItem key="priority-medium" value="medium">Medium</SelectItem>
            <SelectItem key="priority-low" value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-slate-900/50 border-cyan-500/20">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="sort-created" value="created_at">Created</SelectItem>
            <SelectItem key="sort-due" value="due_date">Due Date</SelectItem>
            <SelectItem key="sort-priority" value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tag filters */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Tags</span>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected
                      ? "bg-neon-blue text-slate-950 border-neon-blue"
                      : "hover:border-cyan-500/50"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              );
            })}
            {availableTags.length === 0 && (
              <span className="text-xs text-muted-foreground">
                No tags available
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active filter count */}
      {hasActiveFilters && (
        <div className="text-xs text-muted-foreground">
          {selectedTags.length > 0 && `${selectedTags.length} tag(s) selected`}
        </div>
      )}
    </div>
  );
}

export default TaskFilters;
