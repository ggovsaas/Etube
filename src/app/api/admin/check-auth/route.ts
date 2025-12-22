import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        error: 'No auth token found'
      });
    }

    // Verify token
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: decoded?.userId,
        email: decoded?.email,
        role: decoded?.role
      },
      isAdmin: decoded?.role === 'ADMIN'
    });

  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Invalid token'
    });
  }
} 