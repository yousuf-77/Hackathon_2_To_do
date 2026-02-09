# Hackathon Todo Backend

FastAPI backend for Hackathon II Phase II Todo Full-Stack Web Application.

## Features

- JWT authentication with Better Auth integration
- Multi-user task management with strict user isolation
- Async SQLModel ORM with Neon PostgreSQL
- RESTful API with OpenAPI/Swagger documentation
- CORS enabled for frontend integration

## Prerequisites

- Python 3.13+
- Neon PostgreSQL database

## Setup

1. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn sqlmodel asyncpg pyjwt python-dotenv pytest pytest-asyncio httpx
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Initialize database:**
   ```bash
   python -m app.db.init
   ```

## Running

**Development:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## Testing

**Run all tests:**
```bash
pytest
```

**Run with coverage:**
```bash
pytest --cov=app --cov-report=html
```

## API Endpoints

### Authentication
All endpoints require JWT token in `Authorization: Bearer <token>` header.

### Tasks
- `GET /api/{user_id}/tasks` - List user's tasks (with filtering, sorting, pagination)
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

### Health
- `GET /health` - Health check endpoint

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes | - |
| `BETTER_AUTH_SECRET` | JWT secret (must match frontend) | Yes | - |
| `JWT_ALGORITHM` | JWT algorithm | No | `HS256` |
| `JWT_EXPIRATION_DAYS` | Token expiration in days | No | `7` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |
| `API_HOST` | API host | No | `0.0.0.0` |
| `API_PORT` | API port | No | `8000` |
| `ENVIRONMENT` | Environment (development/production) | No | `development` |

## Security

- All endpoints protected with JWT verification
- User ID enforced on all routes (prevents accessing other users' data)
- All database queries filter by `user_id`
- CORS restricted to frontend origin only
- Secrets stored in environment variables

## License

MIT
