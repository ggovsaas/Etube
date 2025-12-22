import { NextRequest, NextResponse } from 'next/server';
import { getCreatorWishlist } from '@/lib/data/wishlists';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const items = await getCreatorWishlist(userId);

    // Optionally fetch creator name for display
    let creatorName: string | null = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });
      creatorName = user?.name || null;
    } catch (error) {
      // Ignore error, name is optional
    }

    return NextResponse.json({ 
      items,
      creatorName 
    });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    
    // If table doesn't exist yet, return empty array instead of error
    if (error?.code === 'P2021' || error?.message?.includes('does not exist') || error?.message?.includes('WishlistItem')) {
      console.warn('WishlistItem table does not exist yet. Run migration: npx prisma db push');
      return NextResponse.json({ items: [], creatorName: null }, { status: 200 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error', items: [], creatorName: null },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this wishlist item
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      select: { userId: true }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

