import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/adminCheck';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    const { isAdmin, error } = verifyAdmin(token);

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    // Update listing status to ACTIVE
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'ACTIVE'
      }
    });

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