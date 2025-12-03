import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign, verify } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!existingUser) {
      // List all available users to help debug
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true },
        take: 10
      });
      
      return NextResponse.json(
        { 
          error: `User with email "${email}" not found. Available users: ${allUsers.map(u => u.email).join(', ')}` 
        },
        { status: 404 }
      );
    }

    // Find user by email and make them admin
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' }
    });

    // Generate new token with admin role
    const token = sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: 'ADMIN' 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: `User ${email} is now admin`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

    // Update the auth token cookie with new admin role
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/' // Ensure cookie is available site-wide
    });

    return response;

  } catch (error) {
    console.error('Error making user admin:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'User not found with that email' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to make user admin' },
      { status: 500 }
    );
  }
} 