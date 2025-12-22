import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return new NextResponse('Missing user ID', { status: 400 });
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          profile: {
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
                  questions: true,
                },
              },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      favorites,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, profileId } = body;

    if (!userId || !profileId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        profileId,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Error creating favorite:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');

    if (!userId || !profileId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId,
        profileId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 