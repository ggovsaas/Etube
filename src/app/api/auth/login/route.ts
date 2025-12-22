import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user email is in admin list from environment variables
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsEnv
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
    
    const isEmailAdmin = adminEmails.includes(email.toLowerCase());

    // Find user by email
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    // If user doesn't exist but is admin email, create the user
    if (!user && isEmailAdmin) {
      const { hash } = await import('bcryptjs');
      const hashedPassword = await hash(password || 'admin123', 12);
      
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'ADMIN',
          name: email.split('@')[0]
        },
        include: { profile: true }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // For admin emails, allow login with any password (or no password check)
    let isValidPassword = true;
    if (isEmailAdmin) {
      // Admin bypass - accept any password
      isValidPassword = true;
    } else if (user.password) {
      // Regular users need correct password
      isValidPassword = await compare(password, user.password);
    } else {
      // User has no password set
      isValidPassword = false;
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set admin role if email is in admin list
    const finalRole = (user.role === 'ADMIN' || isEmailAdmin) ? 'ADMIN' : user.role;
    
    // Update user role in database if they're admin by email
    if (isEmailAdmin && user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
      });
    }

    // Create JWT token with long expiration (7 days)
    const token = sign(
      { 
        userId: user.id, 
        email: user.email.toLowerCase(), 
        role: finalRole 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set cookie with proper settings for persistence
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: finalRole,
        profile: user.profile
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/' // Ensure cookie is available site-wide
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 