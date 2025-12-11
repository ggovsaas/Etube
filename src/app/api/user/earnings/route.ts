import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
        payoutRequests: {
          where: {
            status: 'COMPLETED',
          },
          orderBy: {
            processedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate current balance (unpaid transactions)
    const currentBalance = user.providerTransactions.reduce(
      (sum, t) => sum + t.amountCash,
      0
    );

    // Calculate total lifetime earnings (all transactions)
    const allTransactions = await prisma.transaction.findMany({
      where: { providerId: user.id },
    });
    const totalLifetimeEarnings = allTransactions.reduce(
      (sum, t) => sum + t.amountCash,
      0
    );

    // Calculate pending payouts
    const pendingPayouts = await prisma.payoutRequest.aggregate({
      where: {
        providerId: user.id,
        status: {
          in: ['REQUESTED', 'PROCESSING'],
        },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      currentBalance,
      lastPayoutDate: user.payoutRequests[0]?.processedAt || null,
      totalLifetimeEarnings,
      pendingPayouts: pendingPayouts._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

