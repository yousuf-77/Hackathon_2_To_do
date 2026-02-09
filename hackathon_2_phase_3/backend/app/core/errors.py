"""Global exception handlers for FastAPI."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    """Handle Pydantic validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


async def http_exception_handler(
    request: Request,
    exc: HTTPException,
):
    """Handle HTTP exceptions."""
    # Log auth failures for security monitoring
    if exc.status_code in (401, 403):
        logger.warning(
            f"Auth failed: {exc.detail} - Path: {request.url.path}"
        )

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def general_exception_handler(
    request: Request,
    exc: Exception,
):
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
