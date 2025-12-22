import React from 'react';
import { getCreatorWishlist } from '@/lib/data/wishlists';
import { prisma } from '@/lib/prisma';
import WishlistPageClient from '@/components/WishlistPageClient';
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface WishlistPageProps {
  params: Promise<{
    locale: string;
    userId: string;
  }>;
}

/**
 * Server Component for Wishlist Page
 * Fetches wishlist data and creator info
 */
export default async function WishlistPage({ params }: WishlistPageProps) {
  let locale: string;
  let userId: string;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    userId = resolvedParams.userId;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!userId) {
    notFound();
  }

  // Fetch wishlist items (handle errors gracefully)
  let wishlistItems = [];
  try {
    wishlistItems = await getCreatorWishlist(userId);
  } catch (error: any) {
    // Always show page, even if there's an error
    // If table doesn't exist, show empty list instead of 404
    if (error?.code === 'P2021' || error?.message?.includes('does not exist') || error?.message?.includes('WishlistItem')) {
      console.warn('WishlistItem table does not exist yet. Run: npx prisma db push');
      wishlistItems = [];
    } else {
      console.error('Error fetching wishlist:', error);
      wishlistItems = [];
    }
  }

  // Fetch creator name for display
  let creatorName: string | null = null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    creatorName = user?.name || null;
  } catch (error) {
    // Ignore error, name is optional
    console.warn('Could not fetch creator name:', error);
  }

  return (
    <WishlistPageClient
      wishlistItems={wishlistItems}
      creatorName={creatorName}
      locale={locale as 'pt' | 'es'}
    />
  );
}

