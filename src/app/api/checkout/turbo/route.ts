import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Only initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

const TURBO_PRICES = {
  'turbo_1_day': 'price_turbo_1_day', // You'll need to create these in Stripe
  'turbo_3_days': 'price_turbo_3_days',
  'turbo_7_days': 'price_turbo_7_days',
  'superturbo_1_day': 'price_superturbo_1_day',
  'superturbo_3_days': 'price_superturbo_3_days',
  'superturbo_7_days': 'price_superturbo_7_days',
};

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Payment system not configured. Please contact support.' 
      }, { status: 503 });
    }

    const { type, email } = await req.json();
    
    if (!type || !email) {
      return NextResponse.json({ error: 'Missing type or email' }, { status: 400 });
    }

    const priceId = TURBO_PRICES[type as keyof typeof TURBO_PRICES];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid turbo type' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal', 'sofort'], // Multiple payment options
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/precos?success=turbo`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/precos?canceled=turbo`,
      metadata: {
        type,
        turbo_type: type.startsWith('super') ? 'super_turbo' : 'turbo',
      },
      // Billing address collection
      billing_address_collection: 'required',
      // Automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
      // Customer creation for better tracking
      customer_creation: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe TURBO checkout error:', error);
    return NextResponse.json({ error: 'Stripe checkout failed' }, { status: 500 });
  }
} 