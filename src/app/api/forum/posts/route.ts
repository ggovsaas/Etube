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
    const { content, threadId } = body;

    // Validate required fields
    if (!content || !threadId) {
      return NextResponse.json(
        { error: 'Missing required fields: content, threadId' },
        { status: 400 }
      );
    }

    // Verify thread exists and is not locked
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { id: true, isLocked: true }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      );
    }

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        content: content.trim(),
        threadId,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Update thread's lastPostAt
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { lastPostAt: new Date() }
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

