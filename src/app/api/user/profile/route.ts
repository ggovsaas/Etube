import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Fetching profile for email:', session.user.email);

    // Get user with profile and listings (including PENDING status)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        listings: {
          orderBy: { createdAt: 'desc' },
          // Include all listings regardless of status for user's own dashboard
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isClient: user.isClient ?? true,
        isContentCreator: user.isContentCreator ?? false,
        isServiceProvider: user.isServiceProvider ?? false,
        storiesEnabledInProfiles: user.storiesEnabledInProfiles ?? true,
        storiesEnabledInCreatorFeed: user.storiesEnabledInCreatorFeed ?? true,
        credits: user.credits ?? 0,
        isPro: user.isPro ?? false,
        proUntil: user.proUntil,
        paymentToken: user.paymentToken ? '***' : null, // Don't expose actual token, just indicate if exists
        nif: user.nif,
        address: user.address,
        phone: user.phone,
        city: user.city,
        postalCode: user.postalCode,
        country: user.country,
        profile: user.profile
      },
      listings: user.listings
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, nif, address, phone, city, postalCode, country } = body;

    console.log('Updating profile for email:', session.user.email);

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        nif,
        address,
        phone,
        city,
        postalCode,
        country,
      },
      include: {
        profile: true,
      }
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        nif: updatedUser.nif,
        address: updatedUser.address,
        phone: updatedUser.phone,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        country: updatedUser.country,
        profile: updatedUser.profile
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}