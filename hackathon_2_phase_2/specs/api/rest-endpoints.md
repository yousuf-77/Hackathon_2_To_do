# specs/api/rest-endpoints.md

## RESTful API Endpoints Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 2.3, @specs/database/schema.md, @specs/features/task-crud-backend.md

---

## Overview

Define all RESTful API endpoints for the Hackathon II Phase II Todo Full-Stack Web Application backend. All endpoints require JWT authentication and enforce strict user isolation as per @constitution.md Section 2.

**Base URL:** `http://localhost:8000/api` (configurable via `API_BASE_URL` env var)

**Authentication:** Bearer JWT token (issued by Better Auth on frontend)

**Response Format:** JSON

**Error Handling:** HTTP status codes with JSON error responses

---

## 1. Authentication & Authorization

### 1.1 JWT Verification Middleware

**All endpoints** require valid JWT token in `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

**Middleware Flow:**
1. Extract token from `Authorization` header
2. Verify signature using `BETTER_AUTH_SECRET` (shared with frontend)
3. Decode payload to extract `user_id`
4. Enforce: `user_id` in URL path === `user_id` in JWT payload
5. Pass `user_id` to route handler via dependency injection

**Implementation:** See @specs/authentication-backend.md Section 2

### 1.2 Error Responses

**401 Unauthorized**
```json
{
  "detail": "Missing or invalid authorization token"
}
```

**403 Forbidden**
```json
{
  "detail": "User ID mismatch: token user_id does not match path user_id"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": "Validation error: title is required (min_length=1, max_length=200)"
}
```

---

## 2. Task Endpoints

### 2.1 List User's Tasks

**Endpoint:** `GET /api/{user_id}/tasks`

**Description:** Retrieve all tasks belonging to the authenticated user. Supports filtering by completion status and sorting.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User ID from JWT token (must match) |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `all` | Filter by status: `pending`, `completed`, `all` |
| `sort` | string | No | `created` | Sort order: `created`, `title`, `priority`, `updated` |
| `order` | string | No | `desc` | Sort direction: `asc`, `desc` |
| `limit` | integer | No | `100` | Max results to return (1-1000) |
| `offset` | integer | No | `0` | Pagination offset |

**Request Example:**
```http
GET /api/abc123/tasks?status=pending&sort=priority&order=desc&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "id": "456",
      "user_id": "abc123",
      "title": "Build authentication system",
      "description": "Implement Better Auth with JWT plugin",
      "priority": "high",
      "completed": false,
      "created_at": "2025-02-08T10:30:00Z",
      "updated_at": "2025-02-08T10:30:00Z"
    },
    {
      "id": "789",
      "user_id": "abc123",
      "title": "Design database schema",
      "description": "Create SQLModel models for users and tasks",
      "priority": "medium",
      "completed": true,
      "created_at": "2025-02-07T15:20:00Z",
      "updated_at": "2025-02-08T09:45:00Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Response Schema:**
```typescript
interface TasksListResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}
```

**Acceptance Criteria:**
- [ ] Returns only tasks belonging to authenticated user
- [ ] Filters by `status` query parameter (pending/completed/all)
- [ ] Sorts by specified field (created/title/priority/updated)
- [ ] Supports pagination with `limit` and `offset`
- [ ] Returns 401 if token is missing or invalid
- [ ] Returns 403 if `user_id` in path doesn't match token
- [ ] Returns 400 if query parameters are invalid

---

### 2.2 Create Task

**Endpoint:** `POST /api/{user_id}/tasks`

**Description:** Create a new task for the authenticated user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User ID from JWT token (must match) |

**Request Body:**
```json
{
  "title": "Build authentication system",
  "description": "Implement Better Auth with JWT plugin",
  "priority": "high"
}
```

**Request Schema:**
```typescript
interface CreateTaskRequest {
  title: string;        // Required, min 1 char, max 200 chars
  description?: string; // Optional, max 1000 chars
  priority?: "low" | "medium" | "high";  // Optional, default "medium"
}
```

**Validation Rules:**
- `title`: Required, string, min_length=1, max_length=200
- `description`: Optional, string, max_length=1000
- `priority`: Optional, enum, default="medium", values=["low", "medium", "high"]

**Response:** `201 Created`
```json
{
  "id": "456",
  "user_id": "abc123",
  "title": "Build authentication system",
  "description": "Implement Better Auth with JWT plugin",
  "priority": "high",
  "completed": false,
  "created_at": "2025-02-08T10:30:00Z",
  "updated_at": "2025-02-08T10:30:00Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Validation error: title is required (min_length=1, max_length=200)"
}
```

**Acceptance Criteria:**
- [ ] Creates task with authenticated user's `user_id`
- [ ] Auto-generates unique `id` (string/UUID)
- [ ] Sets `completed` to `false` by default
- [ ] Sets `created_at` and `updated_at` to current timestamp
- [ ] Returns 201 with created task object
- [ ] Returns 400 if validation fails
- [ ] Returns 401 if token is missing or invalid
- [ ] Returns 403 if `user_id` in path doesn't match token

---

### 2.3 Get Single Task

**Endpoint:** `GET /api/{user_id}/tasks/{task_id}`

**Description:** Retrieve a single task by ID. Must belong to the authenticated user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User ID from JWT token (must match) |
| `task_id` | string | Task ID (UUID or auto-increment integer) |

**Request Example:**
```http
GET /api/abc123/tasks/456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "id": "456",
  "user_id": "abc123",
  "title": "Build authentication system",
  "description": "Implement Better Auth with JWT plugin",
  "priority": "high",
  "completed": false,
  "created_at": "2025-02-08T10:30:00Z",
  "updated_at": "2025-02-08T10:30:00Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "detail": "Task not found or does not belong to this user"
}
```

**Acceptance Criteria:**
- [ ] Returns task only if it belongs to authenticated user
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Returns 401 if token is missing or invalid
- [ ] Returns 403 if `user_id` in path doesn't match token

---

### 2.4 Update Task

**Endpoint:** `PUT /api/{user_id}/tasks/{task_id}`

**Description:** Update a task's fields. Only provided fields are updated (partial update). Task must belong to the authenticated user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User ID from JWT token (must match) |
| `task_id` | string | Task ID |

**Request Body:**
```json
{
  "title": "Build authentication system (updated)",
  "description": "Implement Better Auth with JWT plugin and test",
  "priority": "high"
}
```

**Request Schema:**
```typescript
interface UpdateTaskRequest {
  title?: string;        // Optional, min 1 char, max 200 chars
  description?: string; // Optional, max 1000 chars
  priority?: "low" | "medium" | "high";  // Optional
}
```

**Validation Rules:**
- All fields optional
- At least one field must be provided
- Same validation rules as CreateTask for each field

**Response:** `200 OK`
```json
{
  "id": "456",
  "user_id": "abc123",
  "title": "Build authentication system (updated)",
  "description": "Implement Better Auth with JWT plugin and test",
  "priority": "high",
  "completed": false,
  "created_at": "2025-02-08T10:30:00Z",
  "updated_at": "2025-02-08T11:30:00Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Validation error: at least one field must be provided"
}
```

**Acceptance Criteria:**
- [ ] Updates only provided fields (partial update)
- [ ] Updates `updated_at` timestamp
- [ ] Does NOT modify `id`, `user_id`, `created_at`, `completed`
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Returns 400 if validation fails or no fields provided
- [ ] Returns 401 if token is missing or invalid
- [ ] Returns 403 if `user_id` in path doesn't match token

---

### 2.5 Delete Task

**Endpoint:** `DELETE /api/{user_id}/tasks/{task_id}`

**Description:** Permanently delete a task. Task must belong to the authenticated user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User ID from JWT token (must match) |
| `task_id` | string | Task ID |

**Request Example:**
```http
DELETE /api/abc123/tasks/456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `204 No Content`

**Error Response:** `404 Not Found`
```json
{
  "detail": "Task not found or does not belong to this user"
}
```

**Acceptance Criteria:**
- [ ] Deletes task only if it belongs to authenticated user
- [ ] Returns 204 with no body on success
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Returns 401 if token is missing or invalid
- [ ] Returns 403 if `user_id` in path doesn't match token

---

### 2.6 Toggle Task Completion

**Endpoint:** `PATCH /api/{user_id}/tasks/{task_id}/complete`

**Description:** Toggle the `completed` status of a task. Task must belong to the authenticated user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | User ID from JWT token (must match) |
| `task_id` | string | Task ID |

**Request Body (Optional):**
```json
{
  "completed": true
}
```

**Request Schema:**
```typescript
interface ToggleCompleteRequest {
  completed?: boolean;  // Optional, if not provided toggles current state
}
```

**Response:** `200 OK`
```json
{
  "id": "456",
  "user_id": "abc123",
  "title": "Build authentication system",
  "description": "Implement Better Auth with JWT plugin",
  "priority": "high",
  "completed": true,
  "created_at": "2025-02-08T10:30:00Z",
  "updated_at": "2025-02-08T12:00:00Z"
}
```

**Acceptance Criteria:**
- [ ] Toggles `completed` status if body not provided
- [ ] Sets `completed` to specified value if body provided
- [ ] Updates `updated_at` timestamp
- [ ] Returns 404 if task doesn't exist or belongs to different user
- [ ] Returns 401 if token is missing or invalid
- [ ] Returns 403 if `user_id` in path doesn't match token

---

## 3. Health Check Endpoint

### 3.1 Health Check

**Endpoint:** `GET /health`

**Description:** Check if API server is running. No authentication required.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-02-08T12:00:00Z"
}
```

**Acceptance Criteria:**
- [ ] Returns 200 with status info
- [ ] No authentication required
- [ ] Used by deployment platforms for health checks

---

## 4. CORS Configuration

### 4.1 CORS Headers

**Allowed Origins:**
- Development: `http://localhost:3000` (Next.js frontend)
- Production: Configured via `FRONTEND_URL` env var

**Allowed Methods:**
- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

**Allowed Headers:**
- `Authorization`, `Content-Type`, `Accept`

**Credentials:**
- `true` (allow cookies/auth headers)

**Preflight Response:**
```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
```

**Implementation:** See @specs/authentication-backend.md Section 3

---

## 5. OpenAPI/Swagger Documentation

### 5.1 Auto-Generated Docs

FastAPI automatically generates OpenAPI 3.0 documentation at:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

**Configuration:**
```python
# File: backend/main.py
app = FastAPI(
    title="Hackathon Todo API",
    description="RESTful API for multi-user Todo application with JWT authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)
```

**Acceptance Criteria:**
- [ ] All endpoints documented in OpenAPI schema
- [ ] Request/response schemas defined with Pydantic
- [ ] Example requests provided
- [ ] Authentication requirements documented
- [ ] CORS headers documented

---

## 6. Rate Limiting (Optional/Bonus)

### 6.1 Rate Limit Rules

**Endpoint:** All `/api/` endpoints

**Limits:**
- `100 requests per minute` per user (based on JWT `user_id`)
- `1000 requests per hour` per IP address

**Response:** `429 Too Many Requests`
```json
{
  "detail": "Rate limit exceeded. Try again in 30 seconds."
}
```

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1644321000
```

---

## 7. Cross-References

**Related Specifications:**
- @constitution.md Section 2.3 – Authorization enforcement
- @constitution.md Section 3.2 – API design principles
- @specs/database/schema.md – Task model schema
- @specs/features/task-crud-backend.md – CRUD business logic
- @specs/authentication-backend.md – JWT middleware implementation

**Implementation Files:**
- `backend/app/api/tasks.py` – Task route handlers
- `backend/app/core/deps.py` – JWT verification dependency
- `backend/app/models/task.py` – SQLModel Task class
- `backend/app/schemas/task.py` – Pydantic request/response schemas

---

## 8. Testing Checklist

### 8.1 Authentication Tests
- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] User ID mismatch returns 403
- [ ] Valid token allows access

### 8.2 GET /api/{user_id}/tasks
- [ ] Returns only authenticated user's tasks
- [ ] Status filter works (pending/completed/all)
- [ ] Sort works (created/title/priority/updated)
- [ ] Pagination works (limit/offset)
- [ ] Empty array returns for new user

### 8.3 POST /api/{user_id}/tasks
- [ ] Creates task with valid data
- [ ] Returns 201 with created task
- [ ] Validates title (required, min/max length)
- [ ] Validates description (max length)
- [ ] Validates priority (enum)
- [ ] Sets defaults (priority=medium, completed=false)

### 8.4 GET /api/{user_id}/tasks/{task_id}
- [ ] Returns task if owned by user
- [ ] Returns 404 if not owned by user
- [ ] Returns 404 if doesn't exist

### 8.5 PUT /api/{user_id}/tasks/{task_id}
- [ ] Updates only provided fields
- [ ] Updates updated_at timestamp
- [ ] Returns 404 if not owned by user
- [ ] Validates all fields

### 8.6 DELETE /api/{user_id}/tasks/{task_id}
- [ ] Deletes task if owned by user
- [ ] Returns 204 on success
- [ ] Returns 404 if not owned by user

### 8.7 PATCH /api/{user_id}/tasks/{task_id}/complete
- [ ] Toggles completed status
- [ ] Sets completed to specified value if provided
- [ ] Returns 404 if not owned by user

### 8.8 CORS Tests
- [ ] Preflight OPTIONS request returns correct headers
- [ ] Frontend origin is allowed
- [ ] Authorization header is allowed
- [ ] Credentials are supported

---

**End of specs/api/rest-endpoints.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
