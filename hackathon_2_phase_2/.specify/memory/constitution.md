# Constitution – Hackathon II Phase II: Todo Full-Stack Web App

**Project Name:** hackathon-todo-phase2
**Phase:** Phase II – Multi-User Full-Stack Web Application
**Status:** Active – Enforced for all development work

---

## 1. Project Rules (Supreme Law)

### 1.1 Spec-Driven Development (100% Mandatory)

**ABSOLUTE PROHIBITION:**
- **NEVER** write, edit, or suggest manual code in `.ts`, `.tsx`, `.py`, or any implementation files
- **NEVER** patch implementation code directly when output is wrong
- **NEVER** bypass specs to "quick fix" implementation

**MANDATORY WORKFLOW:**
1. **ALWAYS** create/refine detailed Markdown specifications first (in `/specs/` folder)
2. **ONLY** generate implementation code via `/sp.implement @specs/<feature-spec>` after spec is perfect
3. **IF** output is incorrect → refine the spec, then re-implement
4. **ALL** code changes must trace back to a specification requirement

**Enforcement:**
- Before any implementation: verify spec exists, is detailed, and is approved
- During implementation: follow spec verbatim – no improvisation
- After implementation: validate against spec acceptance criteria
- Violation: stop work, return to spec phase

### 1.2 Monorepo Structure (Immutable)

```
hackathon-todo/
├── .spec-kit/
│   └── config.yaml          # Phase definitions: phase2-web
├── specs/
│   ├── overview.md          # Project scope & phases
│   ├── architecture.md      # System architecture decisions
│   ├── features/
│   │   ├── basic-level/     # CRUD features specs
│   │   ├── auth/            # Authentication specs
│   │   └── bonus/           # Bonus feature specs
│   ├── api/                 # API endpoint specs
│   ├── database/            # Database schema specs
│   └── ui/                  # UI/UX component specs
├── frontend/
│   ├── app/                 # Next.js 16+ App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API clients
│   ├── CLAUDE.md            # Frontend-specific rules
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routes
│   │   ├── models/          # SQLModel models
│   │   ├── core/            # Config, security, deps
│   │   └── db/              # Database connection
│   ├── CLAUDE.md            # Backend-specific rules
│   └── pyproject.toml
├── CLAUDE.md                # This constitution (root)
└── README.md                # Project overview
```

**Referencing Syntax:**
- Use `@specs/overview.md` notation in all documentation
- Use `@specs/features/auth/` for feature references
- Link specs to implementation: "Implements @specs/api/tasks.md"

### 1.3 Core Features (Non-Negotiable)

**All 5 Basic Level Features MUST Be Implemented:**
1. **Add Task** – Create new tasks with title, description, priority
2. **Delete Task** – Remove tasks by ID
3. **Update Task** – Edit task fields (title, description, priority)
4. **View Task List** – Display all user's tasks (table/card view)
5. **Mark as Complete** – Toggle task completion status

**Multi-User Requirement (Critical):**
- **EVERY** task MUST belong to exactly one user
- **ALL** operations MUST be scoped to authenticated user
- **NO** user can access another user's tasks
- User isolation enforced at database, API, and UI layers

---

## 2. Security & Authentication (Critical)

### 2.1 Authentication Architecture (Follow PDF Pages 7–8)

**Frontend: Next.js + Better Auth**
```
Flow:
1. User signs up/in via Better Auth (frontend)
2. Better Auth JWT plugin issues JWT token
3. Token stored in secure HTTP-only cookie or localStorage
4. Frontend attaches token to all backend API calls:
   Authorization: Bearer <token>
```

**Backend: FastAPI + JWT Verification**
```
Flow:
1. Middleware intercepts all /api/ requests
2. Extracts Authorization header
3. Verifies JWT signature using PyJWT
4. Extracts user_id from JWT payload
5. Enforces: user_id in URL path === user_id in JWT
6. Passes user_id to route handlers
```

### 2.2 Shared Secret Configuration

**Environment Variables (Required):**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# Backend (.env)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars  # SAME as frontend
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

**Secret Requirements:**
- Minimum 32 characters (cryptographically secure)
- **IDENTICAL** across frontend and backend
- Never commit to git (use .env.example)
- Rotate in production (document in runbook)

