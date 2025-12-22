import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Review {
  id: string;
  rating: number;
  comment: string;
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

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { profileId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.review.count({ where: { profileId } }),
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, rating, comment, authorName } = body;

    if (!profileId || !rating || !comment || !authorName) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        profileId,
        rating,
        comment,
        authorName,
      },
    });

    // Update profile rating
    const profileReviews = await prisma.review.findMany({
      where: { profileId },
    });

    const averageRating =
      profileReviews.reduce((acc: number, review: Review) => acc + review.rating, 0) /
      profileReviews.length;

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        rating: averageRating,
        reviews: {
          connect: { id: review.id },
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing review ID', { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!review) {
      return new NextResponse('Review not found', { status: 404 });
    }

    await prisma.review.delete({
      where: { id },
    });

    // Update profile rating
    const profileReviews = await prisma.review.findMany({
      where: { profileId: review.profileId },
    });

    const averageRating =
      profileReviews.length > 0
        ? profileReviews.reduce((acc: number, review: Review) => acc + review.rating, 0) /
          profileReviews.length
        : 0;

    await prisma.profile.update({
      where: { id: review.profileId },
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