# specs/ui/components.md

## Frontend Component Library Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @specs/ui/theme.md, @specs/features/authentication-frontend.md

---

## Overview

Define all reusable UI components for the Hackathon II Phase II Todo web application. Components are built with Shadcn/UI primitives, styled with the cyberpunk/neon theme, and follow React Server Components by default.

**Component Philosophy:**
- Server Components by default (no "use client" unless needed)
- Client Components only for interactivity (forms, modals, dialogs)
- Composable: small components that combine into larger ones
- Accessible: ARIA labels, keyboard navigation, focus management
- Responsive: mobile-first, works on all screen sizes

**Base Library:**
- Shadcn/UI (Radix UI primitives + Tailwind)
- Referenced: https://ui.shadcn.com

---

## 1. Component Hierarchy

```
frontend/
├── components/
│   ├── ui/                    # Shadcn/UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── command.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── task/                  # Task-specific components
│   │   ├── task-card.tsx
│   │   ├── task-list.tsx
│   │   ├── task-table.tsx
│   │   ├── task-form.tsx
│   │   ├── add-task-dialog.tsx
│   │   └── edit-task-dialog.tsx
│   ├── layout/                # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── auth/                  # Auth components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── user-menu.tsx
│   └── command/               # Command palette
│       └── command-palette.tsx
```

---

## 2. Base UI Components (Shadcn/UI)

### 2.1 Button

**File:** `components/ui/button.tsx`

**Variants:**
- `default` – Primary action (neon blue glow)
- `destructive` – Delete/danger (red)
- `outline` – Secondary action (border only)
- `secondary` – Alternative primary (neon pink glow)
- `ghost` – Subtle action (hover only)
- `link` – Text link with underline

**Sizes:**
- `default` – h-10, px-4
- `sm` – h-9, px-3
- `lg` – h-11, px-8
- `icon` – Square, h-10, w-10

**Styling:**
- Neon glow effect on hover (scale + shadow)
- Smooth transitions (200ms)
- Focus ring with neon cyan

**Example Usage:**
```tsx
<Button variant="default">Add Task</Button>
<Button variant="secondary" size="sm">Edit</Button>
<Button variant="destructive" size="icon"><TrashIcon /></Button>
```

**Acceptance Criteria:**
- [ ] All variants render correctly
- [ ] Hover effects work (scale + glow)
- [ ] Focus indicator visible
- [ ] Disabled state shows opacity 0.5
- [ ] Loading state (optional): spinner inside

---

### 2.2 Card

**File:** `components/ui/card.tsx`

**Sub-components:**
- `Card` – Container with glassmorphism
- `CardHeader` – Title section
- `CardTitle` – Title text
- `CardDescription` – Subtitle text
- `CardContent` – Main content area
- `CardFooter` – Action buttons area

**Styling:**
- Glassmorphism background (rgba + backdrop-blur)
- Border with white/10 opacity
- Rounded corners (12px)
- Subtle shadow

**Example Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Task Title</CardTitle>
    <CardDescription>Task description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Task content here</p>
  </CardContent>
  <CardFooter>
    <Button>Complete</Button>
  </CardFooter>
