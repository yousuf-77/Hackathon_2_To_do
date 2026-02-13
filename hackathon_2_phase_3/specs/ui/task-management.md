# specs/ui/task-management.md

## Task Management UI Specification – Phase 3 (Enhanced)

**Status:** Refined | **Priority:** Critical | **Dependencies:** @specs/ui/components.md, @specs/features/chatbot-integration.md

---

## Overview

Define the **enhanced** task management UI components for Phase 3, including **real-time task lists**, **animations**, **search/filter/sort**, **reminder notifications**, and **confetti celebrations**.

**Key Features:**
- ✅ **Real-time updates** – SWR/React Query for instant task sync
- ✅ **Framer Motion animations** – Smooth fade/slide transitions
- ✅ **Priority color coding** – Visual task importance
- ✅ **Due date indicators** – Upcoming deadline warnings
- ✅ **Search/Filter/Sort** – Advanced task discovery
- ✅ **Browser notifications** – Due date reminders
- ✅ **Confetti on complete** – Celebration animation
- ✅ **Export functionality** – CSV/JSON task export

**Technology Stack:**
- **State Management:** SWR/React Query
- **Animations:** Framer Motion
- **Notifications:** Browser Notification API
- **Styling:** Tailwind CSS + cyberpunk theme
- **Icons:** Lucide React

---

## 1. Component Hierarchy

```
frontend/
├── components/
│   ├── tasks/
│   │   ├── TaskList.tsx              # Main task list with real-time updates
│   │   ├── TaskCard.tsx              # Individual task with animations
│   │   ├── TaskFilters.tsx           # Search, filter, sort controls
│   │   ├── TaskCreateDialog.tsx      # Create task modal
│   │   ├── TaskEditDialog.tsx        # Edit task modal
│   │   ├── DeleteConfirmation.tsx    # Delete confirmation dialog
│   │   ├── PriorityBadge.tsx         # Priority indicator
│   │   ├── DueDateIndicator.tsx      # Due date with warnings
│   │   ├── TagList.tsx               # Tag display/chips
│   │   ├── ExportButton.tsx          # Export tasks button
│   │   └── ConfettiAnimation.tsx     # Celebration animation
│   ├── hooks/
│   │   ├── useTasks.ts               # SWR task fetching
│   │   ├── useTaskMutations.ts       # Task CRUD mutations
│   │   ├── useNotifications.ts       # Browser notifications
│   │   └── useConfetti.ts            # Confetti trigger
│   └── lib/
│       └── utils/
│           └── taskHelpers.ts        # Task utility functions
```

---

## 2. Task List Component (Real-Time)

### 2.1 TaskList.tsx

**File:** `components/tasks/TaskList.tsx`

**Key Features:**
- Real-time updates with SWR
- Framer Motion animations
- Optimistic updates
- Auto-scroll on new tasks

```tsx
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';

export function TaskList({ userId, authToken }: { userId: string; authToken: string }) {
  const { tasks, error, isLoading, mutate } = useTasks(userId, authToken);
  const { updateTask, deleteTask, completeTask } = useTaskMutations(mutate);

  // Filter/sort state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks
      ?.filter(task => {
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        if (filters.status !== 'all' && task.status !== filters.status) {
          return false;
        }
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        return a[filters.sortBy] > b[filters.sortBy] ? order : -order;
      });
  }, [tasks, filters]);

  return (
    <div className="task-list-container">
      <TaskFilters filters={filters} onChange={setFilters} />

      {isLoading && <div className="loading">Loading tasks...</div>}

      {error && <div className="error">Failed to load tasks</div>}

      <AnimatePresence mode="popLayout">
        {filteredTasks?.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onComplete={completeTask}
          />
        ))}
      </AnimatePresence>

      {filteredTasks?.length === 0 && (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
}
```

**Styling:**
```css
.task-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state h3 {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}
```

---

### 2.2 TaskCard.tsx (Animated)

**File:** `components/tasks/TaskCard.tsx`

**Key Features:**
- Framer Motion animations (fade, scale, slide)
- Priority color coding
- Hover effects
- Status transitions

