---

description: "Task list for Hackathon II Phase II Frontend Implementation"
---

# Tasks: Frontend - Hackathon Todo Phase II

**Input**: Design documents from `/specs/` (frontend-plan.md, ui/theme.md, ui/components.md, ui/pages.md, features/authentication-frontend.md)
**Prerequisites**: frontend-plan.md (required), constitution.md (for user stories)

**Tests**: No tests specified in this phase - tasks focus on implementation following spec-driven development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: All paths are relative to `frontend/` directory
- Components: `frontend/components/`
- Pages: `frontend/app/`
- Lib: `frontend/lib/`
- Hooks: `frontend/hooks/`
- Types: `frontend/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 16+ project with App Router in frontend/ directory
- [ ] T002 Install core dependencies: better-auth, next-themes, tailwindcss-animate, lucide-react, class-variance-authority, clsx, tailwind-merge
- [ ] T003 [P] Initialize TypeScript configuration in frontend/tsconfig.json with strict mode enabled
- [ ] T004 [P] Create Tailwind CSS configuration in frontend/tailwind.config.ts with custom theme
- [ ] T005 [P] Create Next.js configuration in frontend/next.config.ts with experimental features
- [ ] T006 [P] Create environment variable templates: frontend/.env.local and frontend/.env.example
- [ ] T007 [P] Create package.json scripts: dev, build, start, lint
- [ ] T008 [P] Create directory structure: app/, components/, lib/, hooks/, types/
- [ ] T009 [P] Create subdirectories: components/ui/, components/task/, components/layout/, components/auth/, components/command/, components/theme/

**Checkpoint**: Project initialized with all dependencies and directory structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Theme & Styling Foundation

- [ ] T010 Create frontend/app/globals.css with CSS variables for cyberpunk theme (colors, typography, effects)
- [ ] T011 [P] Create frontend/components/theme/theme-provider.tsx with next-themes wrapper
- [ ] T012 [P] Create frontend/app/layout.tsx root layout with ThemeProvider, fonts, and Toaster

### Type Definitions

- [ ] T013 [P] Create frontend/types/task.ts with Task interface (id, user_id, title, description, priority, completed, created_at, updated_at)
- [ ] T014 [P] Create frontend/types/user.ts with User interface (id, email, name)

### Authentication Foundation

- [ ] T015 Create frontend/lib/auth.ts with better-auth configuration and JWT plugin
- [ ] T016 [P] Create frontend/app/api/auth/[...auth]/route.ts Better Auth API route
- [ ] T017 [P] Create frontend/hooks/use-session.ts with session management hook
- [ ] T018 Create frontend/lib/api-client.ts with JWT-protected API client class

### Base UI Components

- [ ] T019 [P] Add Shadcn/UI Button component in frontend/components/ui/button.tsx with neon glow variants
- [ ] T020 [P] Add Shadcn/UI Card component in frontend/components/ui/card.tsx with glassmorphism styling
- [ ] T021 [P] Add Shadcn/UI Input component in frontend/components/ui/input.tsx with neon focus ring
- [ ] T022 [P] Add Shadcn/UI Label component in frontend/components/ui/label.tsx
- [ ] T023 [P] Add Shadcn/UI Checkbox component in frontend/components/ui/checkbox.tsx
- [ ] T024 [P] Add Shadcn/UI Badge component in frontend/components/ui/badge.tsx with priority colors
- [ ] T025 [P] Add Shadcn/UI Dialog component in frontend/components/ui/dialog.tsx with glassmorphism
- [ ] T026 [P] Add Shadcn/UI Table component in frontend/components/ui/table.tsx
- [ ] T027 [P] Add Shadcn/UI Command component in frontend/components/ui/command.tsx
- [ ] T028 [P] Add Shadcn/UI Toast component in frontend/components/ui/toast.tsx and use-toast.ts
- [ ] T029 [P] Add Shadcn/UI Dropdown Menu component in frontend/components/ui/dropdown-menu.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can sign up, sign in, and sign out with Better Auth + JWT

**Independent Test**: Navigate to /signup → create account → redirected to dashboard → logout → redirected to /login → sign in → dashboard

### Implementation for User Story 1

- [ ] T030 [P] [US1] Create frontend/components/auth/login-form.tsx with email/password form and Better Auth signIn
- [ ] T031 [P] [US1] Create frontend/components/auth/signup-form.tsx with name/email/password form and Better Auth signUp
- [ ] T032 [P] [US1] Create frontend/components/auth/user-menu.tsx with dropdown menu and sign out functionality
- [ ] T033 [US1] Create frontend/app/login/page.tsx with LoginForm component and centered layout
- [ ] T034 [US1] Create frontend/app/signup/page.tsx with SignupForm component and centered layout
- [ ] T035 [US1] Create frontend/middleware.ts with authMiddleware for route protection (publicRoutes: /login, /signup)
- [ ] T036 [US1] Create frontend/app/page.tsx root page with redirect logic (auth → dashboard, unauth → login)
- [ ] T037 [US1] Add neon glow effects and glassmorphism styling to login/signup pages
- [ ] T038 [US1] Add form validation (email format, password match, required fields) with error toasts

**Checkpoint**: User authentication flow complete - users can sign up, sign in, sign out

---

## Phase 4: User Story 2 - View Task List (Priority: P1)

**Goal**: Users can view their tasks in a responsive list (table on desktop, cards on mobile)

**Independent Test**: Sign in → navigate to /dashboard → see task list → resize browser → view changes from table to cards

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create frontend/app/dashboard/layout.tsx protected layout with auth check, Navbar, Sidebar
- [ ] T040 [P] [US2] Create frontend/components/layout/navbar.tsx with logo, search, command palette trigger, user menu, theme switcher
- [ ] T041 [P] [US2] Create frontend/components/layout/sidebar.tsx with navigation links (Dashboard, Tasks, Calendar, Settings)
- [ ] T042 [US2] Create frontend/components/task/task-list.tsx Server Component for mobile card view
- [ ] T043 [US2] Create frontend/components/task/task-table.tsx Client Component for desktop table view
- [ ] T044 [US2] Create frontend/app/dashboard/loading.tsx with loading skeleton animation
- [ ] T045 [US2] Create frontend/app/dashboard/page.tsx with task list SSR, filters, statistics, and responsive design
- [ ] T046 [US2] Add task statistics display (total, completed, active) with neon-colored badges
- [ ] T047 [US2] Implement responsive breakpoint logic: hide table on mobile, hide list on desktop
- [ ] T048 [US2] Add glassmorphism styling and neon glows to task cards/table

**Checkpoint**: Task list view complete - users can see their tasks in responsive layout

---

## Phase 5: User Story 3 - Add Task (Priority: P1)

**Goal**: Users can create new tasks with title, description, and priority

**Independent Test**: Sign in → click "Add Task" button → fill form → submit → task appears in list

### Implementation for User Story 3

- [ ] T049 [P] [US3] Create frontend/components/task/task-form.tsx Client Component with title (required), description (optional), priority (select) fields
- [ ] T050 [P] [US3] Create frontend/components/task/add-task-dialog.tsx with Dialog wrapper and TaskForm
- [ ] T051 [US3] Integrate AddTaskDialog trigger button in frontend/app/dashboard/page.tsx
- [ ] T052 [US3] Implement form validation (title required, max lengths) with real-time feedback
- [ ] T053 [US3] Add API call to create task using apiClient.post in task form submission
- [ ] T054 [US3] Add success toast notification on task creation
- [ ] T055 [US3] Add error toast notification on task creation failure
- [ ] T056 [US3] Add neon glow effect to "Add Task" button with hover animation
- [ ] T057 [US3] Close dialog after successful task creation and refresh task list

**Checkpoint**: Add task feature complete - users can create new tasks

---

## Phase 6: User Story 4 - Mark Task as Complete (Priority: P1)

**Goal**: Users can toggle task completion status with checkbox

**Independent Test**: Sign in → view task list → click checkbox → task shows as complete (strikethrough + dimmed)

### Implementation for User Story 4

- [ ] T058 [P] [US4] Add checkbox component to frontend/components/task/task-card.tsx with toggle complete functionality
- [ ] T059 [P] [US4] Add checkbox component to frontend/components/task/task-table.tsx with toggle complete functionality
- [ ] T060 [US4] Implement toggle complete API call using apiClient.patch in TaskCard and TaskTable
- [ ] T061 [US4] Add visual feedback: strikethrough title and dimmed opacity for completed tasks
- [ ] T062 [US4] Add neon green glow effect to completed checkbox
- [ ] T063 [US4] Update task statistics (completed count) when task is marked complete
- [ ] T064 [US4] Add smooth transition animation (200ms) on checkbox toggle

**Checkpoint**: Mark complete feature complete - users can toggle task completion status

---

## Phase 7: User Story 5 - Update Task (Priority: P1)

**Goal**: Users can edit existing tasks (title, description, priority)

**Independent Test**: Sign in → click edit button on task → modify fields → save → task updates in list

### Implementation for User Story 5

- [ ] T065 [P] [US5] Create frontend/components/task/edit-task-dialog.tsx with Dialog wrapper and TaskForm pre-filled
- [ ] T066 [US5] Add edit button to frontend/components/task/task-card.tsx with icon
- [ ] T067 [US5] Add edit button to frontend/components/task/task-table.tsx with icon
- [ ] T068 [US5] Implement edit dialog open handler with task data pre-population
- [ ] T069 [US5] Implement API call to update task using apiClient.put in task form submission
- [ ] T070 [US5] Add success toast notification on task update
- [ ] T071 [US5] Add error toast notification on task update failure
- [ ] T072 [US5] Close dialog after successful task update and refresh task list
- [ ] T073 [US5] Add neon glow effect to edit button with hover animation

**Checkpoint**: Update task feature complete - users can edit existing tasks

---

## Phase 8: User Story 6 - Delete Task (Priority: P1)

**Goal**: Users can delete tasks with confirmation dialog

**Independent Test**: Sign in → click delete button on task → confirm → task removed from list

### Implementation for User Story 6

- [ ] T074 [P] [US6] Add delete button to frontend/components/task/task-card.tsx with trash icon
- [ ] T075 [P] [US6] Add delete button to frontend/components/task/task-table.tsx with trash icon
- [ ] T076 [US6] Create confirmation dialog with "Are you sure?" message
- [ ] T077 [US6] Implement API call to delete task using apiClient.delete
- [ ] T078 [US6] Add success toast notification on task deletion
- [ ] T079 [US6] Add error toast notification on task deletion failure
- [ ] T080 [US6] Remove task from list after successful deletion
- [ ] T081 [US6] Add destructive red styling to delete button with hover effect

**Checkpoint**: Delete task feature complete - users can delete tasks

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final deployment preparation

### Command Palette (Bonus Feature)

- [ ] T082 [P] Create frontend/components/command/command-palette.tsx with search, actions, and keyboard navigation
- [ ] T083 Add keyboard shortcut (Cmd+K / Ctrl+K) to open command palette globally
- [ ] T084 Add quick actions: "Add Task", "Mark All Complete", "Clear Completed"
- [ ] T085 Add task search functionality in command palette

### Task Filters & Sorting

- [ ] T086 [P] Create frontend/components/task/task-filters.tsx Client Component with status filter (All/Active/Completed)
- [ ] T087 [P] Create sort dropdown (by date, by priority) in task-filters.tsx
- [ ] T088 Integrate TaskFilters component in frontend/app/dashboard/page.tsx
- [ ] T089 Implement URL query params for filters and sorting (/dashboard?status=active&sort=priority)

### Error Pages

- [ ] T090 [P] Create frontend/app/not-found.tsx 404 page with neon styling and "Go to Dashboard" button
- [ ] T091 [P] Create frontend/app/error.tsx error page with neon styling and "Try Again" button

### Performance & Optimization

- [ ] T092 [P] Add loading skeletons for all async components
- [ ] T093 [P] Implement image optimization with next/image component (if images added)
- [ ] T094 [P] Add code splitting for heavy components using dynamic imports
- [ ] T095 Run Lighthouse audit and achieve score >90
- [ ] T096 Optimize bundle size and remove unused dependencies

### Accessibility & Responsive Testing

- [ ] T097 [P] Add ARIA labels to all interactive elements
- [ ] T098 [P] Test keyboard navigation on all components
- [ ] T099 [P] Test with screen reader (NVDA or VoiceOver)
- [ ] T100 [P] Test responsive design on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] T101 [P] Verify color contrast ratios meet WCAG AA standards

### Deployment Preparation

- [ ] T102 Configure Vercel deployment settings in frontend/vercel.json
- [ ] T103 Set up production environment variables in Vercel dashboard
- [ ] T104 Test production build locally with npm run build
- [ ] T105 Deploy to Vercel and verify all functionality works
- [ ] T106 Test CORS configuration with deployed backend
- [ ] T107 Test authentication flow on deployed frontend
- [ ] T108 Test all 5 CRUD operations on deployed frontend

### Documentation

- [ ] T109 [P] Create frontend/README.md with setup instructions, tech stack, and environment variables
- [ ] T110 [P] Add inline comments for complex logic (JWT handling, auth flow, API client)
- [ ] T111 Update root README.md with frontend deployment link

**Checkpoint**: Frontend complete and deployed to Vercel

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (Authentication) must be complete before US2-US6 (requires auth to access dashboard)
  - US2 (View Task List) should be complete before US3-US6 (adds UI that other stories modify)
  - US3-US6 (Add, Complete, Update, Delete) can proceed in parallel after US2
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Authentication)**: Can start after Foundational (Phase 2) - No dependencies on other stories - BLOCKS US2-US6
- **User Story 2 (View Task List)**: Depends on US1 completion (requires auth to access) - Should be complete before US3-US6
- **User Story 3 (Add Task)**: Can start after US2 completion - Independent of US4-US6
- **User Story 4 (Mark Complete)**: Can start after US2 completion - Independent of US3, US5, US6
- **User Story 5 (Update Task)**: Can start after US2 completion - Independent of US3, US4, US6
- **User Story 6 (Delete Task)**: Can start after US2 completion - Independent of US3, US4, US5

### Within Each User Story

- Foundation components (forms, dialogs) before integration
- UI components before page integration
- Page integration before API calls
- Core implementation before styling/polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T009)
- All Foundational tasks marked [P] can run in parallel within their category (Theme: T011-T012, Types: T013-T014, Auth: T016-T017, UI: T019-T029)
- Once US2 (View Task List) is complete, US3-US6 can proceed in parallel by different developers
- All Polish tasks marked [P] can run in parallel (T082, T086-T087, T090-T091, T092-T094, T097-T100, T109-T110)

### Sequential Requirements

- T010 (globals.css) must complete before T011-T012 (theme components)
- T015 (auth.ts) must complete before T016-T018 (auth routes and hooks)
- T018 (api-client.ts) must complete before all API call tasks in US3-US6
- US1 (T030-T038) must complete before US2 (T039-T048)
- US2 (T039-T048) should complete before US3-US6 (but can proceed if basic layout exists)

---

## Parallel Example: User Story 2 (View Task List)

```bash
# After US1 is complete, launch these in parallel:
Task: "Create frontend/app/dashboard/layout.tsx protected layout with auth check"
Task: "Create frontend/components/layout/navbar.tsx with logo, search, user menu"
Task: "Create frontend/components/layout/sidebar.tsx with navigation links"
Task: "Create frontend/components/task/task-list.tsx Server Component for mobile"
Task: "Create frontend/components/task/task-table.tsx Client Component for desktop"
Task: "Create frontend/app/dashboard/loading.tsx with loading skeleton"
```

---

## Parallel Example: User Stories 3-6 (After US2 Complete)

```bash
# Once US2 is complete, all CRUD stories can proceed in parallel:
# Developer A - US3 (Add Task):
Task: "Create frontend/components/task/task-form.tsx Client Component"
Task: "Create frontend/components/task/add-task-dialog.tsx"

