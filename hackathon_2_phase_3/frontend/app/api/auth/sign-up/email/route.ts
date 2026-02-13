import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";

/**
 * Better Auth email sign-up endpoint
 * Registers new users using Better Auth
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Sign up with Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      // Don't set cookies - let the client handle session
      headers: request.headers,
    });

    // Return the result with user data
    return NextResponse.json(result);
  } catch (error) {
    console.error("=== Sign up error ===", error);

    // Better Auth errors
    if (error && typeof error === "object" && "message" in error) {
      return NextResponse.json(
        { error: (error as any).message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Sign up failed" },
      { status: 500 }
    );
  }
}