### 2.3 Authorization Enforcement

**API Endpoint Structure:**
```
ALL endpoints MUST follow pattern:
/api/{user_id}/tasks/...

Examples:
✅ GET  /api/123/tasks           # List tasks for user 123
✅ POST /api/123/tasks           # Create task for user 123
✅ PUT  /api/123/tasks/456       # Update task 456 (must belong to user 123)
✅ DELETE /api/123/tasks/456     # Delete task 456 (must belong to user 123)

❌ GET  /api/tasks               # Forbidden (no user_id)
❌ POST /api/tasks               # Forbidden (no user_id)
```

**Middleware Logic (Pseudocode):**
```python
def verify_jwt_middleware(request):
    # 1. Extract token from Authorization header
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    # 2. Verify token signature and expiry
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        jwt_user_id = payload.get("user_id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 3. Extract user_id from URL path
    path_user_id = request.path_params.get("user_id")

    # 4. Enforce match
    if jwt_user_id != path_user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")

    # 5. Pass to handler
    request.state.user_id = jwt_user_id
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "detail": "Missing or invalid authorization token"
}

// 403 Forbidden
{
  "detail": "User ID mismatch: token user_id does not match path user_id"
}

// 404 Not Found
{
  "detail": "Task not found or does not belong to this user"
}
```

### 2.4 User Isolation (Database Layer)

**All Database Queries MUST Include user_id Filter:**
```python
# ✅ CORRECT
async def get_tasks(user_id: int, session: Session):
    return await session.exec(
        select(Task).where(Task.user_id == user_id)
    )

# ❌ WRONG – returns all users' tasks
async def get_tasks(session: Session):
    return await session.exec(select(Task))
```

**Task Model Schema:**
```python
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")  # REQUIRED
    title: str
    description: Optional[str] = None
    priority: str = Field(default="medium")  # low, medium, high
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __table_args__ = (
        Index("idx_user_id", "user_id"),  # Query optimization
    )
```

### 2.5 Token Lifecycle

**Token Expiry:**
- Default: 7 days
- Configurable via `JWT_EXPIRATION_DAYS` env var
- Refresh token: optional (implement if time permits)

**Token Storage (Frontend):**
- Preferred: HTTP-only, secure cookie
- Fallback: localStorage (with XSS protection)
- Clear on logout

---

## 3. Architecture Principles

### 3.1 Technology Stack (Immutable)

