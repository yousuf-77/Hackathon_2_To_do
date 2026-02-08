# specs/ui/pages.md

## Frontend Pages & Routing Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @specs/ui/components.md, @specs/features/authentication-frontend.md, @specs/ui/theme.md

---

## Overview

Define all pages, layouts, and routing for the Hackathon II Phase II Todo web application using Next.js 16+ App Router.

**Architecture:**
- Next.js 16+ App Router (not Pages Router)
- File-based routing in `app/` directory
- Server Components by default
- Client Components for interactivity
- Route protection via middleware and layout checks

**Route Structure:**
```
/                    → Redirect to /login or /dashboard
/login               → Sign in page
/signup              → Sign up page
/dashboard           → Main task dashboard (default after login)
/tasks/[id]          → Single task detail (optional)
```

---

## 1. File Structure

```
frontend/app/
├── layout.tsx              # Root layout (ThemeProvider, global styles)
├── page.tsx                # Root page (redirect to login/dashboard)
├── globals.css             # Global styles (theme CSS variables)
├── login/
│   └── page.tsx            # Login page
├── signup/
│   └── page.tsx            # Signup page
├── dashboard/
│   ├── layout.tsx          # Protected layout (requires auth)
│   └── page.tsx            # Dashboard page (task list)
├── tasks/
│   └── [id]/
│       └── page.tsx        # Task detail page (optional)
└── api/
    └── auth/
        └── [...auth]/
            └── route.ts    # Better Auth API route
```

---

## 2. Root Layout

**File:** `app/layout.tsx`

**Type:** Server Component (default)

**Purpose:** Root layout with ThemeProvider and global styles

**Code Structure:**
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hackathon Todo - Phase II',
  description: 'Multi-user full-stack todo application with cyberpunk theme',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Responsibilities:**
- Load global CSS (`globals.css`)
- Set metadata (title, description)
- Provide ThemeProvider (next-themes)
- Provide Toaster (notifications)
- Set default font (Inter)

**Acceptance Criteria:**
- [ ] ThemeProvider wraps all children
- [ ] Dark mode is default theme
- [ ] Toaster is available globally
- [ ] Font is applied to all pages
- [ ] HTML lang attribute is set to "en"

---

## 3. Root Page

**File:** `app/page.tsx`

**Type:** Server Component (default)

**Purpose:** Redirect based on authentication status

**Code Structure:**
```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth'; // Better Auth instance

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
```

**Behavior:**
- Check if user is authenticated
- If authenticated → redirect to `/dashboard`
- If not authenticated → redirect to `/login`

**Acceptance Criteria:**
- [ ] Authenticated users redirect to /dashboard
- [ ] Unauthenticated users redirect to /login
- [ ] Redirect happens server-side (no flash)

---

## 4. Login Page

**File:** `app/login/page.tsx`

**Type:** Server Component (default)

**Purpose:** Sign in page with email/password form

**UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         🚀 Hackathon Todo           │
│                                     │
│         Welcome Back                │
│                                     │
│     ┌─────────────────────┐         │
│     │  Email              │         │
│     │  [user@example.com] │         │
│     │                     │         │
│     │  Password           │         │
│     │  [••••••••]         │         │
│     │                     │         │
│     │  ☐ Remember me      │         │
│     │                     │         │
│     │    [Sign In]        │         │
│     └─────────────────────┘         │
│                                     │
│  Don't have an account? Sign up     │
│                                     │
└─────────────────────────────────────┘
```

**Code Structure:**
```tsx
import { LoginForm } from '@/components/auth/login-form';
import { Link } from '@/components/ui/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">🚀 Hackathon Todo</h1>
          <p className="text-muted-foreground">Welcome back! Sign in to your account.</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Signup Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Styling:**
- Centered card on screen
- Glassmorphism background
- Logo with gradient text
- Form with proper spacing
- Responsive: full width on mobile

**Acceptance Criteria:**
- [ ] Page is centered vertically and horizontally
- [ ] LoginForm component renders
- [ ] Signup link navigates to /signup
- [ ] Form validation works on client
- [ ] On success, redirects to /dashboard
- [ ] On error, shows toast notification
- [ ] Responsive on mobile (<768px)

---

## 5. Signup Page

**File:** `app/signup/page.tsx`

**Type:** Server Component (default)

