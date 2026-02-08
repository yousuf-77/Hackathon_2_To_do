import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/simple-auth-store';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'Ix8VG1V8AcbECliujtd2snDxAmMvVxX5'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Create user
    const user = createUser(email, password, name);

    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(SECRET);

    // Set cookie
    const response = NextResponse.json({
      data: { user, token },
      error: null,
    });

    response.cookies.set('simple_auth_token', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
