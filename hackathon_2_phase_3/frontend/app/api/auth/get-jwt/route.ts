import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'Ix8VG1V8AcbECliujtd2snDxAmMvVxX5'
);

export async function GET(request: NextRequest) {
  try {
    // First, try to get session from Better Auth
    const sessionResult = await authClient.getSession();

    if (sessionResult?.data?.user) {
      // Extract userId from email (for backend compatibility)
      const userId = sessionResult.data.user.email;
      const jwtToken = sessionResult.data.user.id; // Better Auth's internal ID

      return NextResponse.json({
        token: jwtToken,
        userId: userId,
      });
    }

    // Fall back to simple-auth token from cookie
    const cookie = request.cookies.get('simple_auth_token')?.value;
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    const { payload } = await jwtVerify(cookie, SECRET);

    return NextResponse.json({
      token: cookie,
      userId: payload.email as string,
    });
  } catch (error) {
    console.error("=== JWT Token Error ===", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