**Purpose:** Sign up page with name, email, password form

**UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         🚀 Hackathon Todo           │
│                                     │
│         Create Account              │
│                                     │
│     ┌─────────────────────┐         │
│     │  Name               │         │
│     │  [John Doe]         │         │
│     │                     │         │
│     │  Email              │         │
│     │  [user@example.com] │         │
│     │                     │         │
│     │  Password           │         │
│     │  [••••••••]         │         │
│     │                     │         │
│     │  Confirm Password   │         │
│     │  [••••••••]         │         │
│     │                     │         │
│     │    [Sign Up]        │         │
│     └─────────────────────┘         │
│                                     │
│  Already have an account? Sign in   │
│                                     │
└─────────────────────────────────────┘
```

**Code Structure:**
```tsx
import { SignupForm } from '@/components/auth/signup-form';
import { Link } from '@/components/ui/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">🚀 Hackathon Todo</h1>
          <p className="text-muted-foreground">Create your account to get started.</p>
        </div>

        {/* Signup Form */}
        <SignupForm />

        {/* Signin Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Styling:**
- Same centered card layout as login
- Glassmorphism background
- Logo with gradient text
- Form with proper spacing

**Acceptance Criteria:**
- [ ] Page is centered vertically and horizontally
- [ ] SignupForm component renders
- [ ] Signin link navigates to /login
- [ ] Form validation works on client (passwords match)
- [ ] On success, redirects to /dashboard
- [ ] On error, shows toast notification
- [ ] Responsive on mobile (<768px)

---

## 6. Dashboard Layout (Protected)

**File:** `app/dashboard/layout.tsx`

**Type:** Server Component (default)

**Purpose:** Protected layout that requires authentication

**Code Structure:**
```tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar user={session.user} />

      {/* Sidebar + Main Content */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Responsibilities:**
- Check authentication (server-side)
- Redirect to `/login` if not authenticated
- Render Navbar (with user info)
- Render Sidebar (navigation)
- Render children (page content)

**Acceptance Criteria:**
- [ ] Unauthenticated users redirect to /login
- [ ] Navbar shows user avatar and logout
- [ ] Sidebar shows navigation links
- [ ] Main content area renders page content
- [ ] Responsive: sidebar becomes drawer on mobile

---

## 7. Dashboard Page

**File:** `app/dashboard/page.tsx`

**Type:** Server Component (default)

**Purpose:** Main dashboard with task list, filters, and add button

**UI Layout (Desktop):**
```
┌────────────────────────────────────────────────────────┐
│ Navbar: Logo | Search | [Cmd+K] [@] [☀️]              │
├──────────┬─────────────────────────────────────────────┤
│ Sidebar  │ Tasks                      [+ Add Task]     │
│          ├─────────────────────────────────────────────┤
│          │ Filter: [All ▼]  Sort: [Date ▼]            │
│          ├─────────────────────────────────────────────┤
│          │ ┌────┬────────────────────┬─────┬────────┐│
│          │ │Done│ Title             │ Pri │ Actions││
│          │ ├────┼────────────────────┼─────┼────────┤│
│          │ │☐  │ Build auth system  │HIGH │ ✏️ 🗑️ ││
│          │ │☑  │ Test API endpoints │MED  │ ✏️ 🗑️ ││
│          │ └────┴────────────────────┴─────┴────────┘│
│          │                                             │
│          │ 5 tasks total • 2 completed • 3 active     │
└──────────┴─────────────────────────────────────────────┘
```

**UI Layout (Mobile):**
```
┌──────────────────────────┐
│ Navbar: Logo [☰] [@] [☀️]│
├──────────────────────────┤
│ Tasks          [+ Add]   │
├──────────────────────────┤
│ Filter: [All ▼]          │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ ☐ Build auth...[HIGH]│ │
│ │ Test API endpoints... │ │
│ │ ☑ Design database... │ │
│ └──────────────────────┘ │
│                          │
│ 5 tasks • 2 completed    │
└──────────────────────────┘
```

**Code Structure:**
```tsx
import { TaskTable } from '@/components/task/task-table';
import { TaskList } from '@/components/task/task-list';
import { AddTaskDialog } from '@/components/task/add-task-dialog';
import { Button } from '@/components/ui/button';

async function getTasks(userId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${userId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${await getToken()}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

export default async function DashboardPage() {
  const session = await auth();
  const tasks = await getTasks(session.user.id);

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-muted-foreground">
            {taskStats.total} tasks total • {taskStats.completed} completed • {taskStats.active} active
          </p>
        </div>
        <AddTaskDialog>
          <Button variant="default" size="lg">
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Task
          </Button>
        </AddTaskDialog>
      </div>

      {/* Filters (Client Component) */}
      <TaskFilters />

      {/* Task List (Desktop: Table, Mobile: Cards) */}
      <div className="hidden md:block">
        <TaskTable tasks={tasks} />
      </div>
      <div className="md:hidden">
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
```

**Features:**
1. **Header** – Page title, task statistics, add button
2. **Filters** – Filter by status (All/Active/Completed), sort by date/priority
3. **Task Display** – Table on desktop, cards on mobile
4. **Statistics** – Total, completed, active task counts

**Client Components (needed for interactivity):**
- `TaskFilters` – Filter and sort dropdowns
- `TaskTable` – Desktop table with edit/delete buttons
- `TaskList` – Mobile card list
- `AddTaskDialog` – Add task modal

**Behavior:**
- Load tasks from API on server (SSR)
- Filters update URL query params (e.g., `/dashboard?status=active&sort=priority`)
- Add task button opens dialog
- Edit/delete buttons on each task

**Acceptance Criteria:**
- [ ] Page loads tasks from API on server
- [ ] Task statistics are calculated correctly
- [ ] Filters update the task list
- [ ] Desktop shows table view
- [ ] Mobile shows card view
- [ ] Add task button opens dialog
- [ ] Edit/delete buttons work
- [ ] Responsive: table → cards on mobile

---

## 8. Task Detail Page (Optional)

**File:** `app/tasks/[id]/page.tsx`

**Type:** Server Component (default)

**Purpose:** Single task detail view

**UI Layout:**
```
┌────────────────────────────────────────────────────────┐
│ ← Back to Tasks                         [Edit] [Delete]│
├────────────────────────────────────────────────────────┤
│ Task Title                                             │
│ HIGH PRIORITY                                          │
├────────────────────────────────────────────────────────┤
│ Description                                            │
│                                                        │
│ This is the task description with full details...      │
│                                                        │
├────────────────────────────────────────────────────────┤
│ Metadata                                               │
│ Created: Feb 8, 2025 at 10:30 AM                      │
│ Updated: Feb 8, 2025 at 11:45 AM                      │
│ Status: In Progress                                   │
├────────────────────────────────────────────────────────┤
│ ☐ Mark as Complete                                     │
└────────────────────────────────────────────────────────┘
```

**Code Structure:**
```tsx
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditTaskDialog } from '@/components/task/edit-task-dialog';
import { DeleteTaskDialog } from '@/components/task/delete-task-dialog';

async function getTask(userId: string, taskId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${userId}/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${await getToken()}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const task = await getTask(session.user.id, params.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <div className="flex gap-2">
          <EditTaskDialog task={task}>
            <Button variant="outline">Edit</Button>
          </EditTaskDialog>
          <DeleteTaskDialog taskId={task.id}>
            <Button variant="destructive">Delete</Button>
          </DeleteTaskDialog>
        </div>
      </div>

      {/* Task Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{task.title}</h1>
          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
            {task.priority.toUpperCase()}
          </Badge>
        </div>

        {task.description && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(task.created_at).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(task.updated_at).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd>{task.completed ? 'Completed' : 'In Progress'}</dd>
            </div>
          </dl>
        </div>

        {/* Mark Complete Button */}
        <Button
          variant={task.completed ? 'outline' : 'default'}
          size="lg"
          className="w-full"
        >
          {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </Button>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Page loads task by ID from API
- [ ] Shows 404 if task not found
- [ ] Back button navigates to dashboard
- [ ] Edit button opens edit dialog
- [ ] Delete button shows confirmation
- [ ] Mark complete button toggles status

---

## 9. Middleware (Route Protection)

**File:** `middleware.ts`

**Purpose:** Protect routes and redirect unauthenticated users

**Code Structure:**
```typescript
import { authMiddleware } from '@/lib/auth'; // Better Auth middleware

export default authMiddleware({
  // Public routes (no auth required)
  publicRoutes: ['/login', '/signup'],

  // Redirect unauthenticated users to login
  loginRoute: '/login',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Behavior:**
- Intercept all routes (except API routes and static files)
- Check authentication status
- Redirect unauthenticated users to `/login`
- Allow public routes without auth

**Acceptance Criteria:**
- [ ] Unauthenticated users cannot access `/dashboard`
- [ ] Unauthenticated users are redirected to `/login`
- [ ] `/login` and `/signup` are public (no redirect)
- [ ] Authenticated users can access `/dashboard`

---

## 10. Navigation Component Integration

### 10.1 Navbar in Dashboard Layout

The Navbar component (from @specs/ui/components.md) should be included in `app/dashboard/layout.tsx`:

```tsx
import { Navbar } from '@/components/layout/navbar';

export default async function DashboardLayout({ children }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
```

### 10.2 Sidebar in Dashboard Layout

The Sidebar component (from @specs/ui/components.md) should be included in `app/dashboard/layout.tsx`:

```tsx
import { Sidebar } from '@/components/layout/sidebar';

// Same as above
```

---

## 11. Responsive Behavior

### 11.1 Mobile (<768px)

- Login/Signup: Full width card
- Dashboard:
  - Navbar: Logo + hamburger + avatar + theme
  - Sidebar: Hidden (drawer slides in)
  - Tasks: Card view (TaskList)
- Task Detail: Full width, stacked sections

### 11.2 Tablet (768-1024px)

- Login/Signup: Centered card
- Dashboard:
  - Navbar: Full layout (logo + search + avatar + theme)
  - Sidebar: Visible (collapsed width: 180px)
  - Tasks: Card view (TaskList, 2 columns)
- Task Detail: Centered, max-width-3xl

### 11.3 Desktop (>1024px)

- Login/Signup: Centered card
- Dashboard:
  - Navbar: Full layout (logo + search + command + avatar + theme)
  - Sidebar: Visible (full width: 240px)
  - Tasks: Table view (TaskTable)
- Task Detail: Centered, max-width-3xl

---

## 12. Error Handling

### 12.1 404 Not Found Page

**File:** `app/not-found.tsx`

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold gradient-text">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
```

### 12.2 Error Page

**File:** `app/error.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold gradient-text">Error</h1>
        <p className="text-muted-foreground">Something went wrong</p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
```

### 12.3 Loading State

**File:** `app/dashboard/loading.tsx`

```tsx
export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse bg-muted rounded" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}
```

---

## 13. Implementation Checklist

### 13.1 Setup

- [ ] Create `app/` directory structure
- [ ] Install Next.js 16+ with App Router
- [ ] Install dependencies (next-themes, lucide-react, etc.)
- [ ] Create root layout (`app/layout.tsx`)
- [ ] Create global styles (`app/globals.css`)

### 13.2 Auth Pages

- [ ] Create login page (`app/login/page.tsx`)
- [ ] Create signup page (`app/signup/page.tsx`)
- [ ] Test authentication flow

### 13.3 Dashboard

- [ ] Create dashboard layout (`app/dashboard/layout.tsx`)
- [ ] Create dashboard page (`app/dashboard/page.tsx`)
- [ ] Create loading state (`app/dashboard/loading.tsx`)
- [ ] Test route protection

### 13.4 Optional Pages

- [ ] Create task detail page (`app/tasks/[id]/page.tsx`)
- [ ] Create 404 page (`app/not-found.tsx`)
- [ ] Create error page (`app/error.tsx`)

### 13.5 Middleware

- [ ] Create middleware (`middleware.ts`)
- [ ] Configure Better Auth middleware
- [ ] Test route protection

### 13.6 Testing

- [ ] Test all routes
- [ ] Test authentication flow
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Test error states (404, 500)

---

## 14. Cross-References

**Related Specifications:**
- @specs/ui/components.md – Components used in pages
- @specs/ui/theme.md – Theme styling for pages
- @specs/features/authentication-frontend.md – Auth flow integration

**Implementation Order:**
1. Create root layout and global styles
2. Create login and signup pages
3. Create dashboard layout (with route protection)
4. Create dashboard page (with task list)
5. Create optional pages (task detail, 404, error)
6. Create middleware for route protection
7. Test all routes and authentication

---

**End of specs/ui/pages.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
