# Quick Start Guide - Hackathon Todo Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd /mnt/e/Hackathon_2_To_do/hackathon_2_phase_2/backend
pip install fastapi uvicorn sqlmodel asyncpg pyjwt python-dotenv pytest pytest-asyncio httpx pydantic-settings
```

### 2. Initialize Database
```bash
python -m app.db.init
```

Expected output:
```
Initializing database (creating tables if not exist)...
Database initialization complete.
```

### 3. Start Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4. Verify Server
Open browser: http://localhost:8000/docs

You should see Swagger UI with all endpoints documented.

---

## Testing the API

### Generate Test Token
```bash
python -c "from app.core.security import create_test_token; print(create_test_token('test-user-123'))"
```

Copy the output token.

### Test with cURL

#### 1. Health Check
```bash
curl http://localhost:8000/health
```

#### 2. Create Task
```bash
curl -X POST http://localhost:8000/api/test-user-123/tasks \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "Test description",
    "priority": "high"
  }'
```

#### 3. List Tasks
```bash
curl http://localhost:8000/api/test-user-123/tasks \
  -H "Authorization: Bearer <your-token>"
```

#### 4. Update Task
```bash
curl -X PUT http://localhost:8000/api/test-user-123/tasks/<task-id> \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title"}'
```

#### 5. Toggle Complete
```bash
curl -X PATCH http://localhost:8000/api/test-user-123/tasks/<task-id>/complete \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

#### 6. Delete Task
```bash
curl -X DELETE http://localhost:8000/api/test-user-123/tasks/<task-id> \
  -H "Authorization: Bearer <your-token>"
```

---

## Run Tests

```bash
cd backend
pytest -v
```

Expected output:
```
collected 20 items

tests/test_auth_flow.py .....
tests/test_tasks_crud.py ................

====== 20 passed in X.XX ======
```

---

## Environment Variables

All variables are already set in `.env`:
- `DATABASE_URL` - Neon PostgreSQL connection
- `BETTER_AUTH_SECRET` - JWT secret (matches frontend)
- `FRONTEND_URL` - Frontend origin for CORS

---

## Troubleshooting

### Server won't start
- Check if port 8000 is already in use
- Verify all dependencies are installed
- Check `.env` file exists

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check internet connection (Neon is cloud-hosted)
- Ensure SSL mode is enabled

### JWT verification fails
- Verify `BETTER_AUTH_SECRET` matches frontend
- Check token is not expired
- Verify token format: `Authorization: Bearer <token>`

### Tests fail
- Ensure database is initialized: `python -m app.db.init`
- Check all dependencies are installed
- Verify `.env` file exists

---

## API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

---

## Frontend Integration

### Base URL
```
http://localhost:8000
```

### Authorization Header
```
Authorization: Bearer <jwt-token-from-better-auth>
```

### Example Fetch Call
```javascript
const response = await fetch("http://localhost:8000/api/user-123/tasks", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
console.log(data);
```

---

## Support

For issues or questions:
1. Check IMPLEMENTATION_REPORT.md for detailed documentation
2. Review test files for usage examples
3. Check Swagger UI for interactive documentation
