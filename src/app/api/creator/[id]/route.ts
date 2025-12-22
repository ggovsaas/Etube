import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Only return if user is a content creator
    if (!user.isContentCreator) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        id: user.profile.id,
        name: user.profile.name,
        bio: user.profile.bio || user.profile.description,
        profilePhoto: user.profile.profilePhoto,
        voiceNoteUrl: user.profile.voiceNoteUrl,
        isVerified: user.profile.isVerified,
        city: user.profile.city,
        age: user.profile.age,
        publicPhoneVisibility: user.profile.publicPhoneVisibility ?? false,
        whatsappVisibility: user.profile.whatsappVisibility ?? false,
        phone: user.profile.phone,
        whatsappEnabled: user.profile.whatsappEnabled,
        telegramEnabled: user.profile.telegramEnabled,
        instagram: user.profile.instagram,
        twitter: user.profile.twitter,
        tiktok: user.profile.tiktok,
        onlyfans: user.profile.onlyfans,
        media: user.profile.media,
        user: {
          id: user.id,
          isContentCreator: user.isContentCreator,
          isServiceProvider: user.isServiceProvider,
          isOnline: user.isOnline || false,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

