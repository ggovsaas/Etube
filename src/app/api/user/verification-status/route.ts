import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        verificationRequests: {
          where: {
            status: 'APPROVED',
          },
          orderBy: {
            reviewedAt: 'desc',
          },
          take: 1,
        },
        profile: {
          select: {
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // User is verified if they have an approved verification request OR their profile is verified
    const isVerified = 
      (user.verificationRequests.length > 0 && user.verificationRequests[0].status === 'APPROVED') ||
      (user.profile?.isVerified === true);

    return NextResponse.json({
      isVerified,
      verificationRequest: user.verificationRequests[0] || null,
      profileVerified: user.profile?.isVerified || false,
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

