import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        reviews: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true
          }
        },
        user: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      age,
      city,
      height,
      weight,
      description,
      isVerified,
      isOnline,
    } = body;

    const profile = await prisma.profile.update({
      where: { id },
      data: {
        name,
        age,
        city,
        height,
        weight,
        description,
        isVerified,
        isOnline,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin access
    const { verifyAdminSession } = await import('@/lib/adminCheck');
    const { isAdmin, error: authError } = await verifyAdminSession();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: authError || 'Admin access required' },
        { status: authError === 'Authentication required' ? 401 : 403 }
      );
    }

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Delete the profile (cascade will handle related records)
    await prisma.profile.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 