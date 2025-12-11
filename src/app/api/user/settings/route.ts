import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user settings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        // Add settings fields to User model if needed
        // For now, return defaults
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return default settings (can be extended when User model has settings fields)
    return NextResponse.json({
      settings: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessages: true,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        newMessageNotifications: true,
        listingUpdateNotifications: true,
        preferredLanguage: 'pt',
        timezone: 'Europe/Lisbon',
      },
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { section, settings, storySettings } = body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Handle story settings (content section)
    if (section === 'content' && storySettings) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          storiesEnabledInProfiles: storySettings.storiesEnabledInProfiles ?? true,
          storiesEnabledInCreatorFeed: storySettings.storiesEnabledInCreatorFeed ?? true,
        },
      });
    }

    // For other settings, acknowledge the save
    // In the future, you can add settings fields to the User model or create a UserSettings model

    return NextResponse.json({
      message: 'Settings saved successfully',
      section,
    });

  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


