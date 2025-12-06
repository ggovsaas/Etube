import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, prizeDescription, totalSlots, slotPrice, threadId } = body;

    // Validate required fields
    if (!title || !prizeDescription || !totalSlots || !slotPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: title, prizeDescription, totalSlots, slotPrice' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (totalSlots < 1 || totalSlots > 1000) {
      return NextResponse.json(
        { error: 'Total slots must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (slotPrice < 0.01 || slotPrice > 1000) {
      return NextResponse.json(
        { error: 'Slot price must be between €0.01 and €1000' },
        { status: 400 }
      );
    }

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        title: title.trim(),
        prizeDescription: prizeDescription.trim(),
        totalSlots: parseInt(totalSlots),
        slotPrice: parseFloat(slotPrice),
        creatorId: session.user.id,
        threadId: threadId || null,
        status: 'OPEN'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ contest }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

