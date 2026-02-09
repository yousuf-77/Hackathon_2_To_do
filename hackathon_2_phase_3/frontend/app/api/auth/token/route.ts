import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";

const SECRET = process.env.BETTER_AUTH_SECRET || "Ix8VG1V8AcbECliujtd2snDxAmMvVxX5";

// Simple base64url encoding without padding
function base64urlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Create JWT using Web Crypto API or fallback
async function createJWT(payload: any): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (60 * 60 * 24 * 7); // 7 days

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload));

  const data = `${encodedHeader}.${encodedPayload}`;

  // Simple HMAC-SHA256 signing using crypto.subtle
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  const encodedSignature = base64urlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${data}.${encodedSignature}`;
}

export async function GET(request: NextRequest) {
  try {
    // Get the current Better Auth session using server-side API
    // Pass the request headers to access session cookies
    const sessionResult = await auth.api.getSession({
      headers: request.headers,
    });

    if (!sessionResult?.session || !sessionResult?.user) {
      console.log("=== No session found in request ===");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = sessionResult.user.id;
    const email = sessionResult.user.email;

    // Create JWT payload
    const payload = {
      sub: userId,                      // Subject (user_id) - required by backend
      iss: "hackathon-todo",            // Issuer - must match backend
      aud: "hackathon-todo-api",        // Audience - must match backend
      email: email,                     // Additional claim
    };

    const token = await createJWT(payload);

    console.log("=== Issued JWT for user:", userId, email);

    return NextResponse.json({ token, userId });
  } catch (error) {
    console.error("=== Error issuing JWT ===", error);
    return NextResponse.json({ error: "Failed to issue token" }, { status: 500 });
  }
}
