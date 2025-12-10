import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get token from cookies

    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    // Get listing with user info
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Update listing status to ACTIVE
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'ACTIVE'
      }
    });

    // Activate Service Provider role when first listing is approved
    if (!listing.user.isServiceProvider) {
      await prisma.user.update({
        where: { id: listing.userId },
        data: {
          isServiceProvider: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      listing: updatedListing
    });

  } catch (error) {
    console.error('Error approving listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 