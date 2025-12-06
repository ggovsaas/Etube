import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('=== API: Fetching listing with ID ===', id);
    console.log('ID type:', typeof id, 'ID length:', id?.length);
    
    if (!id || id.trim() === '') {
      console.error('Invalid ID provided:', id);
      return NextResponse.json(
        { error: 'Invalid listing ID' },
        { status: 400 }
      );
    }
    
    const listing = await prisma.listing.findUnique({
      where: { id: id.trim() },
      include: {
        user: {
          include: {
            profile: {
              include: {
                media: {
                  orderBy: {
                    createdAt: 'desc'
                  }
                }
              }
            }
          }
        },
        media: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        images: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!listing) {
      console.error('=== API: Listing not found for ID ===', id);
      // Try to find any listing to see if the issue is with the ID format
      const allListings = await prisma.listing.findMany({
        take: 5,
        select: { id: true, title: true }
      });
      console.log('Sample listing IDs in database:', allListings.map(l => l.id));
      return NextResponse.json(
        { error: 'Listing not found', id: id },
        { status: 404 }
      );
    }

    console.log('=== API: Listing found ===', listing.id, listing.title);
    console.log('Listing has user:', !!listing.user);
    console.log('Listing has profile:', !!listing.user?.profile);
    console.log('Listing media count:', listing.media?.length || 0);
    console.log('Listing images count:', listing.images?.length || 0);
    
    // Include userId in response for wishlist/stories features
    const response = {
      ...listing,
      userId: listing.userId
    };
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const { verify } = await import('jsonwebtoken');
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user owns this listing
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingListing || existingListing.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not authorized to edit this listing' },
        { status: 403 }
      );
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        city: body.city,
        age: body.age,
        phone: body.phone,
        services: body.services,
        status: body.status,
        isPremium: body.isPremium,
        price: body.price,
      }
    });

    return NextResponse.json(updatedListing);

  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const { verify } = await import('jsonwebtoken');
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const { isAdmin } = await import('@/lib/adminCheck');
    const userIsAdmin = isAdmin(decoded);

    // User must own the listing OR be an admin
    if (!userIsAdmin && listing.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this listing' },
        { status: 403 }
      );
    }

    // Delete the listing (cascade will handle related records)
    await prisma.listing.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Listing deleted successfully' });

  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 