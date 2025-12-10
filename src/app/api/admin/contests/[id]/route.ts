import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function DELETE(
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

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    // Delete contest (entries will be cascade deleted)
    await prisma.contest.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


