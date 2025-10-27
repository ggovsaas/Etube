import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/profiles - Get all profiles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where = {
      ...(city && { city }),
      ...(category && { category }),
      ...(minPrice && maxPrice && {
        price: {
          gte: parseInt(minPrice),
          lte: parseInt(maxPrice),
        },
      }),
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
          media: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    // Transform profiles to match expected structure
    const transformedProfiles = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      city: profile.city,
      height: profile.height,
      weight: profile.weight,
      price: 0, // Profile model doesn't have price, use 0 as default
      pricePerHour: 0, // Profile model doesn't have price, use 0 as default
      rating: profile.rating,
      reviews: profile._count?.reviews || 0,
      isOnline: profile.isOnline,
      isVerified: profile.isVerified,
      imageUrl: profile.media?.[0]?.url || '/placeholder-profile.jpg',
      description: profile.description,
      createdAt: profile.createdAt
    }));

    return NextResponse.json({
      profiles: transformedProfiles,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: Request) {
  try {
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
      media,
    } = body;

    const profile = await prisma.profile.create({
      data: {
        userId: body.userId, // Add required userId
        name,
        age,
        city,
        height,
        weight,
        description,
        isVerified,
        isOnline,
        media: {
          create: media?.map((item: { url: string; type: string }) => ({
            url: item.url,
            type: item.type,
          })) || [],
        },
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 