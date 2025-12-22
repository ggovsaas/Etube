import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, getAdminPermissions } from '@/lib/adminCheck';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAdmin, error } = await verifyAdminSession();
    const permissions = await getAdminPermissions();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    if (!permissions.canManageRoles) {
      return NextResponse.json(
        { error: 'Permission denied. Only Master Admins can edit roles.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, canEditProfiles, canResolveContests, canAccessPayouts, canManageUsers, countryScope } = body;

    const role = await prisma.adminRole.update({
      where: { id },
      data: {
        name,
        canEditProfiles: canEditProfiles || false,
        canResolveContests: canResolveContests || false,
        canAccessPayouts: canAccessPayouts || false,
        canManageUsers: canManageUsers || false,
        countryScope: countryScope || null,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

