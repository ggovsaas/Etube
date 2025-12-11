import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { paymentProcessor } from '@/lib/services/paymentProcessor';

// Credit Package Configuration
const CREDIT_PACKAGES = {
  'credits_starter': { credits: 250, priceUSD: 25.00 },
  'credits_standard': { credits: 550, priceUSD: 50.00 },
  'credits_pro': { credits: 1200, priceUSD: 100.00 },
  'credits_vip': { credits: 3250, priceUSD: 250.00 },
};

/**
 * One-Click Credit Purchase
 * 
 * Uses stored payment token to purchase credits without redirecting to payment form
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { package: creditPackage } = body;

    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Credit package required' },
        { status: 400 }
      );
    }

    const packageConfig = CREDIT_PACKAGES[creditPackage as keyof typeof CREDIT_PACKAGES];
    if (!packageConfig) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      );
    }

    // Get user with payment token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a valid stored payment token
    if (!user.paymentToken) {
      return NextResponse.json(
        { 
          error: 'No stored payment method',
          requiresCheckout: true, // Indicates user needs to go through checkout flow
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.paymentTokenExpiresAt && new Date(user.paymentTokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { 
          error: 'Stored payment method expired',
          requiresCheckout: true,
        },
        { status: 400 }
      );
    }

    // Charge using stored payment token
    const chargeResult = await paymentProcessor.chargeWithToken({
      token: user.paymentToken,
      amount: packageConfig.priceUSD,
      currency: 'USD',
      description: `Credit Package: ${creditPackage} (${packageConfig.credits} credits)`,
      metadata: {
        package: creditPackage,
        type: 'credits_purchase',
        credits: packageConfig.credits.toString(),
        userId: user.id,
      },
    });

    if (!chargeResult.success) {
      return NextResponse.json(
        { error: 'Payment failed. Please try again or use a different payment method.' },
        { status: 400 }
      );
    }

    // Atomic transaction: Add credits and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      // Add credits to user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: packageConfig.credits,
          },
        },
      });

      // Create credit transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          type: 'PURCHASE',
          amount: packageConfig.credits,
          description: `Purchased ${packageConfig.credits} credits via one-click`,
          stripeId: chargeResult.paymentId, // Or payment processor transaction ID
        },
      });

      return {
        credits: updatedUser.credits,
      };
    });

    return NextResponse.json({
      success: true,
      credits: result.credits,
      creditsAdded: packageConfig.credits,
      message: 'Credits purchased successfully!',
    });
  } catch (error) {
    console.error('Error in one-click credit purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

