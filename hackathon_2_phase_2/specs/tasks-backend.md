# Tasks: Backend Implementation - Phase II Todo Full-Stack Web App

**Input**: Design documents from `/specs/`
**Prerequisites**: backend-plan.md (required), rest-endpoints.md, database/schema.md, task-crud-backend.md, authentication-backend.md

**Tests**: Integration tests included for all CRUD operations and authentication flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each CRUD feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5 for CRUD stories)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` at repository root
- All paths relative to `backend/` directory
- Tests in `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Backend project initialization and basic structure

- [ ] T001 Create backend directory structure per backend-plan.md section 1.1
- [ ] T002 Create pyproject.toml with FastAPI, SQLModel, PyJWT, Uvicorn dependencies per backend-plan.md section 6.1
- [ ] T003 [P] Create .gitignore in backend/ to exclude .env, __pycache__, .pytest_cache per backend-plan.md section 6.1
- [ ] T004 [P] Create .env.example in backend/ with placeholder environment variables per backend-plan.md section 6.3
- [ ] T005 [P] Create README.md in backend/ with setup and run instructions per backend-plan.md section 6.4

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create backend/app/core/config.py with Settings class loading environment variables per backend-plan.md section 2.1
- [ ] T007 [P] Create backend/app/core/security.py with decode_jwt() and verify_jwt_payload() functions per backend-plan.md section 3.1
- [ ] T008 [P] Create backend/app/core/errors.py with validation_exception_handler and http_exception_handler per backend-plan.md section 3.2
- [ ] T009 Create backend/app/db/session.py with async_engine, AsyncSessionLocal, and get_db() dependency per backend-plan.md section 2.2
- [ ] T010 Create backend/app/db/init.py with init_db() and reset_db() functions per backend-plan.md section 2.3
- [ ] T011 [P] Create backend/app/api/deps.py with get_current_user and get_current_user_enforce_path dependencies per backend-plan.md section 3.2
- [ ] T012 Create backend/app/main.py with FastAPI app, CORS middleware, and global exception handlers per backend-plan.md section 1.2
- [ ] T013 [P] Create backend/app/models/user.py with SQLModel User reference class (read-only) per database/schema.md section 2.1
- [ ] T014 [P] Create backend/tests/conftest.py with pytest fixtures for async client and database session per backend-plan.md section 7.1
- [ ] T015 Initialize database tables by running python -m app.db.init per backend-plan.md section 2.3

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Task (Create) (Priority: P1) 🎯 MVP

**Goal**: Users can create new tasks with title, description, and priority

**Independent Test**:
1. Generate valid JWT token for test user
2. POST to /api/{user_id}/tasks with task data
3. Verify 201 Created response with task object including unique ID, user_id, timestamps

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Create test_auth_flow.py in backend/tests/ with test_valid_token_allows_access per backend-plan.md section 7.2
- [ ] T017 [P] [US1] Create test_auth_flow.py in backend/tests/ with test_invalid_token_returns_401 per backend-plan.md section 7.2
- [ ] T018 [P] [US1] Create test_auth_flow.py in backend/tests/ with test_user_id_mismatch_returns_403 per backend-plan.md section 7.2

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create TaskBase and TaskCreate Pydantic schemas in backend/app/schemas/task.py per task-crud-backend.md section 2.1
- [ ] T020 [US1] Create SQLModel Task class in backend/app/models/task.py with all fields per database/schema.md section 2.2
- [ ] T021 [US1] Create TaskResponse and TaskListResponse Pydantic schemas in backend/app/schemas/task.py per task-crud-backend.md section 2.2
- [ ] T022 [US1] Implement POST /api/{user_id}/tasks endpoint in backend/app/api/routes/tasks.py per task-crud-backend.md section 3.2
- [ ] T023 [US1] Add UUID generation and timestamp defaults to task creation in backend/app/api/routes/tasks.py per task-crud-backend.md section 3.2
- [ ] T024 [US1] Add validation error handling for title field in backend/app/api/routes/tasks.py per task-crud-backend.md section 3.2

**Checkpoint**: At this point, User Story 1 (Add Task) should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Tasks (Read) (Priority: P1)

**Goal**: Users can view all their tasks with filtering, sorting, and pagination

**Independent Test**:
1. Create multiple tasks for test user
2. GET /api/{user_id}/tasks with various query parameters
3. Verify only user's own tasks returned (user isolation)
4. Verify filtering, sorting, pagination work correctly

