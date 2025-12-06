import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process contest entries
    if (session.metadata?.type === 'contest_entry' && session.metadata?.contestId && session.metadata?.participantId) {
      try {
        const contestId = session.metadata.contestId;
        const participantId = session.metadata.participantId;
        const amountPaid = (session.amount_total || 0) / 100; // Convert from cents

        // Check if entry already exists (idempotency)
        const existingEntry = await prisma.contestEntry.findUnique({
          where: {
            contestId_participantId: {
              contestId,
              participantId
            }
          }
        });

        if (existingEntry) {
          console.log('Entry already exists, skipping');
          return NextResponse.json({ received: true });
        }

        // Verify contest exists and is open
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

        if (!contest || contest.status !== 'OPEN') {
          console.error('Contest not found or not open');
          return NextResponse.json({ received: true });
        }

        // Check if slots are full
        if (contest._count.entries >= contest.totalSlots) {
          console.error('Contest slots are full');
          return NextResponse.json({ received: true });
        }

        // Create contest entry
        await prisma.contestEntry.create({
          data: {
            contestId,
            participantId,
            entryFeePaid: amountPaid,
            stripeSessionId: session.id
          }
        });

        console.log(`Contest entry created: ${contestId} for user ${participantId}`);
      } catch (error: any) {
        console.error('Error processing contest entry:', error);
        // Don't return error to Stripe, just log it
      }
    }
  }

  return NextResponse.json({ received: true });
}

