import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const { contestId } = await params;

    if (!contestId) {
      return NextResponse.json(
        { error: 'Contest ID is required' },
        { status: 400 }
      );
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        entries: {
          include: {
            participant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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

    return NextResponse.json({ contest });
  } catch (error: any) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { contestId } = await params;
    const body = await request.json();
    const { title, prizeDescription, totalSlots, slotPrice, threadId, status } = body;

    // Check if contest exists and user is creator
    const existingContest = await prisma.contest.findUnique({
      where: { id: contestId },
    });

    if (!existingContest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    if (existingContest.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own contests' },
        { status: 403 }
      );
    }

    // Don't allow editing if contest is resolved
    if (existingContest.status === 'RESOLVED') {
      return NextResponse.json(
        { error: 'Cannot edit resolved contests' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (prizeDescription) updateData.prizeDescription = prizeDescription.trim();
    if (totalSlots) updateData.totalSlots = parseInt(totalSlots);
    if (slotPrice) updateData.slotPrice = parseFloat(slotPrice);
    if (threadId !== undefined) updateData.threadId = threadId || null;
    if (status) updateData.status = status;

    const contest = await prisma.contest.update({
      where: { id: contestId },
      data: updateData,
    });

    return NextResponse.json({ contest });
  } catch (error: any) {
    console.error('Error updating contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { contestId } = await params;

    // Check if contest exists and user is creator
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
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

    if (contest.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own contests' },
        { status: 403 }
      );
    }

    // Don't allow deleting if there are entries
    if (contest._count.entries > 0) {
      return NextResponse.json(
        { error: 'Cannot delete contest with entries. Close it instead.' },
        { status: 400 }
      );
    }

    await prisma.contest.delete({
      where: { id: contestId },
    });

    return NextResponse.json({ message: 'Contest deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

