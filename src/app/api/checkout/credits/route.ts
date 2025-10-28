import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Only initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

const CREDIT_PRICES = {
  'credits_10': 'price_credits_10', // You'll need to create these in Stripe
  'credits_25': 'price_credits_25',
  'credits_50': 'price_credits_50',
};

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Payment system not configured. Please contact support.' 
      }, { status: 503 });
    }

    const { package: creditPackage, email } = await req.json();
    
    if (!creditPackage || !email) {
      return NextResponse.json({ error: 'Missing package or email' }, { status: 400 });
    }

    const priceId = CREDIT_PRICES[creditPackage as keyof typeof CREDIT_PRICES];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 });
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/precos?success=credits`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/precos?canceled=credits`,
      metadata: {
        package: creditPackage,
        type: 'credits_purchase',
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
    console.error('Stripe credits checkout error:', error);
    return NextResponse.json({ error: 'Stripe checkout failed' }, { status: 500 });
  }
} 