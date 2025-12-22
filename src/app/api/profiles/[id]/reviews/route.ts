import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { profileId: params.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.review.count({ where: { profileId: params.id } }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rating, comment, authorName } = body;

    if (!rating || !comment || !authorName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        profileId: params.id,
        rating,
        comment,
        authorName,
      },
    });

    // Update profile rating
    const profileReviews = await prisma.review.findMany({
      where: { profileId: params.id },
    });

    const averageRating =
      profileReviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) /
      profileReviews.length;

    await prisma.profile.update({
      where: { id: params.id },
      data: {
        rating: averageRating,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return new NextResponse('Missing review ID', { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update profile rating
    const profileReviews = await prisma.review.findMany({
      where: { profileId: params.id },
    });

    const averageRating =
      profileReviews.length > 0
        ? profileReviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) /
          profileReviews.length
        : 0;

    await prisma.profile.update({
      where: { id: params.id },
      data: {
        rating: averageRating,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 