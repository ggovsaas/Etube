import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, categoryId } = body;

    // Validate required fields
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, categoryId' },
        { status: 400 }
      );
    }

    // Verify category exists and is active
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, isActive: true }
    });

    if (!category || !category.isActive) {
      return NextResponse.json(
        { error: 'Category not found or inactive' },
        { status: 404 }
      );
    }

    // Create thread
    const thread = await prisma.forumThread.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        authorId: session.user.id,
        views: 0,
        isSticky: false,
        isLocked: false,
        isSponsored: false,
        lastPostAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

