import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST() {
  // Note: Auth.js handles session cleanup automatically
  // This endpoint is kept for backward compatibility
  // For Auth.js, use signOut() from next-auth/react on the client side
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear any legacy auth cookies
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Clear NextAuth session cookie
  response.cookies.set('next-auth.session-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('__Secure-next-auth.session-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
} 