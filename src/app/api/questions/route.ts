import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  authorName: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!profileId) {
      return new NextResponse('Missing profile ID', { status: 400 });
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: { profileId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.question.count({ where: { profileId } }),
    ]);

    return NextResponse.json({
      questions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, question, authorName } = body;

    if (!profileId || !question || !authorName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        profileId,
        question,
        authorName,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, answer } = body;

    if (!id || !answer) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: { answer },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing question ID', { status: 400 });
    }

    await prisma.question.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting question:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 