### Tests for User Story 2

- [ ] T025 [P] [US2] Create test_tasks_crud.py in backend/tests/ with test_list_tasks_returns_only_users_tasks per backend-plan.md section 7.2
- [ ] T026 [P] [US2] Create test_tasks_crud.py in backend/tests/ with test_list_tasks_filters_by_status per backend-plan.md section 7.2
- [ ] T027 [P] [US2] Create test_tasks_crud.py in backend/tests/ with test_list_tasks_pagination per backend-plan.md section 7.2

### Implementation for User Story 2

- [ ] T028 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/app/api/routes/tasks.py with user_id filtering per task-crud-backend.md section 3.2
- [ ] T029 [US2] Add status query parameter filtering (pending/completed/all) to list endpoint per task-crud-backend.md section 3.2
- [ ] T030 [US2] Add sort_by and order query parameters with validation to list endpoint per task-crud-backend.md section 3.2
- [ ] T031 [US2] Add limit and offset pagination parameters to list endpoint per task-crud-backend.md section 3.2
- [ ] T032 [US2] Return TaskListResponse with total count in list endpoint per task-crud-backend.md section 3.2

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Update Task (Update) (Priority: P1)

**Goal**: Users can edit existing task fields (title, description, priority)

**Independent Test**:
1. Create a task for test user
2. PUT to /api/{user_id}/tasks/{task_id} with updated fields
3. Verify 200 OK with updated task object
4. Verify updated_at timestamp changed
5. Verify cannot update other users' tasks (404)

### Tests for User Story 3

- [ ] T033 [P] [US3] Create test_tasks_crud.py in backend/tests/ with test_update_task_modifies_fields per backend-plan.md section 7.2
- [ ] T034 [P] [US3] Create test_tasks_crud.py in backend/tests/ with test_update_task_enforces_ownership per backend-plan.md section 7.2
- [ ] T035 [P] [US3] Create test_tasks_crud.py in backend/tests/ with test_update_task_validates_input per backend-plan.md section 7.2

### Implementation for User Story 3

- [ ] T036 [P] [US3] Create TaskUpdate Pydantic schema in backend/app/schemas/task.py with optional fields per task-crud-backend.md section 2.1
- [ ] T037 [US3] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/app/api/routes/tasks.py per task-crud-backend.md section 3.2
- [ ] T038 [US3] Add user ownership verification in update endpoint (WHERE user_id match) per task-crud-backend.md section 3.2
- [ ] T039 [US3] Add validation for at least one field requirement in update endpoint per task-crud-backend.md section 3.2
- [ ] T040 [US3] Auto-update updated_at timestamp on task modification per task-crud-backend.md section 3.2

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Delete Task (Delete) (Priority: P1)

**Goal**: Users can permanently delete their tasks

**Independent Test**:
1. Create a task for test user
2. DELETE to /api/{user_id}/tasks/{task_id}
3. Verify 204 No Content response
4. Verify task is permanently deleted
5. Verify cannot delete other users' tasks (404)

### Tests for User Story 4

- [ ] T041 [P] [US4] Create test_tasks_crud.py in backend/tests/ with test_delete_task_removes_from_db per backend-plan.md section 7.2
- [ ] T042 [P] [US4] Create test_tasks_crud.py in backend/tests/ with test_delete_task_enforces_ownership per backend-plan.md section 7.2

### Implementation for User Story 4

- [ ] T043 [US4] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/app/api/routes/tasks.py per task-crud-backend.md section 3.2
- [ ] T044 [US4] Add user ownership verification in delete endpoint per task-crud-backend.md section 3.2
- [ ] T045 [US4] Return 204 No Content on successful deletion per task-crud-backend.md section 3.2
- [ ] T046 [US4] Return 404 if task not found or doesn't belong to user per task-crud-backend.md section 3.2

**Checkpoint**: All 4 CRUD stories (Create, Read, Update, Delete) should now be functional

---

## Phase 7: User Story 5 - Mark Task as Complete (Toggle) (Priority: P1)

**Goal**: Users can toggle task completion status

**Independent Test**:
1. Create a task with completed=false
2. PATCH to /api/{user_id}/tasks/{task_id}/complete
3. Verify completed toggles to true
4. Verify updated_at timestamp changed
5. Verify cannot toggle other users' tasks (404)

### Tests for User Story 5

