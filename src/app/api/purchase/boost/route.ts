import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Purchase Visibility Boost
 * 
 * Provider uses credits to purchase visibility boosts
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
    const {
      boostType,
      listingId,
      blogPostId,
      category,
      priceCredits,
      durationDays,
    } = body;

    if (!boostType || !priceCredits || !durationDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check credit balance
    if (user.credits < priceCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Verify ownership if listingId or blogPostId provided
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing || listing.userId !== user.id) {
        return NextResponse.json(
          { error: 'Listing not found or unauthorized' },
          { status: 403 }
        );
      }
    }

    if (blogPostId) {
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: blogPostId },
      });

      if (!blogPost || blogPost.authorId !== user.id) {
        return NextResponse.json(
          { error: 'Blog post not found or unauthorized' },
          { status: 403 }
        );
      }
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Atomic transaction: deduct credits and create boost
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: priceCredits,
          },
        },
      });

      // Create boost
      const boost = await tx.listingBoost.create({
        data: {
          type: boostType,
          listingId: listingId || null,
          userId: listingId ? null : user.id, // User-level boost if no listing
          blogPostId: blogPostId || null,
          priceCredits,
          startDate: new Date(),
          endDate,
          isActive: true,
          category: category || null,
        },
      });

      return {
        boost,
        remainingCredits: updatedUser.credits,
      };
    });

    return NextResponse.json({
      success: true,
      boost: result.boost,
      remainingCredits: result.remainingCredits,
    });
  } catch (error) {
    console.error('Error purchasing boost:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