# Developer B - US4 (Mark Complete):
Task: "Add checkbox to frontend/components/task/task-card.tsx"
Task: "Add checkbox to frontend/components/task/task-table.tsx"

# Developer C - US5 (Update Task):
Task: "Create frontend/components/task/edit-task-dialog.tsx"

# Developer D - US6 (Delete Task):
Task: "Add delete button to frontend/components/task/task-card.tsx"
Task: "Add delete button to frontend/components/task/task-table.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T029) - CRITICAL
3. Complete Phase 3: User Story 1 - Authentication (T030-T038)
4. **STOP and VALIDATE**: Test authentication flow independently (signup → signin → logout)
5. Deploy to Vercel for initial demo

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Authentication) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (View Task List) → Test independently → Deploy/Demo
4. Add US3 (Add Task) → Test independently → Deploy/Demo
5. Add US4 (Mark Complete) → Test independently → Deploy/Demo
6. Add US5 (Update Task) → Test independently → Deploy/Demo
7. Add US6 (Delete Task) → Test independently → Deploy/Demo
8. Add Polish → Final demo with all features

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Team A: User Story 1 (Authentication) - MUST complete first
   - Once US1 complete:
     - Developer A: User Story 2 (View Task List)
     - Developer B: User Story 3 (Add Task)
     - Developer C: User Story 4 (Mark Complete)
     - Developer D: User Story 5 (Update Task)
     - Developer E: User Story 6 (Delete Task)
