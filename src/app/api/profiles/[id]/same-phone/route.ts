import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First get the current profile to get its phone number
    const currentProfile = await prisma.profile.findUnique({
      where: { id: params.id },
      select: { phoneNumber: true }
    });

    if (!currentProfile?.phoneNumber) {
      return NextResponse.json({ profiles: [] });
    }

    // Find all profiles with the same phone number, excluding the current profile
    // CRITICAL FIX: Only show profiles with at least one ACTIVE listing
    const profiles = await prisma.profile.findMany({
      where: {
        phoneNumber: currentProfile.phoneNumber,
        id: { not: params.id },
        user: {
          listings: {
            some: {
              status: 'ACTIVE',
              isPaused: false
            }
          }
        }
      },
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
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Error fetching profiles with same phone:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 