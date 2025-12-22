import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession, getAdminPermissions } from '@/lib/adminCheck';

export async function GET(request: NextRequest) {
  try {
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
        { error: 'Permission denied. Only Master Admins can manage roles.' },
        { status: 403 }
      );
    }

    const roles = await prisma.adminRole.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
        { error: 'Permission denied. Only Master Admins can create roles.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, canEditProfiles, canResolveContests, canAccessPayouts, canManageUsers, countryScope } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    const role = await prisma.adminRole.create({
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
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

