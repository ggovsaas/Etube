'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import Image from 'next/image';
import Link from 'next/link';
import StoriesBarClient from '@/components/StoriesBarClient';

interface ContentItem {
  id: string;
  type: 'PHOTO_POST' | 'VIDEO_POST' | 'STORY';
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    isOnline: boolean;
    profile: {
      id: string;
      name: string;
      profilePhoto: string | null;
    } | null;
  };
}

export default function PulsePage() {
  const { locale, t } = useLocale();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, [page]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      // CRITICAL: Pass locale to API for geographic filtering
      const response = await fetch(`/api/feed?page=${page}&limit=15&locale=${locale}`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setItems(data.items || []);
        } else {
          setItems((prev) => [...prev, ...(data.items || [])]);
        }
        setHasMore(data.currentPage < data.pages);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Determine if locale is RTL (for future Arabic/Hebrew support)
  const isRTL = false; // Currently only pt/es, but ready for RTL

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stories Bar - Above the Fold */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <StoriesBarClient locale={locale} />
      </div>

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.loadingFeed}</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t.noPostsFound}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <PostCard key={item.id} item={item} locale={locale} t={t} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200 btn-expand-safe"
            >
              {t.viewAll}
            </button>
          </div>
        )}

        {loading && items.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ item, locale, t }: { item: ContentItem; locale: string; t: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const profilePhoto = item.user.profile?.profilePhoto || item.user.image || '/placeholder-profile.jpg';
  const displayName = item.user.profile?.name || item.user.name || item.user.email.split('@')[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
          <Image
            src={profilePhoto}
            alt={displayName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1">
          <Link href={`/${locale}/criador/${item.user.id}`} className="font-semibold text-gray-900 hover:text-red-600">
            {displayName}
          </Link>
          {item.user.isOnline && (
            <span className="ml-2 inline-block h-2 w-2 bg-green-500 rounded-full"></span>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="relative w-full" style={{ aspectRatio: item.type === 'VIDEO_POST' ? '16/9' : '4/5' }}>
        {item.type === 'VIDEO_POST' ? (
          <video
            src={item.mediaUrl}
            poster={item.thumbnailUrl || undefined}
            controls
            preload="none"
            className="w-full h-full object-cover"
            onLoadedData={() => setVideoLoaded(true)}
          />
        ) : (
          <Image
            src={item.mediaUrl}
            alt={item.caption || 'Post'}
            fill
            className="object-cover"
            priority={!imageLoaded}
            loading={imageLoaded ? 'lazy' : 'eager'}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
        )}
      </div>

      {/* Interactions */}
      <div className="px-4 py-3">
        <div className="flex items-center space-x-4 mb-2">
          <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm">{item.likesCount}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">{item.commentsCount}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm">{t.share}</span>
          </button>
          {item.user.isOnline && (
            <button className="ml-auto flex items-center space-x-1 bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 text-sm font-medium btn-expand-safe">
              <span>{t.tip}</span>
            </button>
          )}
        </div>

        {/* Caption */}
        {item.caption && (
          <p className="text-gray-900 text-expand-safe mb-2">
            <Link href={`/${locale}/criador/${item.user.id}`} className="font-semibold mr-2">
              {displayName}
            </Link>
            {item.caption}
          </p>
        )}

        {/* Metadata */}
        <p className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
            day: 'numeric',
            month: 'short',
          })}
        </p>
      </div>
    </div>
  );
}

