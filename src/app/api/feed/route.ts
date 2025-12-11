import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const type = searchParams.get('type'); // Optional: PHOTO_POST, VIDEO_POST, STORY

    const where: any = {
      isPublic: true,
    };

    if (type && ['PHOTO_POST', 'VIDEO_POST', 'STORY'].includes(type)) {
      where.type = type;
    }

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isOnline: true,
              profile: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                },
              },
            },
          },
        },
      }),
      prisma.contentItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

