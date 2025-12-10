import { NextRequest, NextResponse } from 'next/server';
import { getAdminPermissions } from '@/lib/adminCheck';

export async function GET(request: NextRequest) {
  try {
    const permissions = await getAdminPermissions();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