</Card>
```

---

### 2.3 Input & Label

**File:** `components/ui/input.tsx`, `components/ui/label.tsx`

**Styling:**
- Dark background (same as card)
- Border with focus ring (neon cyan)
- Rounded corners (6px)
- Placeholder text in muted color
- Focus: border color + glow

**Example Usage:**
```tsx
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="user@example.com" />
</div>
```

**Acceptance Criteria:**
- [ ] Label associates with input (htmlFor)
- [ ] Focus ring visible on keyboard focus
- [ ] Error state (optional): red border + error message
- [ ] Disabled state: opacity 0.5, no interaction

---

### 2.4 Checkbox

**File:** `components/ui/checkbox.tsx`

**Styling:**
- Unchecked: empty square with border
- Checked: filled with neon green + checkmark icon
- Focus: neon cyan ring
- Hover: slight scale (1.05)

**Example Usage:**
```tsx
<Checkbox id="completed" checked={completed} onCheckedChange={setCompleted} />
<Label htmlFor="completed">Mark as complete</Label>
```

---

### 2.5 Badge

**File:** `components/ui/badge.tsx`

**Variants:**
- `default` – Gray
- `primary` – Neon blue
- `secondary` – Neon pink
- `success` – Neon green (completed)
- `warning` – Neon yellow (in progress)
- `destructive` – Red (high priority)

**Use Cases:**
- Task priority badges (Low/Medium/High)
- Status badges (Todo/In Progress/Completed)
- Count badges (e.g., "3 tasks")

**Example Usage:**
```tsx
<Badge variant="secondary">High Priority</Badge>
<Badge variant="success">Completed</Badge>
```

---

### 2.6 Dialog

**File:** `components/ui/dialog.tsx`

**Sub-components:**
- `Dialog` – Root component
- `DialogTrigger` – Button to open
- `DialogContent` – Modal content
- `DialogHeader` – Title section
- `DialogTitle` – Title text
- `DialogDescription` – Description text
- `DialogFooter` – Action buttons

**Styling:**
- Glassmorphism background
- Backdrop blur on overlay
- Centered on screen
- Close on escape key
- Close on click outside

**Example Usage:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Task</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Task</DialogTitle>
      <DialogDescription>Create a new task</DialogDescription>
    </DialogHeader>
    <TaskForm />
  </DialogContent>
</Dialog>
```

**Acceptance Criteria:**
- [ ] Dialog opens on trigger click
- [ ] Dialog closes on X button click
- [ ] Dialog closes on Escape key
- [ ] Dialog closes on backdrop click
- [ ] Focus trap inside dialog
- [ ] Focus returns to trigger after close

---

### 2.7 Table

**File:** `components/ui/table.tsx`

**Sub-components:**
- `Table` – Root
- `TableHeader` – Header row
- `TableBody` – Data rows
- `TableFooter` – Footer (optional)
- `TableRow` – Row
- `TableHead` – Header cell
- `TableCell` – Data cell

**Styling:**
- Header: bold text, bottom border
- Rows: hover effect (slight background change)
- Border bottom on each row
- Responsive: horizontal scroll on mobile

