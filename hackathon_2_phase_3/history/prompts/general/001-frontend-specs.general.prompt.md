---
id: "001"
title: "Frontend Specification Generation for Phase II Todo Web App"
stage: "spec"
date: "2025-02-08"
surface: "agent"
model: "claude-sonnet-4-5"
feature: "none"
branch: "master"
user: "user"
command: "/sp.specify"
labels: ["frontend","specification","nextjs","authentication","ui","components"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/ui/theme.md
  - specs/ui/components.md
  - specs/ui/pages.md
  - specs/features/authentication-frontend.md
tests: []
---

## Prompt

Create and/or refine a set of frontend specification files for Phase II Todo Full-Stack Web Application (Hackathon II), strictly following the constitution (@constitution.md) and hackathon PDF requirements.

Focus exclusively on the **frontend** part for now (Next.js 16+ App Router in /frontend/ folder). Backend integration points (API calls, JWT) are described but not implemented here.

Generate the following Markdown spec files (or update if they exist):

1. specs/ui/components.md
   - Detailed specs for reusable Shadcn/UI + Tailwind components
   - TaskCard (title, description, completed checkbox, priority color badge, delete button, edit button)
   - TaskList/Table (responsive table or card grid, show title, status, created/updated)
   - AddTaskDialog / EditTaskDialog (form with title required, description textarea)
   - Navbar / Sidebar (with user avatar, logout, theme switcher)
   - CommandPalette (cmd+k for quick actions: add task, search)

2. specs/ui/pages.md
   - Layout structure (root layout with ThemeProvider from next-themes)
   - Protected layout for dashboard (redirect to login if not authenticated)
   - Pages:
     - /login → Better Auth sign-in form (email/password + Google if possible)
     - /signup → Better Auth sign-up form
     - /dashboard (default after login) → Task list + add button + filters (status)
     - /tasks/[id] → Single task detail view (optional but nice)

3. specs/features/authentication-frontend.md
   - Frontend-only auth flow using Better Auth
   - Install & configure Better Auth in Next.js App Router
   - Use client plugin to get JWT token after login
   - Attach Authorization: Bearer <token> to every fetch/axios call to backend
   - Handle 401 → redirect to login
   - Session management: use Better Auth hooks (useSession, signIn, signOut)
   - Protected routes: middleware or layout-level check

4. specs/ui/theme.md (new file)
   - Cyberpunk/neon dark theme by default (use your shadcn-ui-cyberpunk-theme-generator skill)
   - Dark mode primary, light mode secondary
   - CSS variables for neon pink, cyan, purple glows, glassmorphism (backdrop-blur)
   - Tailwind config overrides + global.css
   - Theme switcher component in navbar

Core frontend rules to enforce:
- TypeScript everywhere
- Server Components by default, Client Components only for interactivity (use "use client")
- Use Shadcn/UI components (Button, Card, Table, Dialog, Input, Label, Checkbox, Badge, Command, etc.)
- Responsive: mobile-first, good on all screens
- API client: create /lib/api.ts with typed fetch wrapper that auto-adds JWT (use nextjs-api-client-with-jwt skill)
- Base URL from env NEXT_PUBLIC_API_URL (backend on localhost:8000 for dev)
- Endpoints: GET/POST/PUT/DELETE/PATCH /api/{user_id}/tasks/... (user_id from session)
- Beautiful & professional: neon accents, glow effects, futuristic feel to impress judges

Workflow:
1. Read @constitution.md and relevant existing specs
2. If needed, call sub-agents (NextJS-Shadcn-UI-Engineer, Better-Auth-JWT-Specialist) or skills (shadcn-ui-cyberpunk-theme-generator, nextjs-api-client-with-jwt)
3. Output full Markdown content for each file above
4. After specs are ready → I will later ask to /sp.implement them one by one

Generate the spec files now in proper Markdown format. Use @references for cross-spec linking (e.g. @specs/ui/theme.md).
Start each file with its path as header, e.g. # specs/ui/components.md

## Response snapshot

Successfully created 4 comprehensive frontend specification files for Phase II of the Hackathon Todo web application:

1. **specs/ui/theme.md** (624 lines)
   - Cyberpunk/neon dark theme specification
   - Complete color palette with CSS variables
   - Typography system (Inter + JetBrains Mono)
   - Visual effects (neon glows, glassmorphism, gradients)
   - Component styling variants (Button, Card, Input)
   - Tailwind configuration
   - Global styles in app/globals.css
   - Theme switcher component spec
   - Accessibility guidelines (WCAG AA)

2. **specs/ui/components.md** (924 lines)
   - Component hierarchy and file structure
   - Base UI components (Button, Card, Input, Label, Checkbox, Badge, Dialog, Table, Command, Toast)
   - Task-specific components (TaskCard, TaskList, TaskTable, TaskForm, AddTaskDialog, EditTaskDialog)
   - Layout components (Navbar, Sidebar, UserMenu)
   - Auth components (LoginForm, SignupForm)
   - Command Palette component
   - Responsive design breakpoints
   - Icon library (Lucide React)
   - Implementation checklist

3. **specs/ui/pages.md** (724 lines)
   - Next.js 16+ App Router file structure
   - Root layout with ThemeProvider
   - Root page (redirect logic)
   - Login page (with LoginForm)
   - Signup page (with SignupForm)
   - Dashboard layout (protected route)
   - Dashboard page (task list with filters)
   - Task detail page (optional)
   - Middleware for route protection
   - Error handling (404, error, loading states)
   - Responsive behavior (mobile/tablet/desktop)

4. **specs/features/authentication-frontend.md** (724 lines)
   - Better Auth installation and configuration
   - JWT plugin setup
   - Complete authentication flows (signup, signin, signout)
   - Session management
   - JWT token extraction and attachment
   - API client with auto-JWT (using nextjs-api-client-with-jwt skill)
   - Protected routes (server-side and middleware)
   - UI components for auth (LoginForm, SignupForm, UserMenu)
   - Environment variables
   - Error handling
   - Security considerations
   - Testing checklist

All specs include:
- Cross-references using @specs/... syntax
- Acceptance criteria with checkboxes
- Code examples (TypeScript/React)
- Implementation checklists
- Responsive design guidelines
- Accessibility requirements

## Outcome

- ✅ Impact: Created comprehensive frontend specifications covering all aspects of the Phase II Todo web application (theme, components, pages, authentication). Specs are ready for implementation via /sp.implement.
- 🧪 Tests: No tests created yet (specs only).
- 📁 Files: Created 4 specification files totaling ~3000 lines of detailed documentation with code examples, acceptance criteria, and implementation checklists.
- 🔁 Next prompts: User will likely request /sp.implement for each spec file, starting with theme setup, then components, pages, and authentication.
- 🧠 Reflection: All specs strictly follow the constitution (@constitution.md) with emphasis on spec-driven development, TypeScript, Server Components, Shadcn/UI, cyberpunk theme, Better Auth + JWT, and mobile-first responsive design. Specs are detailed enough for autonomous implementation without manual coding.

## Evaluation notes (flywheel)

- Failure modes observed: None. Specs generated successfully on first attempt.
- Graders run and results (PASS/FAIL): N/A (specification phase only).
- Prompt variant (if applicable): N/A (initial prompt).
- Next experiment (smallest change to try): After user reviews specs, may need to refine based on feedback. Next step would be /sp.implement to begin implementation.
