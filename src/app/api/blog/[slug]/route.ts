import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET /api/blog/[slug] - Get a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN' || 
                    (process.env.ADMIN_EMAILS || '').split(',').includes(session?.user?.email || '');

    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only show unpublished posts to admins
    if (!post.isPublished && !isAdmin) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - Update a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN' || 
                    (process.env.ADMIN_EMAILS || '').split(',').includes(session.user.email || '');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug: newSlug, content, featureImageUrl, excerpt, metaDescription, isPublished } = body;

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: params.slug }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug exists
    if (newSlug && newSlug !== params.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: newSlug }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (content !== undefined) updateData.content = content;
    if (featureImageUrl !== undefined) updateData.featureImageUrl = featureImageUrl;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      // Set publishedAt when publishing for the first time
      if (isPublished && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedPost = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN' || 
                    (process.env.ADMIN_EMAILS || '').split(',').includes(session.user.email || '');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await prisma.blogPost.delete({
      where: { slug: params.slug }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