**Example Usage:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Status</TableHead>
      <TableHead>Title</TableHead>
      <TableHead>Priority</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {tasks.map(task => (
      <TableRow key={task.id}>
        <TableCell><Checkbox checked={task.completed} /></TableCell>
        <TableCell>{task.title}</TableCell>
        <TableCell><Badge>{task.priority}</Badge></TableCell>
        <TableCell>
          <Button size="icon" variant="ghost"><EditIcon /></Button>
          <Button size="icon" variant="destructive"><TrashIcon /></Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 2.8 Command Palette

**File:** `components/ui/command.tsx`

**Purpose:** Quick search and actions (Cmd+K / Ctrl+K)

**Features:**
- Search input (filter tasks by title)
- Quick actions (add task, mark all complete, clear completed)
- Keyboard navigation (arrow keys, enter)
- Highlight matching text

**Example Usage:**
```tsx
<Command>
  <CommandInput placeholder="Search tasks..." />
  <CommandList>
    <CommandEmpty>No tasks found.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem onSelect={handleAddTask}>
        <PlusIcon /> Add Task
      </CommandItem>
      <CommandItem onSelect={handleMarkAllComplete}>
        <CheckIcon /> Mark All Complete
      </CommandItem>
    </CommandGroup>
    <CommandGroup heading="Tasks">
      {tasks.map(task => (
        <CommandItem key={task.id} onSelect={() => navigateToTask(task.id)}>
          <Checkbox checked={task.completed} />
          {task.title}
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</Command>
```

---

### 2.9 Toast (Notifications)

**File:** `components/ui/toast.tsx`

**Purpose:** Show success/error messages

**Variants:**
- `default` – Info
- `success` – Green (task created, updated)
- `destructive` – Red (error, task deleted)

**Usage:**
```tsx
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

toast({
  title: "Task created",
  description: "Your task has been added successfully.",
  variant: "success",
});
```

---

## 3. Task-Specific Components

### 3.1 TaskCard

**File:** `components/task/task-card.tsx`

**Type:** Client Component ("use client")

**Purpose:** Display single task in card format (mobile-friendly)

**Props:**
```typescript
interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ ☐  Task Title            [HIGH]     │
│     Task description text...         │
│     Created: Feb 8, 2025             │
│     [Edit] [Delete]                  │
└─────────────────────────────────────┘
```

**Styling:**
- Glassmorphism card
- Priority badge (color-coded)
- Checkbox on left (toggle complete)
- Edit/Delete buttons on right
- Strikethrough title when completed
- Hover effect: slight lift + glow

**Behavior:**
- Click checkbox → toggle complete status
- Click Edit → open EditTaskDialog
- Click Delete → show confirmation dialog
- Click card (not on buttons) → navigate to task detail (optional)

**Acceptance Criteria:**
- [ ] Displays task title, description, priority
- [ ] Checkbox toggles completed status
- [ ] Completed tasks show strikethrough + dimmed opacity
- [ ] Priority badge shows correct color (low=blue, medium=yellow, high=pink)
- [ ] Edit button opens edit dialog
- [ ] Delete button shows confirmation
- [ ] Responsive: full width on mobile, max-width on desktop

---

### 3.2 TaskList

**File:** `components/task/task-list.tsx`

**Type:** Server Component (default)

**Purpose:** Display list of tasks as cards (mobile/tablet view)

**Props:**
```typescript
interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}
```

**UI Layout:**
```
Task List
┌─────────────────────────────────────┐
│ Task Card 1                          │
├─────────────────────────────────────┤
│ Task Card 2                          │
├─────────────────────────────────────┤
│ Task Card 3                          │
└─────────────────────────────────────┘
```

**Behavior:**
- Map through tasks array
- Render TaskCard for each task
- Show empty message if no tasks
- Sort by: created date desc (default), priority, or completed status

**Acceptance Criteria:**
- [ ] Renders TaskCard for each task
- [ ] Shows empty message when no tasks
- [ ] Supports filtering (by status, priority)
- [ ] Supports sorting (by date, priority)
- [ ] Responsive: 1 column mobile, 2 columns tablet, 3 columns desktop

---

### 3.3 TaskTable

**File:** `components/task/task-table.tsx`

**Type:** Client Component ("use client")

**Purpose:** Display tasks in table format (desktop view)

**Props:**
```typescript
interface TaskTableProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}
```

**Columns:**
1. **Status** – Checkbox for completed toggle
2. **Title** – Task title (truncated with ellipsis if too long)
3. **Priority** – Badge (Low/Medium/High)
4. **Created** – Date formatted (e.g., "Feb 8, 2025")
5. **Actions** – Edit/Delete buttons

**UI Layout:**
```
┌──────┬────────────────────┬──────────┬─────────────┬──────────┐
│ Done │ Title              │ Priority │ Created     │ Actions  │
├──────┼────────────────────┼──────────┼─────────────┼──────────┤
│ ☐    │ Build auth system  │ HIGH     │ Feb 8, 2025 │ ✏️ 🗑️   │
│ ☑    │ Test API endpoints │ MEDIUM   │ Feb 7, 2025 │ ✏️ 🗑️   │
└──────┴────────────────────┴──────────┴─────────────┴──────────┘
```

**Styling:**
- Zebra striping (alternating row backgrounds)
- Hover effect on rows
- Completed rows: strikethrough + dimmed
- Responsive: horizontal scroll on mobile

**Behavior:**
- Checkbox click → toggle complete
- Edit click → open EditTaskDialog
- Delete click → show confirmation
- Sortable columns (click header to sort)

**Acceptance Criteria:**
- [ ] Shows all tasks in table rows
- [ ] Checkbox toggles completed status
- [ ] Priority badges show correct colors
- [ ] Edit/Delete buttons work
- [ ] Sortable by clicking column headers
- [ ] Responsive: horizontal scroll on mobile

---

### 3.4 TaskForm

**File:** `components/task/task-form.tsx`

**Type:** Client Component ("use client")

**Purpose:** Form for creating/editing tasks

**Props:**
```typescript
interface TaskFormProps {
  task?: Task; // If provided, edit mode; otherwise create mode
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface TaskFormData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}
```

**Fields:**
1. **Title** (required)
   - Type: text input
   - Validation: min 1 char, max 200 chars
   - Placeholder: "Enter task title..."
   - Required: *

2. **Description** (optional)
   - Type: textarea
   - Validation: max 1000 chars
   - Placeholder: "Enter task description (optional)..."
   - Rows: 3-4

3. **Priority** (required)
   - Type: select (dropdown)
   - Options: Low (blue), Medium (yellow), High (pink)
   - Default: medium

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Add/Edit Task                        │
├─────────────────────────────────────┤
│ Title *                              │
│ [_____________________________]      │
│                                      │
│ Description                          │
│ [_____________________________]      │
│ [_____________________________]      │
│                                      │
│ Priority *                           │
│ [Medium ▼]                           │
│                                      │
│          [Cancel] [Save Task]        │
└─────────────────────────────────────┘
```

**Validation:**
- Title: required, min 1 char, max 200 chars
- Description: max 1000 chars
- Priority: required, must be 'low' | 'medium' | 'high'

**Behavior:**
- On submit: call `onSubmit` with form data
- On cancel: call `onCancel` (if provided)
- Show loading state on submit button (spinner + disabled)
- Show validation errors below fields
- Reset form after successful create
- Pre-fill form with task data in edit mode

**Acceptance Criteria:**
- [ ] Title field shows validation error if empty
- [ ] Description field allows up to 1000 chars
- [ ] Priority dropdown shows all three options
- [ ] Submit button is disabled while loading
- [ ] Form resets after successful create
- [ ] Form pre-fills with task data in edit mode
- [ ] Cancel button closes dialog

---

### 3.5 AddTaskDialog

**File:** `components/task/add-task-dialog.tsx`

**Type:** Client Component ("use client")

**Purpose:** Dialog for creating new tasks

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Add New Task                  [X]    │
├─────────────────────────────────────┤
│ [TaskForm component]                │
├─────────────────────────────────────┤
│                    [Cancel] [Add]   │
└─────────────────────────────────────┘
```

**Behavior:**
- Triggered by "Add Task" button in navbar/dashboard
- Shows TaskForm in Dialog
- On submit: call API to create task
- On success: close dialog, show toast, refresh task list
- On error: show error toast, keep dialog open

**Acceptance Criteria:**
- [ ] Dialog opens on "Add Task" button click
- [ ] Dialog closes on X button click
- [ ] Dialog closes on Escape key
- [ ] Dialog closes on successful task creation
- [ ] Shows success toast on success
- [ ] Shows error toast on failure

---

### 3.6 EditTaskDialog

**File:** `components/task/edit-task-dialog.tsx`

**Type:** Client Component ("use client")

**Purpose:** Dialog for editing existing tasks

**Props:**
```typescript
interface EditTaskDialogProps {
  task: Task;
  onUpdate: (id: string, data: TaskFormData) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Behavior:**
- Triggered by "Edit" button on TaskCard/TaskTable
- Pre-fills TaskForm with task data
- On submit: call API to update task
- On success: close dialog, show toast, refresh task list
- On error: show error toast, keep dialog open

**Acceptance Criteria:**
- [ ] Dialog opens with task data pre-filled
- [ ] All fields are editable
- [ ] Submit updates the task
- [ ] Success shows toast and closes dialog
- [ ] Error shows toast and keeps dialog open

---

## 4. Layout Components

### 4.1 Navbar

**File:** `components/layout/navbar.tsx`

**Type:** Client Component ("use client")

**Purpose:** Top navigation bar

**UI Layout (Desktop):**
```
┌────────────────────────────────────────────────────────┐
│ 🚀 Hackathon Todo    [Search...]    [Cmd+K] [@] [☀️]   │
└────────────────────────────────────────────────────────┘
```

**UI Layout (Mobile):**
```
┌────────────────────────┐
│ 🚀 Todo      [☰] [@]   │
└────────────────────────┘
```

**Elements:**
1. **Logo** – "🚀 Hackathon Todo" (left)
2. **Search** – Search input (desktop only, expands command palette)
3. **Command Palette Trigger** – "Cmd+K" button (desktop only)
4. **User Menu** – Avatar dropdown (right)
5. **Theme Switcher** – Sun/Moon icon button (right)
6. **Hamburger Menu** – Mobile sidebar trigger (mobile only)

**Behavior:**
- Logo click → navigate to dashboard
- Search focus → open command palette
- User menu click → show dropdown (Logout, Settings)
- Theme switcher click → toggle dark/light mode
- Hamburger click → open sidebar (mobile)

**Styling:**
- Fixed position top (sticky)
- Glassmorphism background
- Border bottom
- Height: 64px
- Responsive: hide search/command on mobile

**Acceptance Criteria:**
- [ ] Navbar stays fixed at top when scrolling
- [ ] Logo navigates to dashboard
- [ ] Search opens command palette
- [ ] User menu shows logout option
- [ ] Theme switcher toggles dark/light
- [ ] Hamburger menu opens sidebar on mobile
- [ ] Responsive: elements hide/show based on screen size

---

### 4.2 Sidebar

**File:** `components/layout/sidebar.tsx`

**Type:** Client Component ("use client")

**Purpose:** Side navigation (desktop) / drawer (mobile)

**UI Layout (Desktop):**
```
┌─────────────┐
│ Dashboard   │
│ Tasks       │
│ Calendar    │
│ Settings    │
└─────────────┘
```

**Navigation Items:**
1. Dashboard – `/dashboard` (home icon)
2. Tasks – `/tasks` (list icon)
3. Calendar – `/calendar` (calendar icon, bonus)
4. Settings – `/settings` (gear icon, optional)

**Behavior:**
- Click item → navigate to route
- Active item: highlighted background + neon glow
- Desktop: always visible on left
- Mobile: drawer that slides in from left

**Styling:**
- Width: 240px (desktop)
- Full height (below navbar)
- Glassmorphism background
- Border right

**Acceptance Criteria:**
- [ ] Navigation items route to correct pages
- [ ] Active page is highlighted
- [ ] Sidebar is always visible on desktop
- [ ] Sidebar is drawer on mobile (slide-in)
- [ ] Sidebar closes on mobile after navigation

---

### 4.3 User Menu

**File:** `components/auth/user-menu.tsx`

**Type:** Client Component ("use client")

**Purpose:** Dropdown menu for user actions

**UI Layout:**
```
┌─────────────────────┐
│ user@example.com    │
│ ─────────────────── │
│ 👤 Profile          │
│ ⚙️ Settings         │
│ 🚪 Logout           │
└─────────────────────┘
```

**Menu Items:**
1. **Profile** – Navigate to profile page (optional)
2. **Settings** – Navigate to settings page (optional)
3. **Logout** – Sign out from Better Auth

**Behavior:**
- Triggered by clicking user avatar in navbar
- Shows user email at top
- Logout: call Better Auth `signOut()` function
- Close menu after selection

**Acceptance Criteria:**
- [ ] Menu opens on avatar click
- [ ] Menu closes on click outside
- [ ] Logout signs out user
- [ ] After logout, redirect to login page

---

## 5. Auth Components

### 5.1 LoginForm

**File:** `components/auth/login-form.tsx`

**Type:** Client Component ("use client")

**Purpose:** Sign in form

**Fields:**
1. **Email** – Email input
2. **Password** – Password input (type="password")
3. **Remember me** – Checkbox (optional)
4. **Forgot password** – Link (optional, not implemented in Phase II)

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Welcome Back                        │
├─────────────────────────────────────┤
│ Email                               │
│ [user@example.com]                  │
│                                      │
│ Password                            │
│ [••••••••]                          │
│                                      │
│ ☐ Remember me    Forgot password?   │
│                                      │
│            [Sign In]                │
│                                      │
│ Don't have an account? Sign up      │
└─────────────────────────────────────┘
```

**Behavior:**
- On submit: call Better Auth `signIn.email()` function
- On success: redirect to dashboard
- On error: show error toast
- Link to signup page at bottom

**Acceptance Criteria:**
- [ ] Email field validates email format
- [ ] Password field is required
- [ ] Submit button is disabled while loading
- [ ] Success redirects to `/dashboard`
- [ ] Error shows toast message
- [ ] "Sign up" link navigates to `/signup`

---

### 5.2 SignupForm

**File:** `components/auth/signup-form.tsx`

**Type:** Client Component ("use client")

**Purpose:** Sign up form

**Fields:**
1. **Name** – Full name input (optional)
2. **Email** – Email input
3. **Password** – Password input
4. **Confirm Password** – Password input (must match)

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Create Account                      │
├─────────────────────────────────────┤
│ Name                                │
│ [John Doe]                          │
│                                      │
│ Email                               │
│ [user@example.com]                  │
│                                      │
│ Password                            │
│ [••••••••]                          │
│                                      │
│ Confirm Password                    │
│ [••••••••]                          │
│                                      │
│            [Sign Up]                │
│                                      │
│ Already have an account? Sign in    │
└─────────────────────────────────────┘
```

**Behavior:**
- On submit: call Better Auth `signUp.email()` function
- On success: redirect to dashboard
- On error: show error toast
- Passwords must match (validation)
- Link to signin page at bottom

**Acceptance Criteria:**
- [ ] Email field validates email format
- [ ] Password field is required (min 8 chars)
- [ ] Confirm password must match password
- [ ] Submit button is disabled while loading
- [ ] Success redirects to `/dashboard`
- [ ] Error shows toast message
- [ ] "Sign in" link navigates to `/login`

---

## 6. Command Palette Component

### 6.1 CommandPalette

**File:** `components/command/command-palette.tsx`

**Type:** Client Component ("use client")

**Purpose:** Quick search and actions (Cmd+K / Ctrl+K)

**UI Layout:**
```
┌─────────────────────────────────────┐
│ 🔍 Search tasks...                  │
├─────────────────────────────────────┤
│ Actions                             │
│   ➕ Add Task                        │
│   ✅ Mark All Complete               │
│   🗑️ Clear Completed                 │
├─────────────────────────────────────┤
│ Tasks                               │
│   ☐ Build auth system               │
│   ☐ Test API endpoints              │
│   ☑ Design database schema          │
└─────────────────────────────────────┘
```

**Features:**
1. **Search** – Filter tasks by title
2. **Actions** – Quick actions (add, mark all, clear completed)
3. **Keyboard Navigation** – Arrow keys + Enter
4. **Highlight** – Bold matching text

**Behavior:**
- Triggered by Cmd+K / Ctrl+K
- Focuses search input on open
- Filters tasks as you type
- Enter on action → execute action
- Enter on task → navigate to task detail (optional)
- Escape → close

**Acceptance Criteria:**
- [ ] Opens on Cmd+K / Ctrl+K
- [ ] Closes on Escape
- [ ] Search filters tasks by title
- [ ] Actions execute on Enter
- [ ] Arrow keys navigate items
- [ ] Shows "No results" if no match

---

## 7. Responsive Design

### 7.1 Breakpoints

```javascript
// tailwind.config.js
screens: {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### 7.2 Component Responsive Behavior

**TaskCard:**
- Mobile (<768px): Full width
- Tablet (768-1024px): 2 columns
- Desktop (>1024px): Hidden (use TaskTable instead)

**TaskTable:**
- Mobile (<768px): Hidden (use TaskList instead)
- Tablet (768-1024px): Visible, horizontal scroll
- Desktop (>1024px): Visible, full width

**Navbar:**
- Mobile (<768px): Logo + hamburger + avatar + theme
- Tablet (768-1024px): Logo + search + avatar + theme
- Desktop (>1024px): Full layout (logo + search + command + avatar + theme)

**Sidebar:**
- Mobile (<768px): Drawer (slide-in, overlay)
- Tablet/Desktop (>=768px): Always visible, fixed left

---

## 8. Icon Library

**Library:** Lucide React (Shadcn/UI default)

**Installation:**
```bash
npm install lucide-react
```

**Common Icons:**
- `Check` – Completed status
- `Plus` – Add task
- `Edit` / `Pencil` – Edit task
- `Trash` / `Trash2` – Delete task
- `Search` – Search
- `Command` – Cmd+K
- `Sun` / `Moon` – Theme switcher
- `User` – User avatar
- `LogOut` – Logout
- `Menu` – Hamburger
- `Calendar` – Calendar view
- `Settings` – Settings

**Usage:**
```tsx
import { Check, Plus, Edit, Trash } from 'lucide-react';

<Check className="h-4 w-4" />
<Plus className="h-5 w-5" />
```

---

## 9. Implementation Checklist

### 9.1 Base UI Components (Shadcn/UI)

- [ ] Install and initialize Shadcn/UI
- [ ] Add Button component
- [ ] Add Card component
- [ ] Add Input component
- [ ] Add Label component
- [ ] Add Checkbox component
- [ ] Add Badge component
- [ ] Add Dialog component
- [ ] Add Table component
- [ ] Add Command component
- [ ] Add Toast component
- [ ] Add Dropdown Menu component
- [ ] Style all components with cyberpunk theme

### 9.2 Task Components

- [ ] Build TaskCard component
- [ ] Build TaskList component
- [ ] Build TaskTable component
- [ ] Build TaskForm component
- [ ] Build AddTaskDialog component
- [ ] Build EditTaskDialog component

### 9.3 Layout Components

- [ ] Build Navbar component
- [ ] Build Sidebar component
- [ ] Build UserMenu component

### 9.4 Auth Components

- [ ] Build LoginForm component
- [ ] Build SignupForm component

### 9.5 Command Palette

- [ ] Build CommandPalette component
- [ ] Add keyboard shortcut (Cmd+K / Ctrl+K)
- [ ] Integrate with task list

### 9.6 Testing

- [ ] Test all components in isolation
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Test accessibility (keyboard navigation, screen reader)
- [ ] Test dark/light theme switching

---

## 10. Cross-References

**Related Specifications:**
- @specs/ui/theme.md – Theme styling for all components
- @specs/ui/pages.md – Page layouts that use these components
- @specs/features/authentication-frontend.md – Auth flow integration

**Implementation Order:**
1. Install Shadcn/UI and add base components
2. Style base components with cyberpunk theme
3. Build layout components (Navbar, Sidebar)
4. Build auth components (LoginForm, SignupForm)
5. Build task components (TaskForm, TaskCard, TaskList, TaskTable)
6. Build CommandPalette
7. Test responsiveness and accessibility

---

**End of specs/ui/components.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