3. Stories complete and integrate independently

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Spec-driven development**: All implementation must follow specs in `/specs/` directory
- **No manual code writing**: Use `/sp.implement @specs/...` for implementation
- **Test on real devices**: Verify responsive design on actual mobile/tablet devices
- **Cyberpunk theme**: Ensure all UI components have neon glows, glassmorphism, smooth animations
- **JWT security**: Verify all API calls include Authorization header
- **User isolation**: Verify all tasks are scoped to authenticated user

---

## Task Count Summary

- **Total Tasks**: 111
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 20 tasks
- **User Story 1 (Authentication)**: 9 tasks
- **User Story 2 (View Task List)**: 10 tasks
- **User Story 3 (Add Task)**: 9 tasks
- **User Story 4 (Mark Complete)**: 7 tasks
- **User Story 5 (Update Task)**: 9 tasks
- **User Story 6 (Delete Task)**: 8 tasks
- **Polish Phase**: 30 tasks

### Parallel Opportunities

- **Setup**: 7 parallel tasks (T003-T009)
- **Foundational**: 18 parallel tasks across categories
- **User Stories 3-6**: Can run in parallel after US2 (30 tasks across 4 stories)
- **Polish**: 20 parallel tasks

### MVP Scope

**Suggested MVP**: User Story 1 (Authentication) only
- Tasks T001-T038
- Estimated: 2-3 hours
- Deliverable: Working authentication flow with beautiful cyberpunk UI

### Full Scope

**Complete Frontend**: All 6 user stories + polish
- Tasks T001-T111
- Estimated: 4-6 hours
- Deliverable: Fully functional todo application with all CRUD operations, responsive design, and deployment

---

**Format Validation**: ✅ All tasks follow the checklist format with checkbox, ID, labels, and file paths
