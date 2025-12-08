import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(
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

    // Get contest
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        entries: true,
        _count: {
          select: {
            entries: true
          }
        }
      }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    // Verify user is the creator
    if (contest.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only the contest creator can resolve it' },
        { status: 403 }
      );
    }

    if (contest.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Contest is already resolved or closed' },
        { status: 400 }
      );
    }

    if (contest._count.entries === 0) {
      return NextResponse.json(
        { error: 'Cannot resolve contest with no entries' },
        { status: 400 }
      );
    }

    // Randomly select a winner
    const entries = contest.entries;
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winnerEntry = entries[randomIndex];

    // Update contest and winner entry
    const resolvedContest = await prisma.$transaction(async (tx) => {
      // Mark winner
      await tx.contestEntry.update({
        where: { id: winnerEntry.id },
        data: { isWinner: true }
      });

      // Update contest status
      const updated = await tx.contest.update({
        where: { id: contestId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          winnerId: winnerEntry.id
        },
        include: {
          entries: {
            where: { isWinner: true },
            include: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      });

      return updated;
    });

    return NextResponse.json({ 
      contest: resolvedContest,
      winner: resolvedContest.entries[0]?.participant
    });
  } catch (error: any) {
    console.error('Error resolving contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

