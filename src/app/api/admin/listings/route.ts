import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        images: true,
        media: true,
      },
    });
    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        city: data.city,
        age: data.age,
        phone: data.phone,
        services: data.services,
        userId: data.userId,
        status: data.status || 'ACTIVE',
      },
    });
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
} 