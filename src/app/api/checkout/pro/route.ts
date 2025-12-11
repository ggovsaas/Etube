import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { paymentProcessor } from '@/lib/services/paymentProcessor';
import { prisma } from '@/lib/prisma';

// Pro Subscription Plans Configuration
const PRO_PLANS = {
  'pro_1_month': {
    name: 'Pro 1 Month',
    priceUSD: 9.90,
    durationMonths: 1,
  },
  'pro_3_months': {
    name: 'Pro 3 Months',
    priceUSD: 24.00, // 33% discount
    durationMonths: 3,
  },
  'pro_6_months': {
    name: 'Pro 6 Months',
    priceUSD: 36.00, // 50% discount
    durationMonths: 6,
  },
};

export async function POST(req: Request) {
  try {
    const { plan, email, useStoredToken } = await req.json();
    
    if (!plan) {
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }

    const planConfig = PRO_PLANS[plan as keyof typeof PRO_PLANS];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
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
            email: true,
            paymentToken: true,
            paymentTokenProvider: true,
            paymentTokenExpiresAt: true,
          },
        });

        // Check if user has a valid stored token
        if (user?.paymentToken && useStoredToken !== false) {
          const isExpired = user.paymentTokenExpiresAt 
            ? new Date(user.paymentTokenExpiresAt) < new Date()
            : false;
          
          hasStoredToken = !isExpired;
        }
      }
    } catch (error) {
      // Continue without user session (guest checkout)
      console.warn('Could not get user session:', error);
    }

    const customerEmail = email || user?.email || '';
    if (!customerEmail) {
      return NextResponse.json({ error: 'Email required for checkout' }, { status: 400 });
    }

    // Use payment processor service
    const result = await paymentProcessor.createSubscription({
      planId: plan,
      customerEmail,
      customerId: user?.id,
      metadata: {
        plan,
        type: 'pro_subscription',
        duration_months: planConfig.durationMonths.toString(),
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
      subscriptionId: result.subscriptionId,
      requiresRedirect: true,
    });
  } catch (error) {
    console.error('Pro subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
