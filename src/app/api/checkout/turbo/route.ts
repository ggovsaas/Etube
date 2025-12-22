import { NextResponse } from 'next/server';
import { paymentProcessor } from '@/lib/services/paymentProcessor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// Boost Pricing Configuration (in USD - will be converted to credits)
const BOOST_PRICES = {
  'turbo_1_day': { name: 'Turbo 1 Day', priceUSD: 5.00, durationDays: 1 },
  'turbo_3_days': { name: 'Turbo 3 Days', priceUSD: 12.00, durationDays: 3 },
  'turbo_7_days': { name: 'Turbo 7 Days', priceUSD: 25.00, durationDays: 7 },
  'superturbo_1_day': { name: 'SuperTurbo 1 Day', priceUSD: 10.00, durationDays: 1 },
  'superturbo_3_days': { name: 'SuperTurbo 3 Days', priceUSD: 24.00, durationDays: 3 },
  'superturbo_7_days': { name: 'SuperTurbo 7 Days', priceUSD: 50.00, durationDays: 7 },
};

export async function POST(req: Request) {
  try {
    // Check if payment processor is configured
    if (!process.env.PAYMENT_PROCESSOR_API_KEY) {
      return NextResponse.json({ 
        error: 'Payment system not configured. Please contact support.' 
      }, { status: 503 });
    }

    const { type, email, listingId } = await req.json();
    
    if (!type || !email) {
      return NextResponse.json({ error: 'Missing type or email' }, { status: 400 });
    }

    const boostConfig = BOOST_PRICES[type as keyof typeof BOOST_PRICES];
    if (!boostConfig) {
      return NextResponse.json({ error: 'Invalid turbo type' }, { status: 400 });
    }

    // Verify user owns the listing if listingId is provided
    if (listingId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing || listing.userId !== user.id) {
        return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 403 });
      }
    }

    // Use payment processor service instead of direct Stripe calls
    const result = await paymentProcessor.createOneTimeCharge({
      amount: boostConfig.priceUSD,
      currency: 'USD',
      customerEmail: email,
      description: `${boostConfig.name} Boost`,
      metadata: {
        type,
        boost_type: type.includes('superturbo') ? 'SUPERTURBO' : 'TURBO',
        duration_days: boostConfig.durationDays.toString(),
        listing_id: listingId || '',
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
    });
  } catch (error) {
    console.error('Turbo boost checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
