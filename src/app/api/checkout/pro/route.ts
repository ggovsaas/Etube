import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Only initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

const PRO_PRICES = {
  'pro_1_month': 'price_pro_1_month', // You'll need to create these in Stripe
  'pro_3_months': 'price_pro_3_months',
  'pro_6_months': 'price_pro_6_months',
};

export async function POST(req: Request) {
  try {
    const { plan, email } = await req.json();
    
    if (!plan || !email) {
      return NextResponse.json({ error: 'Missing plan or email' }, { status: 400 });
    }

    const priceId = PRO_PRICES[plan as keyof typeof PRO_PRICES];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal', 'sofort'], // Stripe, iDEAL (Netherlands), SOFORT (Germany/Austria)
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/precos?success=pro`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/precos?canceled=pro`,
      metadata: {
        plan,
        type: 'pro_subscription',
      },
      // Billing address collection for Portuguese users
      billing_address_collection: 'required',
      // Automatic tax calculation for Portugal
      automatic_tax: {
        enabled: true,
      },
      // Customer creation for better tracking
      customer_creation: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe PRO checkout error:', error);
    return NextResponse.json({ error: 'Stripe checkout failed' }, { status: 500 });
  }
} 