```tsx
import { motion } from 'framer-motion';
import { Check, Trash2, Edit, Calendar, Tag } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { DueDateIndicator } from './DueDateIndicator';
import { TagList } from './TagList';

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, index, onUpdate, onDelete, onComplete }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className={`task-card ${task.completed ? 'completed' : ''}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0, 212, 255, 0.2)' }}
    >
      <div className="task-header">
        <button
          className={`checkbox ${task.completed ? 'checked' : ''}`}
          onClick={() => onComplete(task.id)}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check size={16} />}
        </button>

        <div className="task-content">
          <h3 className={`task-title ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </h3>

          <div className="task-meta">
            <PriorityBadge priority={task.priority} />
            {task.due_date && <DueDateIndicator dueDate={task.due_date} />}
            {task.tags?.length > 0 && <TagList tags={task.tags} />}
          </div>
        </div>

        <div className="task-actions">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle details"
          >
            <Calendar size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onUpdate(task)}
            aria-label="Edit task"
          >
            <Edit size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, color: '#ff0055' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && task.description && (
          <motion.div
            className="task-description"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p>{task.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Styling:**
```css
.task-card {
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
}

.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}

.task-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
}

.checkbox:hover {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
}

.checkbox.checked {
  background: #00ff88;
  border-color: #00ff88;
  color: #0a0a0a;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.task-actions button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.task-actions button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.task-description {
  overflow: hidden;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.task-description p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
}
```

---

## 3. Task Indicators

### 3.1 PriorityBadge.tsx

**File:** `components/tasks/PriorityBadge.tsx`

```tsx
import { AlertTriangle, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    high: {
      label: 'HIGH',
      icon: AlertTriangle,
      color: '#ff0055',
      bg: 'rgba(255, 0, 85, 0.15)',
      border: 'rgba(255, 0, 85, 0.4)',
    },
    medium: {
      label: 'MEDIUM',
      icon: ArrowDown,
      color: '#ffcc00',
      bg: 'rgba(255, 204, 0, 0.15)',
      border: 'rgba(255, 204, 0, 0.4)',
    },
    low: {
      label: 'LOW',
      icon: ArrowDown,
      color: '#00ff88',
      bg: 'rgba(0, 255, 136, 0.15)',
      border: 'rgba(0, 255, 136, 0.4)',
    },
  };

  const { label, icon: Icon, color, bg, border } = config[priority];

  return (
    <span
      className="priority-badge"
      style={{
        color,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
```

---

### 3.2 DueDateIndicator.tsx

**File:** `components/tasks/DueDateIndicator.tsx`

```tsx
import { Calendar, Clock } from 'lucide-react';

interface DueDateIndicatorProps {
  dueDate: string;
}

export function DueDateIndicator({ dueDate }: DueDateIndicatorProps) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  let status: 'overdue' | 'urgent' | 'soon' | 'normal';
  let label: string;
  let icon: Calendar | Clock;

  if (diffMs < 0) {
    status = 'overdue';
    label = `Overdue by ${Math.abs(Math.floor(diffDays))}d`;
    icon = Clock;
  } else if (diffHours < 24) {
    status = 'urgent';
    label = `Due in ${Math.floor(diffHours)}h`;
    icon = Clock;
  } else if (diffDays < 3) {
    status = 'soon';
    label = `Due in ${Math.ceil(diffDays)}d`;
    icon = Calendar;
  } else {
    status = 'normal';
    label = due.toLocaleDateString();
    icon = Calendar;
  }

  const colors = {
    overdue: 'rgba(255, 0, 85, 0.2)',
    urgent: 'rgba(255, 153, 0, 0.2)',
    soon: 'rgba(255, 204, 0, 0.2)',
    normal: 'rgba(255, 255, 255, 0.1)',
  };

  return (
    <span
      className="due-date-indicator"
      style={{ background: colors[status] }}
    >
      {React.createElement(icon, { size: 12 })}
      {label}
    </span>
  );
}
```

---

## 4. Task Filters

### 4.1 TaskFilters.tsx

**File:** `components/tasks/TaskFilters.tsx`

```tsx
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface TaskFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="task-filters">
      {/* Search */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
      >
        <option value="all">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
      >
        <option value="created_at">Sort: Created</option>
        <option value="due_date">Sort: Due Date</option>
        <option value="priority">Sort: Priority</option>
        <option value="title">Sort: Title</option>
      </select>

      {/* Sort Order Toggle */}
      <button
        onClick={() => onChange({
          ...filters,
          sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
        })}
        aria-label="Toggle sort order"
      >
        <ArrowUpDown size={18} />
      </button>
    </div>
  );
}
```

**Styling:**
```css
.task-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.task-filters select {
  padding: 10px 32px 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 20px;
}

.task-filters button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.task-filters button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}
```

---

## 5. Browser Notifications

### 5.1 useNotifications Hook

**File:** `hooks/useNotifications.ts`

```typescript
import { useEffect, useCallback } from 'react';

