import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        providerTransactions: {
          where: {
            payoutRequestId: null, // Only unpaid transactions
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, payoutMethod, payoutDetails } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Calculate available balance
    const availableBalance = user.providerTransactions.reduce(
      (sum, t) => sum + t.amountCash,
      0
    );

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create payout request
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        providerId: user.id,
        amount,
        payoutMethod,
        payoutDetails: payoutDetails || '',
        status: 'REQUESTED',
      },
    });

    // Link transactions to this payout request (up to the requested amount)
    let remainingAmount = amount;
    const transactionsToLink = [];

    for (const transaction of user.providerTransactions) {
      if (remainingAmount <= 0) break;
      if (transaction.amountCash <= remainingAmount) {
        transactionsToLink.push(transaction.id);
        remainingAmount -= transaction.amountCash;
      }
    }

    // Update transactions
    await prisma.transaction.updateMany({
      where: {
        id: { in: transactionsToLink },
      },
      data: {
        payoutRequestId: payoutRequest.id,
      },
    });

    return NextResponse.json({
      success: true,
      payoutRequest,
    });
  } catch (error) {
    console.error('Error creating payout request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

