import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

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

    // Update user role to ADMIN
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} is now admin`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

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