import { NextRequest, NextResponse } from 'next/server';
import { getContestById } from '@/lib/data/contests';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const { contestId } = await params;

    if (!contestId) {
      return NextResponse.json(
        { error: 'Contest ID is required' },
        { status: 400 }
      );
    }

    const contest = await getContestById(contestId);

    if (!contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contest });
  } catch (error: any) {
    console.error('Error fetching contest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

