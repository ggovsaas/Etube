import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/auth';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 503 }
      );
    }

    const { contestId } = await params;

    // Get contest
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        _count: {
          select: {
            entries: true
          }
        }
      }
    });

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    if (contest.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Contest is not open for entries' },
        { status: 400 }
      );
    }

    // Check if slots are full
    if (contest._count.entries >= contest.totalSlots) {
      return NextResponse.json(
        { error: 'All slots are sold out' },
        { status: 400 }
      );
    }

    // Check if user already entered
    const existingEntry = await prisma.contestEntry.findUnique({
      where: {
        contestId_participantId: {
          contestId: contest.id,
          participantId: session.user.id
        }
      }
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You have already entered this contest' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal', 'sofort'],
      mode: 'payment',
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Contest Entry: ${contest.title}`,
              description: `Entry slot for ${contest.prizeDescription}`,
            },
            unit_amount: Math.round(contest.slotPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contests/${contestId}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contests/${contestId}?canceled=1`,
      metadata: {
        contestId: contest.id,
        participantId: session.user.id,
        type: 'contest_entry',
      },
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: true,
      },
      customer_creation: 'always',
    });

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error: any) {
    console.error('Error entering contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