export function useNotifications(tasks: Task[]) {
  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const scheduleNotifications = useCallback(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Clear existing timeouts
    Object.values(window.notificationTimeouts || {}).forEach(clearTimeout);

    // Schedule new notifications
    tasks.forEach(task => {
      if (!task.due_date || task.completed) return;

      const dueDate = new Date(task.due_date);
      const now = new Date();
      const timeUntilDue = dueDate.getTime() - now.getTime();

      // Notify 15 minutes before due
      const warningTime = timeUntilDue - 15 * 60 * 1000;

      if (warningTime > 0) {
        const timeoutId = setTimeout(() => {
          new Notification('Task Due Soon! ⏰', {
            body: `${task.title} is due in 15 minutes`,
            icon: '/icon.png',
            tag: task.id,
            requireInteraction: false,
          });
        }, warningTime);

        window.notificationTimeouts = {
          ...(window.notificationTimeouts || {}),
          [task.id]: timeoutId,
        };
      }
    });
  }, [tasks]);

  useEffect(() => {
    scheduleNotifications();

    return () => {
      // Cleanup timeouts on unmount
      Object.values(window.notificationTimeouts || {}).forEach(clearTimeout);
    };
  }, [tasks, scheduleNotifications]);
}
```

---

## 6. Confetti Animation

### 6.1 ConfettiAnimation.tsx

**File:** `components/tasks/ConfettiAnimation.tsx`

```tsx
import { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiAnimation({ trigger, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Cyberpunk colors
    const colors = ['#00d4ff', '#ff00ff', '#00ff88', '#ffcc00', '#ff0055'];

    // Create particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 150; i++) {
      const angle = (Math.PI * 2 * i) / 150;
      const speed = 5 + Math.random() * 10;

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    // Animation loop
    let animationId: number;
    let frame = 0;
    const maxFrames = 180; // 3 seconds at 60fps

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.rotation += particle.rotationSpeed;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 1 - (frame / maxFrames);
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
      });

      frame++;

      if (frame < maxFrames) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [trigger, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
```

---

## 7. Export Functionality

### 7.1 ExportButton.tsx

**File:** `components/tasks/ExportButton.tsx`

```tsx
import { Download } from 'lucide-react';

export function ExportButton({ tasks }: { tasks: Task[] }) {
  const exportCSV = () => {
    const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Tags'];
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.priority,
      task.status,
      task.due_date || '',
      (task.tags || []).join('; ')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-dropdown">
      <button className="export-button">
        <Download size={16} />
        Export
      </button>

      <div className="export-menu">
        <button onClick={exportCSV}>Export as CSV</button>
        <button onClick={exportJSON}>Export as JSON</button>
      </div>
    </div>
  );
}
```

---

## 8. Implementation Checklist

### 8.1 Core Components

- [ ] TaskList with real-time SWR updates
- [ ] TaskCard with Framer Motion animations
- [ ] PriorityBadge with color coding
- [ ] DueDateIndicator with warnings
- [ ] TagList display
- [ ] TaskFilters (search, status, priority, sort)

### 8.2 Animations

- [ ] Fade-in animation for new tasks
- [ ] Slide-out animation for deleted tasks
- [ ] Scale animation on hover
- [ ] Confetti animation on complete

### 8.3 Notifications

- [ ] Browser notification permission request
- [ ] Schedule notifications 15 minutes before due
- [ ] Notification click to open task
- [ ] Cleanup timeouts

### 8.4 Export

- [ ] CSV export functionality
- [ ] JSON export functionality
- [ ] Proper date formatting
- [ ] Tag serialization

---

## 9. Cross-References

**Related Specifications:**
- @specs/ui/components.md – Base UI components
- @specs/features/chatbot-integration.md – Feature integration
- @specs/ui/chatbot-widget.md – Chatbot UI

**Skills to Use:**
- `nextjs-shadcn-ui-engineer` – UI implementation
- `shadcn-ui-cyberpunk-theme-generator` – Cyberpunk styling

---

**End of specs/ui/task-management.md**

**Version:** 1.0 (New) | **Last Updated:** 2026-02-11 | **Status:** Refined
