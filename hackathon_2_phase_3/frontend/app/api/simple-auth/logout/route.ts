import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    data: { success: true },
    error: null,
  });

  // Clear the auth cookie
  response.cookies.delete('simple_auth_token');

  return response;
}
