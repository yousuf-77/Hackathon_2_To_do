import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'Ix8VG1V8AcbECliujtd2snDxAmMvVxX5'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('simple_auth_token')?.value;

    if (!token) {
      return NextResponse.json({
        data: null,
        error: { message: 'No session' },
      });
    }

    // Verify token
    const { payload } = await jwtVerify(token, SECRET);

    return NextResponse.json({
      data: {
        user: {
          id: payload.sub as string,
          email: payload.email as string,
          name: payload.name as string,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({
      data: null,
      error: { message: 'Invalid session' },
    });
  }
}
