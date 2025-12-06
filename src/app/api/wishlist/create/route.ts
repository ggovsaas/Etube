import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, productName, productUrl, price } = body;

    // Validate required fields
    if (!userId || !productName || !productUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, productName, productUrl' },
        { status: 400 }
      );
    }

    // Verify user owns this wishlist (or is admin)
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: You can only add items to your own wishlist' },
        { status: 403 }
      );
    }

    // Create wishlist item
    const item = await prisma.wishlistItem.create({
      data: {
        userId,
        productName: productName.trim(),
        productUrl: productUrl.trim(),
        price: price ? parseFloat(price.toString()) : null,
        isFulfilled: false,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating wishlist item:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


