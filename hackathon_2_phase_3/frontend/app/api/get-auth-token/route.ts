import { NextResponse } from "next/server";

export async function GET() {
  // Simple auth endpoint for development
  // Returns a token and userId for demo purposes
  return NextResponse.json({
    token: "demo_token_for_development",
    userId: "demo2@hackathon.local",
  });
}
