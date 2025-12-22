import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin, session, error } = await verifyAdminSession();
    const { id } = await params;

    if (!isAdmin || !session) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });

    if (!payoutRequest) {
      return NextResponse.json(
        { error: 'Payout request not found' },
        { status: 404 }
      );
    }

    if (payoutRequest.status !== 'REQUESTED') {
      return NextResponse.json(
        { error: 'Payout request is not in REQUESTED status' },
        { status: 400 }
      );
    }

    // Update payout request status
    await prisma.payoutRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        processedBy: session.user?.id || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payout approved and marked as completed',
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


