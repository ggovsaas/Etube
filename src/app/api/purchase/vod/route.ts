import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Purchase VOD Video Unlock
 * 
 * Client uses credits to unlock a VOD video
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentItemId } = body;

    if (!contentItemId) {
      return NextResponse.json(
        { error: 'Content item ID required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get content item
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: { user: true },
    });

    if (!contentItem) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      );
    }

    // Check if already purchased or free
    if (!contentItem.isPremium || !contentItem.priceCredits) {
      return NextResponse.json(
        { error: 'Content is free or not premium' },
        { status: 400 }
      );
    }

    // Check if user owns the content
    if (contentItem.userId === user.id) {
      return NextResponse.json(
        { error: 'You own this content' },
        { status: 400 }
      );
    }

    // Check credit balance
    if (user.credits < contentItem.priceCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Atomic transaction: deduct credits and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credits from client
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: contentItem.priceCredits,
          },
        },
      });

      // Calculate platform fee (e.g., 20%)
      const platformFeePercent = 0.20;
      const amountCash = contentItem.priceCredits * 0.10; // 1 credit = $0.10
      const platformFee = amountCash * platformFeePercent;
      const providerAmount = amountCash - platformFee;

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: 'VOD_UNLOCK',
          amountCredits: contentItem.priceCredits,
          amountCash: providerAmount,
          platformFee,
          providerId: contentItem.userId,
          clientId: user.id,
          listingId: null,
        },
      });

      // Increment views
      await tx.contentItem.update({
        where: { id: contentItemId },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });

      return {
        transaction,
        remainingCredits: updatedUser.credits,
      };
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      remainingCredits: result.remainingCredits,
    });
  } catch (error) {
    console.error('Error purchasing VOD:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

