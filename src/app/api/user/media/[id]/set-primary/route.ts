import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'User or profile not found' },
        { status: 404 }
      );
    }

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media || media.profileId !== user.profile.id) {
      return NextResponse.json(
        { error: 'Media not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update profile photo
    await prisma.profile.update({
      where: { id: user.profile.id },
      data: {
        profilePhoto: media.url,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting primary media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


