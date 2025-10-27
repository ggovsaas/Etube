import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        },
        media: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);

  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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