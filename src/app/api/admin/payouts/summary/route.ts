import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    // Calculate pending payouts
    const pendingPayouts = await prisma.payoutRequest.aggregate({
      where: { status: 'REQUESTED' },
      _sum: { amount: true },
    });

    // Calculate processing payouts
    const processingPayouts = await prisma.payoutRequest.aggregate({
      where: { status: 'PROCESSING' },
      _sum: { amount: true },
    });

    // Calculate completed payouts
    const completedPayouts = await prisma.payoutRequest.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    // Calculate total platform fees (from all transactions)
    const allTransactions = await prisma.transaction.findMany({
      select: { platformFee: true },
    });
    const totalPlatformFees = allTransactions.reduce(
      (sum, t) => sum + t.platformFee,
      0
    );

    return NextResponse.json({
      totalPending: pendingPayouts._sum.amount || 0,
      totalProcessing: processingPayouts._sum.amount || 0,
      totalCompleted: completedPayouts._sum.amount || 0,
      totalPlatformFees,
    });
  } catch (error) {
    console.error('Error fetching payout summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

