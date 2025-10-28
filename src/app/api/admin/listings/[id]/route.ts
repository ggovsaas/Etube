import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        city: data.city,
        age: data.age,
        phone: data.phone,
        services: data.services,
        status: data.status,
      },
    });
    
    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.listing.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
} 