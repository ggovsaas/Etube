import { NextRequest, NextResponse } from 'next/server';
import { getCreatorContests } from '@/lib/data/contests';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { creatorId } = await params;

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    const contests = await getCreatorContests(creatorId);

    return NextResponse.json({ contests });
  } catch (error: any) {
    console.error('Error fetching creator contests:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

