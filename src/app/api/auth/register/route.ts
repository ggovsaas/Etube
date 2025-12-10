import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

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

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token (for future email verification feature)
    // Note: User model doesn't have verification fields yet, so we'll just log it
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name: username,
          password: hashedPassword,
          role: accountType === 'escort' ? 'ESCORT' : accountType === 'cam_creator' ? 'CAM_CREATOR' : 'USER',
          emailVerified: null, // DateTime? expects null, not false
          verificationToken,
          verificationExpiry,
        },
      });

      // If escort, create basic profile (but don't show it until listing is approved)
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

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, username);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
      // User can request a new verification email later
    }

    // Return success - user will need to login manually
    // This prevents the "Access Denied" error from old JWT system
    return NextResponse.json(
      {
        message: 'Account created successfully. You can now login with your credentials.',
        userId: result.user.id,
        success: true,
        emailVerified: false
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for unique constraint violations
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('email')) {
          return NextResponse.json(
            { error: 'Email already registered' },
            { status: 400 }
          );
        }
        if (error.message.includes('name')) {
          return NextResponse.json(
            { error: 'Username already taken' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
} 