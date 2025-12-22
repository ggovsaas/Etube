import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const profileId = formData.get('profileId') as string;
    const type = formData.get('type') as string;

    if (!file || !profileId || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Here you would typically upload the file to a storage service
    // For now, we'll just create a placeholder URL
    const url = `https://example.com/media/${file.name}`;

    const media = await prisma.media.create({
      data: {
        url,
        type,
        profileId,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing media ID', { status: 400 });
    }

    await prisma.media.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting media:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 