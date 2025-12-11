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

    const body = await request.json();
    const { rejectionReason } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { id },
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

    // Unlink transactions from this payout request (make them available again)
    await prisma.transaction.updateMany({
      where: {
        payoutRequestId: id,
      },
      data: {
        payoutRequestId: null,
      },
    });

    // Update payout request status
    await prisma.payoutRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedBy: session.user?.id || '',
        rejectionReason,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payout request rejected',
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