- [ ] T047 [P] [US5] Create test_tasks_crud.py in backend/tests/ with test_toggle_task_complete per backend-plan.md section 7.2
- [ ] T048 [P] [US5] Create test_tasks_crud.py in backend/tests/ with test_toggle_task_without_body_toggles per backend-plan.md section 7.2

### Implementation for User Story 5

- [ ] T049 [P] [US5] Create TaskToggleComplete Pydantic schema in backend/app/schemas/task.py per task-crud-backend.md section 2.1
- [ ] T050 [US5] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/app/api/routes/tasks.py per task-crud-backend.md section 3.2
- [ ] T051 [US5] Add toggle logic (if no body, toggle current state) in toggle endpoint per task-crud-backend.md section 3.2
- [ ] T052 [US5] Add user ownership verification in toggle endpoint per task-crud-backend.md section 3.2
- [ ] T053 [US5] Auto-update updated_at timestamp on toggle per task-crud-backend.md section 3.2

**Checkpoint**: All 5 basic CRUD features should now be fully functional and testable

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Create health check endpoint in backend/app/api/routes/health.py per backend-plan.md section 1.2
- [ ] T055 [P] Add root endpoint to backend/app/main.py with API information per backend-plan.md section 1.2
- [ ] T056 [P] Run all integration tests in backend/tests/ with pytest per backend-plan.md section 7.1
- [ ] T057 [P] Test backend with Swagger UI at http://localhost:8000/docs per backend-plan.md section 7.1
- [ ] T058 [P] Verify CORS preflight requests succeed per backend-plan.md section 5.1
- [ ] T059 [P] Create temporary JWT for development testing in backend/app/core/security.py per backend-plan.md section 3.1
- [ ] T060 [P] Add SQL query logging for development mode in backend/app/db/session.py per backend-plan.md section 7.4
- [ ] T061 [P] Verify .env file exists with all required environment variables per backend-plan.md section 6.3
- [ ] T062 [P] Start backend server with uvicorn app.main:app --reload --port 8000 per backend-plan.md section 6.4
- [ ] T063 [P] Add request logging middleware to backend/app/main.py per backend-plan.md section 7.4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Add Task - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (View Tasks - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (Update Task - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (Delete Task - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (Toggle Complete - P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Models before endpoints
- Core implementation before validation
- Story complete before moving to next story

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005)
- All Foundational tasks marked [P] can run in parallel after config (T007, T008, T011, T013, T014)
- Once Foundational phase completes, ALL user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- User stories are completely independent - can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "test_valid_token_allows_access in backend/tests/test_auth_flow.py"
Task: "test_invalid_token_returns_401 in backend/tests/test_auth_flow.py"
Task: "test_user_id_mismatch_returns_403 in backend/tests/test_auth_flow.py"

# Launch all schemas for User Story 1 together:
Task: "Create TaskBase and TaskCreate Pydantic schemas in backend/app/schemas/task.py"
Task: "Create TaskResponse and TaskListResponse Pydantic schemas in backend/app/schemas/task.py"
```

---

## Implementation Strategy

### MVP First (All CRUD Stories - One Complete Backend)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T015) - CRITICAL - blocks all stories
3. Complete Phase 3-7: All User Stories (T016-T053)
4. **STOP and VALIDATE**: Test all CRUD operations independently
5. Deploy/demo complete backend

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Add Task) → Test independently → Backend can create tasks
3. Add User Story 2 (View Tasks) → Test independently → Backend can list tasks
4. Add User Story 3 (Update Task) → Test independently → Backend can modify tasks
5. Add User Story 4 (Delete Task) → Test independently → Backend can delete tasks
6. Add User Story 5 (Toggle Complete) → Test independently → Backend complete!
7. Polish phase → Production-ready backend

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Add Task) + User Story 2 (View Tasks)
   - Developer B: User Story 3 (Update Task) + User Story 4 (Delete Task)
   - Developer C: User Story 5 (Toggle) + Polish phase
3. Stories complete and integrate independently
4. Merge and test complete backend

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All 5 user stories are independently completable and testable
- JWT authentication and user isolation are enforced in foundational phase
- Each user story should work independently without other stories
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies

---

## Summary

- **Total Task Count**: 63 tasks
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 10 tasks (BLOCKING)
- **User Story Phases**: 38 tasks across 5 stories
- **Polish Phase**: 10 tasks
- **Parallel Opportunities**: 33 tasks marked [P]
- **MVP Scope**: Phases 1-7 (all 5 CRUD stories) = 53 tasks
- **Estimated Time**: 2-3 hours for complete backend implementation
