import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { paymentProcessor } from '@/lib/services/paymentProcessor';
import { prisma } from '@/lib/prisma';

// Credit Package Configuration
// Based on the pricing strategy: 1 Credit = $0.10 anchor price
const CREDIT_PACKAGES = {
  'credits_starter': {
    name: 'Starter',
    credits: 250,
    priceUSD: 25.00,
    costPerCredit: 0.10,
    discountPercent: 0,
  },
  'credits_standard': {
    name: 'Standard',
    credits: 550,
    priceUSD: 50.00,
    costPerCredit: 0.091,
    discountPercent: 8.8,
  },
  'credits_pro': {
    name: 'Pro Pack',
    credits: 1200,
    priceUSD: 100.00,
    costPerCredit: 0.083,
    discountPercent: 17,
  },
  'credits_vip': {
    name: 'VIP Bulk',
    credits: 3250,
    priceUSD: 250.00,
    costPerCredit: 0.077,
    discountPercent: 23,
  },
};

export async function POST(req: Request) {
  try {
    // Check if payment processor is configured
    if (!process.env.PAYMENT_PROCESSOR_API_KEY) {
      return NextResponse.json({ 
        error: 'Payment system not configured. Please contact support.' 
      }, { status: 503 });
    }

    const { package: creditPackage, email, useStoredToken } = await req.json();
    
    if (!creditPackage) {
      return NextResponse.json({ error: 'Missing package' }, { status: 400 });
    }

    const packageConfig = CREDIT_PACKAGES[creditPackage as keyof typeof CREDIT_PACKAGES];
    if (!packageConfig) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 });
    }

    // Get user session if available
    let user = null;
    let hasStoredToken = false;
    
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            paymentToken: true,
            paymentTokenProvider: true,
            paymentTokenExpiresAt: true,
          },
        });

        // Check if user has a valid stored token
        if (user?.paymentToken) {
          const isExpired = user.paymentTokenExpiresAt 
            ? new Date(user.paymentTokenExpiresAt) < new Date()
            : false;
          
          hasStoredToken = !isExpired && useStoredToken !== false;
        }
      }
    } catch (error) {
      // Continue without user session (guest checkout)
      console.warn('Could not get user session:', error);
    }

    // If user has stored token and wants to use it, attempt one-click purchase
    if (hasStoredToken && user?.paymentToken) {
      // TODO: Implement one-click purchase using stored token
      // This would call the payment processor's API with the stored token
      // For now, we'll fall through to the regular checkout flow
      // In production, you would:
      // 1. Call paymentProcessor.chargeWithToken(user.paymentToken, amount)
      // 2. If successful, add credits to user account
      // 3. Return success response without redirect
      
      // Placeholder: For now, we'll still redirect to checkout
      // but in production, implement the one-click flow here
    }

    // Regular checkout flow (first-time purchase or user chose to use new card)
    const customerEmail = email || user?.email || '';
    if (!customerEmail) {
      return NextResponse.json({ error: 'Email required for checkout' }, { status: 400 });
    }

    const result = await paymentProcessor.createOneTimeCharge({
      amount: packageConfig.priceUSD,
      currency: 'USD',
      customerEmail,
      customerId: user?.id,
      description: `${packageConfig.name} Credit Package (${packageConfig.credits} credits)`,
      metadata: {
        package: creditPackage,
        type: 'credits_purchase',
        credits: packageConfig.credits.toString(),
        cost_per_credit: packageConfig.costPerCredit.toString(),
        userId: user?.id || '',
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: result.checkoutUrl,
      paymentId: result.paymentId,
      requiresRedirect: true, // Indicates user needs to complete payment form
    });
  } catch (error) {
    console.error('Credits checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
