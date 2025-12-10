import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/verification-failed?error=missing-token', request.url)
      );
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/verification-failed?error=invalid-token', request.url)
      );
    }

    // If user is already verified, just redirect to success
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL('/auth/verification-success?already-verified=true', request.url)
      );
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, // Clear the token after verification
        verificationExpiry: null,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verification-success', request.url)
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(
      new URL('/auth/verification-failed?error=server-error', request.url)
    );
  }
}










