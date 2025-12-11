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
    const { id } = await params;
    const { isAdmin, session, error } = await verifyAdminSession();

    if (!isAdmin || !session) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the verification request
    const verification = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification request not found' },
        { status: 404 }
      );
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const adminUserId = session.user?.id || '';

    // Update verification request
    const updatedVerification = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        rejectionReason: action === 'reject' ? (rejectionReason || 'No reason provided') : null,
      },
    });

    // If approved, mark profile as verified
    if (action === 'approve' && verification.profileId) {
      await prisma.profile.update({
        where: { id: verification.profileId },
        data: {
          isVerified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



