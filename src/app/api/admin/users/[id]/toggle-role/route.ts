import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { roleFlag, value } = body; // roleFlag: 'isClient' | 'isContentCreator' | 'isServiceProvider'

    if (!roleFlag || !['isClient', 'isContentCreator', 'isServiceProvider'].includes(roleFlag)) {
      return NextResponse.json(
        { error: 'Invalid role flag' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the role flag
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        [roleFlag]: value === true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Role flag ${roleFlag} ${value ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isClient: updatedUser.isClient,
        isContentCreator: updatedUser.isContentCreator,
        isServiceProvider: updatedUser.isServiceProvider,
      },
    });
  } catch (error) {
    console.error('Error toggling role flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

