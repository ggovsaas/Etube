import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, accountType, username } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findFirst({
      where: { name: username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: username,
          password: hashedPassword,
          role: accountType === 'escort' ? 'ESCORT' : 'USER',
        },
      });

      // If escort, create basic profile
      if (accountType === 'escort') {
        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            name: username,
            age: 0, // Will be updated later
            city: '', // Will be updated later
            description: '', // Will be updated later
          },
        });
        return { user, profile };
      }

      return { user };
    });

    // Create JWT token for automatic login
    const token = sign(
      { 
        userId: result.user.id, 
        email: result.user.email, 
        role: result.user.role 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create response with success message
    const response = NextResponse.json(
      { 
        message: 'Account created successfully',
        userId: result.user.id,
        role: result.user.role,
        success: true
      },
      { status: 201 }
    );

    // Set authentication cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 