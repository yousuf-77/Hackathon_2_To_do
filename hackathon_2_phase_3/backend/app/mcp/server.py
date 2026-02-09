"""
MCP Server Initialization for Phase 3 Todo Chatbot
FastMCP server with JWT authentication and Todo CRUD tools
"""
from fastmcp import FastMCP
from app.config import config
from app.middleware import jwt_auth
from typing import Optional

# Create MCP server
mcp = FastMCP(
    name=config.MCP_SERVER_NAME,
    version=config.MCP_SERVER_VERSION,
)


class MCPContext:
    """Request context for MCP tool calls"""

    def __init__(self):
        self.user_id: Optional[str] = None
        self.jwt_token: Optional[str] = None

    def set_auth(self, token: str) -> None:
        """Set authentication from JWT token

        Args:
            token: JWT bearer token

        Raises:
            jwt_auth.JWTAuthError: If token is invalid
        """
        self.jwt_token = token
        payload = jwt_auth.verify_and_extract_user(token)
        self.user_id = str(payload["user_id"])

    def get_user_id(self) -> str:
        """Get authenticated user ID

        Returns:
            User ID (UUID string)

        Raises:
            ValueError: If not authenticated
        """
        if self.user_id is None:
            raise ValueError("Not authenticated: user_id not set in MCP context")
        return self.user_id


# Global request context (thread-local for concurrent requests)
_request_context = MCPContext()


def get_request_context() -> MCPContext:
    """Get current request context

    Returns:
        MCPContext instance with user_id if authenticated
    """
    return _request_context


def set_request_token(token: str) -> None:
    """Set JWT token for current request

    Args:
        token: JWT bearer token

    Raises:
        jwt_auth.JWTAuthError: If token is invalid
    """
    _request_context.set_auth(token)


def clear_request_context() -> None:
    """Clear request context (called after each request)"""
    _request_context = MCPContext()


# Example MCP tool (will be extended in task_tools.py)
@mcp.tool()
async def get_authenticated_user_id() -> dict:
    """Get the authenticated user's ID from JWT context

    Returns:
        Dictionary with user_id
    """
    try:
        user_id = get_request_context().get_user_id()
        return {
            "user_id": user_id,
            "authenticated": True,
        }
    except ValueError as e:
        return {
            "error": str(e),
            "authenticated": False,
        }


# Server info endpoint
@mcp.tool()
async def server_info() -> dict:
    """Get MCP server information

    Returns:
        Server metadata
    """
    return {
        "name": config.MCP_SERVER_NAME,
        "version": config.MCP_SERVER_VERSION,
        "environment": config.ENVIRONMENT,
    }


def get_mcp_server() -> FastMCP:
    """Get the MCP server instance

    Returns:
        FastMCP server instance
    """
    return mcp


# TODO: Import and register Todo CRUD tools from task_tools.py
# This will be done in T020-T052
