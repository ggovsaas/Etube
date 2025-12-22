import { NextRequest, NextResponse } from 'next/server';
import { getStoriesByListingContext } from '@/lib/data/stories';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const gender = searchParams.get('gender') || undefined;

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    const users = await getStoriesByListingContext({ city, gender });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Internal server error', users: [] },
      { status: 500 }
    );
  }
}

