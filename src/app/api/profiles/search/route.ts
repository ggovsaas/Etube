import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const phone = searchParams.get('phone');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const isVerified = searchParams.get('isVerified');
    const isOnline = searchParams.get('isOnline');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Prisma.ProfileWhereInput = {
      ...(query && {
        OR: [
          { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
      ...(phone && { phoneNumber: phone }),
      ...(city && { city }),
      ...(minPrice && maxPrice && {
        price: {
          gte: parseInt(minPrice),
          lte: parseInt(maxPrice),
        },
      }),
      ...(minAge && maxAge && {
        age: {
          gte: parseInt(minAge),
          lte: parseInt(maxAge),
        },
      }),
      ...(isVerified && { isVerified: isVerified === 'true' }),
      ...(isOnline && { isOnline: isOnline === 'true' }),
    };

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { isOnline: 'desc' },
          { isVerified: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            include: {
              listings: {
                where: { status: 'ACTIVE' },
                take: 1,
                orderBy: {
                  createdAt: 'desc'
                }
              }
            }
          },
          media: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              reviews: true,
              questions: true,
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    // Transform profiles to include listingId
    const transformedProfiles = profiles.map(profile => ({
      ...profile,
      listingId: profile.user?.listings?.[0]?.id || null
    }));

    return NextResponse.json({
      profiles: transformedProfiles,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error searching profiles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 