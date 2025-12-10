import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    const media = await prisma.media.findMany({
      include: {
        profile: {
          select: {
            id: true,
            name: true,
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1000 // Limit to prevent performance issues
    });

    return NextResponse.json(media);

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



