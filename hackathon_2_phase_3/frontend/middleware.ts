import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/signup", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // For dashboard and other protected routes, let the client handle auth
  // Don't block at middleware level - let NavbarClient handle it
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
