"""FastAPI application setup with CORS and routers."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.errors import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Hackathon Todo API",
    description=(
        "RESTful API for multi-user Todo application with JWT authentication. "
        "Enforces strict user isolation and stateless authentication."
    ),
    version="1.0.0",
    docs_url="/docs",           # Swagger UI
    redoc_url="/redoc",         # ReDoc
    openapi_url="/openapi.json",
)

# CORS Middleware (MUST be registered before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Frontend dev server
        "http://localhost:3001",      # Alternate port
        "http://localhost:3002",      # Alternate port
        "http://localhost:3003",      # Alternate port
        "http://localhost:3004",      # Alternate port
        "http://localhost:3005",      # Alternate port
        "http://localhost:3006",      # Alternate port
        "http://127.0.0.1:3000",      # Loopback
        "http://127.0.0.1:3001",      # Loopback
        "http://127.0.0.1:3002",      # Loopback
        "http://127.0.0.1:3003",      # Loopback
        "http://127.0.0.1:3004",      # Loopback
        "http://127.0.0.1:3005",      # Loopback
        "http://127.0.0.1:3006",      # Loopback
        settings.frontend_url,        # From env var
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,                     # Cache preflight for 10 min
)

# Global Exception Handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)


# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all requests for debugging."""
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response


# Include Routers
from app.api.routes.tasks import router as tasks_router
from app.api.routes.health import router as health_router
from app.api.routes.agent import router as agent_router  # Phase 3: AI Chatbot

app.include_router(tasks_router)
app.include_router(health_router)
app.include_router(agent_router)  # Phase 3: AI Chatbot endpoints


# Root Endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Hackathon Todo API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "environment": settings.environment,
    }
