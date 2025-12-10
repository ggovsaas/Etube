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

    // Fetch all statistics
    const [
      totalUsers,
      totalProfiles,
      totalListings,
      activeListings,
      pendingListings,
      totalMedia,
      totalReviews,
      usersByRole,
      listingsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'APPROVED' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.media.count(),
      prisma.review.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      }),
      prisma.listing.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ]);

    // Transform groupBy results
    const usersByRoleMap: Record<string, number> = {};
    usersByRole.forEach((item) => {
      usersByRoleMap[item.role] = item._count.role;
    });

    const listingsByStatusMap: Record<string, number> = {};
    listingsByStatus.forEach((item) => {
      listingsByStatusMap[item.status] = item._count.status;
    });

    return NextResponse.json({
      totalUsers,
      totalProfiles,
      totalListings,
      activeListings,
      pendingListings,
      totalMedia,
      totalReviews,
      usersByRole: usersByRoleMap,
      listingsByStatus: listingsByStatusMap,
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


