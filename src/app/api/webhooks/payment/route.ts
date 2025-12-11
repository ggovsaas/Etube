import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/lib/services/paymentProcessor';
import { prisma } from '@/lib/prisma';

/**
 * Payment Processor Webhook Handler
 * 
 * Handles webhooks from the payment processor for:
 * - Payment success/failure
 * - Subscription created/updated/cancelled
 * - Payment token received (for storing)
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-payment-signature') || '';
    const rawBody = await request.text();

    // Verify webhook signature
    const isValid = await paymentProcessor.verifyWebhook(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type || payload.event_type;

    // Handle different webhook event types
    switch (eventType) {
      case 'payment.succeeded':
      case 'charge.succeeded': {
        await handlePaymentSuccess(payload);
        break;
      }

      case 'payment.failed':
      case 'charge.failed': {
        await handlePaymentFailure(payload);
        break;
      }

      case 'customer.created':
      case 'payment_method.saved': {
        await handlePaymentTokenReceived(payload);
        break;
      }

      case 'subscription.created':
      case 'subscription.updated': {
        await handleSubscriptionUpdate(payload);
        break;
      }

      case 'subscription.cancelled': {
        await handleSubscriptionCancelled(payload);
        break;
      }

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payload: any) {
  const { metadata, customer_id, payment_id, amount } = payload;

  if (!metadata || !metadata.type) {
    return;
  }

  const userId = metadata.userId;
  if (!userId) {
    return;
  }

  try {
    switch (metadata.type) {
      case 'credits_purchase': {
        const credits = parseInt(metadata.credits || '0');
        if (credits > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: {
                increment: credits,
              },
            },
          });

          // Create credit transaction record
          await prisma.creditTransaction.create({
            data: {
              userId,
              type: 'PURCHASE',
              amount: credits,
              description: `Purchased ${credits} credits`,
              stripeId: payment_id,
            },
          });
        }
        break;
      }

      case 'boost_purchase': {
        // Handle boost purchase
        // Create ListingBoost record
        break;
      }

      case 'pro_subscription': {
        // Handle subscription activation
        const plan = metadata.plan;
        const months = plan === 'pro_1_month' ? 1 : plan === 'pro_3_months' ? 3 : 6;
        const proUntil = new Date();
        proUntil.setMonth(proUntil.getMonth() + months);

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            proUntil,
          },
        });

        // Create or update subscription record
        await prisma.subscription.upsert({
          where: {
            userId: userId,
          },
          update: {
            type: plan.toUpperCase().replace('-', '_') as any,
            status: 'ACTIVE',
            currentPeriodEnd: proUntil,
          },
          create: {
            userId,
            type: plan.toUpperCase().replace('-', '_') as any,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: proUntil,
            stripeId: payment_id,
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(payload: any) {
  const { metadata, payment_id, error_message } = payload;
  console.error('Payment failed:', {
    paymentId: payment_id,
    userId: metadata?.userId,
    error: error_message,
  });
  // Log failure, notify user, etc.
}

async function handlePaymentTokenReceived(payload: any) {
  const { customer_id, customer_email, payment_method_id } = payload;

  if (!customer_email) {
    return;
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer_email },
    });

    if (user) {
      // Store payment token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          paymentToken: customer_id || payment_method_id,
          paymentTokenProvider: process.env.PAYMENT_PROCESSOR || 'unknown',
          // Set expiration if provided (some tokens expire)
          paymentTokenExpiresAt: payload.expires_at 
            ? new Date(payload.expires_at * 1000) 
            : null,
        },
      });
    }
  } catch (error) {
    console.error('Error storing payment token:', error);
  }
}

async function handleSubscriptionUpdate(payload: any) {
  const { customer_id, subscription_id, status, current_period_end } = payload;

  try {
    // Find user by payment token (customer_id)
    const user = await prisma.user.findFirst({
      where: {
        paymentToken: customer_id,
      },
    });

    if (user) {
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          stripeId: subscription_id,
        },
        data: {
          status: status === 'active' ? 'ACTIVE' : 'CANCELED',
          currentPeriodEnd: current_period_end 
            ? new Date(current_period_end * 1000) 
            : undefined,
        },
      });
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCancelled(payload: any) {
  const { customer_id, subscription_id } = payload;

  try {
    const user = await prisma.user.findFirst({
      where: {
        paymentToken: customer_id,
      },
    });

    if (user) {
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          stripeId: subscription_id,
        },
        data: {
          status: 'CANCELED',
          cancelAtPeriodEnd: true,
        },
      });

      // Optionally set proUntil to current period end
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          stripeId: subscription_id,
        },
      });

      if (subscription) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            proUntil: subscription.currentPeriodEnd,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}


