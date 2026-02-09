"""
MCP Middleware for Phase 3 Todo Chatbot
Injects JWT authentication context into MCP tool calls
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.middleware import jwt_auth
from app.mcp.server import set_request_token, clear_request_context
import logging

logger = logging.getLogger(__name__)


class MCPAuthMiddleware(BaseHTTPMiddleware):
    """Middleware to inject JWT context into MCP requests"""

    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request and inject JWT context

        Args:
            request: Incoming request
            call_next: Next middleware/route handler

        Returns:
            Response from next handler
        """
        # Skip auth for non-MCP endpoints
        if not request.url.path.startswith("/api/agent") and not request.url.path.startswith(
            "/mcp"
        ):
            return await call_next(request)

        # Extract JWT token from Authorization header
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

            try:
                # Verify token and inject into MCP context
                set_request_token(token)
                logger.info(f"Injected JWT context for MCP request: {request.url.path}")

            except jwt_auth.JWTAuthError as e:
                # Clear context and return error
                clear_request_context()
                logger.warning(f"JWT auth failed for MCP request: {e.message}")

                # For SSE endpoints, we might want to let the error propagate
                # to the handler for proper streaming error response
                pass

        try:
            # Process request
            response = await call_next(request)
            return response

        finally:
            # Always clear context after request
            clear_request_context()
            logger.debug(f"Cleared JWT context for MCP request: {request.url.path}")


class MCPWebSocketAuthMiddleware:
    """Middleware for WebSocket connections to MCP server"""

    @staticmethod
    async def authenticate_websocket(websocket, token: str) -> bool:
        """Authenticate WebSocket connection with JWT token

        Args:
            websocket: WebSocket connection
            token: JWT bearer token

        Returns:
            True if authenticated, False otherwise
        """
        try:
            set_request_token(token)
            logger.info("WebSocket connection authenticated for MCP")
            return True

        except jwt_auth.JWTAuthError as e:
            logger.warning(f"WebSocket auth failed: {e.message}")
            return False

        finally:
            # Note: Don't clear context here, it needs to persist for the WebSocket session
            # Context will be cleared when WebSocket closes
            pass

    @staticmethod
    async def on_websocket_close():
        """Called when WebSocket connection closes"""
        clear_request_context()
        logger.info("WebSocket connection closed, cleared MCP context")


async def extract_token_from_request(request: Request) -> str | None:
    """Extract JWT token from various request sources

    Args:
        request: Incoming request

    Returns:
        JWT token string or None
    """
    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]

    # Try query parameter (less secure, but convenient for development)
    token = request.query_params.get("token")
    if token:
        return token

    # Try cookie (if using cookie-based auth)
    token = request.cookies.get("auth_token")
    if token:
        return token

    return None
