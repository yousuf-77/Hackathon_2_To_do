import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";

/**
 * Better Auth email sign-in endpoint
 * Authenticates users using Better Auth with email/password
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sign in with Better Auth
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      // Don't set cookies - let the client handle session
      headers: request.headers,
    });

    // Return the result with user data
    return NextResponse.json(result);
  } catch (error) {
    console.error("=== Sign in error ===", error);

    // Better Auth errors
    if (error && typeof error === "object" && "message" in error) {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Sign in failed" },
      { status: 500 }
    );
  }
}
