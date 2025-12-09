import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies

    const { isAdmin, decoded, error } = verifyAdmin(token);

    if (!isAdmin) {
      console.log('User is not admin:', decoded?.role, decoded?.email);
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    // Fetch all users with their profiles
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        listings: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            listings: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 