**Frontend:**
- **Framework:** Next.js 16+ (App Router, not Pages Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (v4+)
- **Components:** Shadcn/UI (Radix UI + Tailwind)
- **State:** React Server Components + Client State
- **Auth:** Better Auth (with JWT plugin)
- **API Client:** Native fetch with JWT wrapper

**Backend:**
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLModel (built on Pydantic + SQLAlchemy)
- **Database:** Neon Serverless PostgreSQL
- **Auth:** PyJWT for verification
- **Validation:** Pydantic v2

**DevOps:**
- **Frontend Deployment:** Vercel (auto-deploy from main branch)
- **Backend Deployment:** Railway or Fly.io (optional for bonus)
- **Database:** Neon (serverless, free tier)
- **Repository:** GitHub (public, monorepo)

### 3.2 API Design Principles

**RESTful Conventions:**
```
GET    /api/{user_id}/tasks           → List all tasks (200 + array)
POST   /api/{user_id}/tasks           → Create task (201 + created task)
GET    /api/{user_id}/tasks/{id}      → Get single task (200 + task)
PUT    /api/{user_id}/tasks/{id}      → Update task (200 + updated task)
DELETE /api/{user_id}/tasks/{id}      → Delete task (204)
PATCH  /api/{user_id}/tasks/{id}      → Partial update (200 + task)
```

**Request/Response Format:**
```json
// Request: Create Task
POST /api/123/tasks
{
  "title": "Build auth system",
  "description": "Implement Better Auth + JWT",
  "priority": "high"
}

// Response: 201 Created
{
  "id": 456,
  "user_id": 123,
  "title": "Build auth system",
  "description": "Implement Better Auth + JWT",
  "priority": "high",
  "completed": false,
  "created_at": "2025-02-08T10:30:00Z",
  "updated_at": "2025-02-08T10:30:00Z"
}

// Error Response: 400 Bad Request
{
  "detail": "Validation error: title is required (min_length=1)"
}
```

**Error Taxonomy:**
- `400 Bad Request` – Invalid input, validation failure
- `401 Unauthorized` – Missing/invalid token
- `403 Forbidden` – User ID mismatch, insufficient permissions
- `404 Not Found` – Task doesn't exist or not owned by user
- `422 Unprocessable Entity` – Pydantic validation error
- `500 Internal Server Error` – Unexpected server error

### 3.3 Database Principles

**Connection Management:**
- Use async connection pooling (SQLModel + SQLAlchemy async)
- Single database session per request
- Proper connection closure (context managers)

**Migration Strategy:**
- Manual SQL for Phase II (keep it simple)
- Document schema in `@specs/database/schema.md`
- Use Alembic if time permits (bonus)

**Query Optimization:**
- Index on `user_id` (all queries filter by it)
- Use `select(Task).where(Task.user_id == user_id)` pattern
- Avoid N+1 queries (use joins if needed)

---

## 4. UI/UX Guidelines

### 4.1 Design Theme: Cyberpunk/Dark/Neon

**Color Palette:**
```css
/* Base Colors */
--background: #0a0a0a;        /* Deep black */
--foreground: #ededed;        /* Off-white text */

/* Neon Accents */
--neon-blue: #00d4ff;         /* Primary actions, links */
--neon-pink: #ff00ff;         /* High priority, danger */
--neon-green: #00ff88;        /* Success, complete */
--neon-yellow: #ffcc00;       /* Medium priority, warnings */

/* Priority Colors */
--priority-low: #00d4ff;      /* Blue */
--priority-medium: #ffcc00;   /* Yellow */
--priority-high: #ff00ff;     /* Pink */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
```

**Visual Effects:**
- **Glow Effects:** Box-shadows on hover/focus (neon colors)
- **Glassmorphism:** Translucent backgrounds with blur (backdrop-filter)
- **Gradients:** Subtle gradients on buttons/cards
- **Animations:** Smooth transitions (200ms ease-in-out)

**Component Examples:**
```css
/* Neon Button */
.neon-button {
  background: linear-gradient(135deg, var(--neon-blue), var(--neon-pink));
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transition: all 0.2s ease-in-out;
}

.neon-button:hover {
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
}

/* Glass Card */
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  border-radius: 12px;
}
```

### 4.2 Layout Structure

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Search | User Menu | Theme Toggle       │
├─────────────────────────────────────────────────────────┤
│ Sidebar (Nav) │ Main Content Area                      │
│               │                                         │
│ - Dashboard   │ ┌─────────────────────────────────────┐│
│ - Tasks       │ │ + Add Task Button (top-right)       ││
│ - Calendar    │ ├─────────────────────────────────────┤│
│ - Settings    │ │ Task List / Table                    ││
│               │ │ ┌─────┬──────────┬──────┬──────────┐││
│               │ │ │Done │ Title    │Pri  │ Actions  │││
│               │ │ ├─────┼──────────┼──────┼──────────┤││
│               │ │ │☑   │ Build... │High │ Edit/Del │││
│               │ │ │☐   │ Test API │Med  │ Edit/Del │││
│               │ │ └─────┴──────────┴──────┴──────────┘││
│               │ └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Responsive Design:**
- Desktop (>1024px): Sidebar + full table
- Tablet (768-1024px): Collapsed sidebar + card view
- Mobile (<768px): Hamburger menu + stacked cards

### 4.3 Component Patterns

**Task List (Desktop):**
- Table view with columns: Done, Title, Priority, Actions
- Hover effects on rows
- Quick actions: checkbox, edit icon, delete icon
- Color-coded priority badges

**Task List (Mobile):**
- Card view for each task
- Swipe actions (edit/delete)
- Collapsible description

**Add/Edit Dialog:**
- Modal with glassmorphism
- Form fields: title (required), description (textarea), priority (select)
- Validation: real-time feedback
- Save/Cancel buttons with neon glow

**Command Palette (Bonus):**
- Keyboard shortcut: `Cmd+K` / `Ctrl+K`
- Quick search: filter tasks by title
- Quick actions: "add task", "mark all complete", "clear completed"

### 4.4 Accessibility

**WCAG 2.1 Level AA Compliance:**
- Color contrast: minimum 4.5:1 for text
- Keyboard navigation: full keyboard support
- Focus indicators: visible neon glow on focus
- ARIA labels: on all interactive elements
- Screen reader: semantic HTML, proper headings

---

## 5. Development Workflow

### 5.1 Feature Development Lifecycle

**Step 1: Specification (Mandatory)**
```
1. Create spec: /specs/features/<feature-name>/spec.md
2. Include sections:
   - Overview & goals
   - User stories
   - Acceptance criteria (checkboxes)
   - API endpoints (request/response examples)
   - Database changes (models, migrations)
   - UI components (screens, interactions)
   - Edge cases & error handling
3. Review & refine spec until approved
```

**Step 2: Implementation (Automated)**
```bash
# After spec is perfect
/sp.implement @specs/features/<feature-name>/spec.md

# Claude Code generates:
# - Frontend: React components, API clients, UI
# - Backend: FastAPI routes, models, schemas
# - Tests: Unit tests, integration tests
```

**Step 3: Testing (Manual + Automated)**
```bash
# Frontend
cd frontend && npm run test
cd frontend && npm run lint

# Backend
cd backend && pytest
cd backend && ruff check

# E2E (bonus)
npm run test:e2e
```

**Step 4: Deployment**
```bash
# Frontend to Vercel (auto-deploy on push to main)
git push origin main

# Backend to Railway (manual or GitHub integration)
railway up
```

### 5.2 Git Workflow

**Branch Strategy:**
```
main (protected)
  ├── feature/auth-jwt
  ├── feature/task-crud
  ├── feature/ui-dashboard
  └── feature/priority-system
```

**Commit Message Format:**
```
feat(scope): description

Examples:
feat(auth): implement Better Auth with JWT plugin
feat(api): add GET /api/{user_id}/tasks endpoint
fix(db): add user_id index to Task model
ui(dashboard): create task list table component
docs(specs): add authentication feature spec
```

**Pull Request Requirements:**
- Link to spec: `Implements @specs/features/auth/spec.md`
- All tests passing
- Code review approval
- No merge conflicts

### 5.3 Error Handling & Debugging

**Frontend Error Handling:**
```typescript
// API client wrapper
async function apiClient<T>(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return await response.json() as T;
  } catch (error) {
    // Log to error tracking (Sentry, etc.)
    // Show user-friendly toast message
    throw error;
  }
}
```

**Backend Error Handling:**
```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
```

---

## 6. Bonus Strategy (+200 Reusable Intelligence)

### 6.1 Sub-Agent Specializations

**Available Agents:**
- `Spec-Writer-Pro` – Write/refine Markdown specs from user requirements
- `Better-Auth-JWT-Specialist` – Implement Better Auth + JWT flow
- `NextJS-Shadcn-UI-Engineer` – Build Next.js UI components with Shadcn
- `FastAPI-SQLModel-Engineer` – Create FastAPI routes + SQLModel models
- `Integration-and-Tester-Agent` – Test end-to-end flows, edge cases
- `Fullstack-Architecture-Planner` – Design system architecture, data flows
- `TodoPhase2-Orchestrator` – Coordinate multiple sub-agents for complex features

**Usage Pattern:**
```bash
# Write spec
/sp.specify "Implement user authentication with Better Auth and JWT"
→ Calls Spec-Writer-Pro

# Implement feature
/sp.implement @specs/features/auth/spec.md
→ Orchestrator calls:
   - Better-Auth-JWT-Specialist (auth setup)
   - NextJS-Shadcn-UI-Engineer (login/signup UI)
   - FastAPI-SQLModel-Engineer (JWT middleware)
   - Integration-and-Tester-Agent (test login flow)
```

### 6.2 Skill Library

**Available Skills:**
- `better-auth-jwt-setup` – Configure Better Auth with JWT plugin
- `shadcn-ui-cyberpunk-theme-generator` – Generate cyberpunk theme CSS
- `nextjs-api-client-with-jwt` – Create API client with JWT attachment
- `fastapi-jwt-middleware-neon` – Implement JWT verification middleware
- `sqlmodel-user-isolation` – Add user_id filtering to all queries

**Usage:**
```bash
# Invoke skill directly
/better-auth-jwt-setup

# Or reference in spec
## Implementation Notes
- Use skill: better-auth-jwt-setup
- Use skill: fastapi-jwt-middleware-neon
```

### 6.3 Reusable Patterns (Document in Specs)

**Pattern 1: JWT-Protected API Call**
```typescript
// File: frontend/src/lib/api-client.ts
export async function fetchTasks(userId: string): Promise<Task[]> {
  return apiClient<Task[]>(`/api/${userId}/tasks`);
}
```

**Pattern 2: User-Scoped Database Query**
```python
# File: backend/app/crud/tasks.py
async def get_tasks(session: Session, user_id: int):
    statement = select(Task).where(Task.user_id == user_id)
    return await session.exec(statement)
```

**Pattern 3: Shadcn Neon Button**
```tsx
// File: frontend/components/ui/neon-button.tsx
import { Button } from "@/components/ui/button";
import cn from "classnames";

export function NeonButton({ children, ...props }) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-cyan-500 to-pink-500",
        "hover:shadow-lg hover:shadow-cyan-500/50",
        "transition-all duration-200"
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
```

### 6.4 Bonus Features (Prioritized for Max Points)

**Priority 1 (Must-Have for +200):**
1. **Priority System** – Low/Medium/High with color coding
2. **Task Descriptions** – Multi-line text field
3. **Responsive Design** – Mobile/tablet/desktop layouts
4. **Command Palette** – `Cmd+K` quick search/actions
5. **Unit Tests** – >80% coverage (frontend + backend)

**Priority 2 (If Time Permits):**
1. **Due Dates** – Date picker, sort by due date
2. **Tags/Labels** – Categorize tasks with tags
3. **Task Calendar View** – Visual calendar (month/week)
4. **Export Tasks** – Download as JSON/CSV
5. **Dark/Light Mode Toggle** – Switch themes

**Priority 3 (Stretch Goals):**
1. **Real-time Updates** – WebSockets for multi-device sync
2. **Task Templates** – Pre-defined task templates
3. **Subtasks** – Nested task hierarchy
4. **Drag-and-Drop** – Reorder tasks
5. **Analytics Dashboard** – Task completion stats, charts

---

## 7. Deliverables & Submission

### 7.1 Required Deliverables

**1. GitHub Repository (Public)**
- URL: `https://github.com/<username>/hackathon-todo`
- Monorepo structure: `frontend/`, `backend/`, `specs/`
- README: setup instructions, demo link, tech stack
- License: MIT or Apache-2.0

**2. Vercel Deployment (Frontend)**
- URL: `https://hackathon-todo.vercel.app`
- Environment variables configured
- Custom domain (optional)

**3. Demo Video (<90 seconds)**
- Show signup/login
- Show all 5 CRUD operations
- Show multi-user isolation (2 different users)
- Show UI theme (cyberpunk/neon)
- Host on YouTube or Loom

**4. Documentation (in README)**
```markdown
# Hackathon Todo Phase II

## Live Demo: https://hackathon-todo.vercel.app

## Tech Stack
- Frontend: Next.js 16, TypeScript, Tailwind CSS, Shadcn/UI
- Backend: FastAPI, SQLModel, Neon PostgreSQL
- Auth: Better Auth + JWT

## Features
- ✅ User authentication (signup/login)
- ✅ Create, read, update, delete tasks
- ✅ Multi-user data isolation
- ✅ Priority system (low/medium/high)
- ✅ Cyberpunk theme
- ✅ Responsive design

## Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install
uvicorn app.main:app --reload
```

## Demo Video
[Watch 90s Demo](https://youtube.com/...)
```

### 7.2 Submission Checklist

**Code Quality:**
- [ ] All code follows spec (no manual edits)
- [ ] No hardcoded secrets (use .env)
- [ ] Linting passes (ESLint, Ruff)
- [ ] Tests pass (pytest, npm test)
- [ ] Git history clean (meaningful commits)

**Security:**
- [ ] JWT verification on all API endpoints
- [ ] User ID enforcement (path === token)
- [ ] Database queries filtered by user_id
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

**Functionality:**
- [ ] Signup works (creates user)
- [ ] Login works (issues JWT)
- [ ] All 5 CRUD operations work
- [ ] User isolation verified (test with 2 users)
- [ ] UI responsive on mobile/tablet/desktop

**Documentation:**
- [ ] README complete (setup, demo, tech stack)
- [ ] Specs exist in /specs/ folder
- [ ] API documented (OpenAPI/Swagger)
- [ ] Demo video linked (<90s)

---

## 8. Principles & Values

### 8.1 Development Philosophy

1. **Spec First, Code Later** – Specs are the source of truth
2. **Small, Testable Changes** – One feature per PR
3. **User Isolation is Sacred** – Never leak data between users
4. **Security is Not Optional** – JWT verification is mandatory
5. **Beauty Matters** – Cyberpunk theme is part of the spec

### 8.2 Quality Standards

**Code Quality:**
- PEP 8 compliance (backend Python)
- ESLint/Prettier (frontend TypeScript)
- Type safety: strict mode everywhere
- No `any` types without justification
- Meaningful variable/function names

**Testing Standards:**
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage (target 90%)

**Performance Standards:**
- p95 latency: <200ms for API calls
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse score: >90

### 8.3 Collaboration Guidelines

**Communication:**
- Write specs in Markdown (clear, detailed)
- Use `@specs/...` references in all discussions
- Document decisions in ADRs (Architecture Decision Records)
- Be explicit about assumptions

**Code Review:**
- Review specs, not just code
- Verify implementation matches spec
- Test security (user isolation, JWT)
- Check for edge cases

**Conflict Resolution:**
- Spec is supreme authority
- If spec is ambiguous → clarify, then implement
- If implementation is wrong → fix spec, re-implement
- Never bypass spec for convenience

---

## 9. Enforcement & Accountability

### 9.1 Constitution Violations

**Level 1: Warning (Self-Correction)**
- Writing implementation code without spec
- Bypassing JWT verification
- Hardcoding secrets
- **Action:** Stop work, return to spec phase

**Level 2: Critical (Reset)**
- Missing user_id filtering (data leak)
- Broken authentication flow
- Non-functional CRUD operations
- **Action:** Discard changes, restart from spec

**Level 3: Fatal (Disqualification)**
- Plagiarism (code not original)
- Missing multi-user isolation
- Not following monorepo structure
- **Action:** Project fails Hackathon II requirements

### 9.2 Validation Checks

**Pre-Implementation:**
- [ ] Spec exists in `/specs/features/<name>/spec.md`
- [ ] Spec has all required sections
- [ ] Spec has acceptance criteria (checkboxes)
- [ ] Spec is approved (reviewed)

**Post-Implementation:**
- [ ] All acceptance criteria pass
- [ ] Tests pass (unit, integration, E2E)
- [ ] Security verified (JWT, user isolation)
- [ ] UI matches spec (screenshots/videos)

**Pre-Submission:**
- [ ] All deliverables complete (repo, demo, video)
- [ ] Documentation updated (README, specs)
- [ ] Live demo deployed (Vercel)
- [ ] Peer review completed

---

## 10. Amendments & Version History

**Version 1.0 (2025-02-08)**
- Initial constitution for Phase II
- Spec-driven development mandate
- Security & authentication rules
- Monorepo structure definition
- UI/UX guidelines (cyberpunk theme)

**Amendment Process:**
1. Propose change via issue/discussion
2. Document rationale (why change needed)
3. Update constitution with new version
4. Communicate to all developers
5. Archive old version

---

## Conclusion

This constitution is the **supreme law** for all Phase II implementation work of the Hackathon II Todo Full-Stack Web Application.

**Any development work that violates this constitution must be stopped and corrected.**

**When in doubt:**
1. Return to the spec
2. Follow the workflow
3. Enforce security
4. Deliver quality

**Success Metrics:**
- ✅ All code is spec-driven
- ✅ All users are isolated
- ✅ All endpoints are JWT-protected
- ✅ All 5 CRUD features work
- ✅ UI is beautiful (cyberpunk theme)
- ✅ Demo video is <90s and impressive

**Remember:** Specs are the source of truth. This constitution enforces that principle.

---

**End of Constitution – Hackathon II Phase II: Todo Full-Stack Web Application**

**Last Updated:** 2025-02-08
**Status:** Active
**Version:** 1.0
