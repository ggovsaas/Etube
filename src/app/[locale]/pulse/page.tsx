'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import StoriesBarClient from '@/components/StoriesBarClient';
import DashboardLayout from '@/components/DashboardLayout';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'upload'>('feed');

  useEffect(() => {
    fetchFeed();
    // Fetch user data if authenticated to show dashboard layout
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserData();
    }
  }, [page, status, session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Upload as story (can be photo or video)
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('file', file);
      });

      const response = await fetch('/api/user/stories', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Refresh feed after upload
        await fetchFeed();
        setActiveTab('feed');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || (locale === 'pt' ? 'Erro ao fazer upload' : 'Error al subir'));
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert(locale === 'pt' ? 'Erro ao fazer upload' : 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
        await handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  // Determine if locale is RTL (for future Arabic/Hebrew support)
  const isRTL = false; // Currently only pt/es, but ready for RTL

  // If user is authenticated, show pulse as media hub within dashboard layout
  const pulseContent = status === 'authenticated' && user ? (
    <div className="max-w-7xl mx-auto">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'es' ? 'Pulse - Centro de Medios' : 'Pulse - Centro de Mídia'}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'upload'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {locale === 'es' ? '+ Subir Media' : '+ Fazer Upload'}
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'feed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {locale === 'es' ? 'Ver Feed' : 'Ver Feed'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {locale === 'es' ? 'Subir Fotos, Videos o Historias' : 'Fazer Upload de Fotos, Vídeos ou Histórias'}
          </h2>
          
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-red-500 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-600">
              {locale === 'es'
                ? 'Arrasta y suelta tus fotos/videos aquí o haz clic para seleccionar'
                : 'Arraste e solte suas fotos/vídeos aqui ou clique para selecionar'}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {locale === 'es' ? 'PNG, JPG, GIF, MP4 hasta 50MB' : 'PNG, JPG, GIF, MP4 até 50MB'}
            </p>
            {uploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  {locale === 'es' ? 'Subiendo...' : 'Fazendo upload...'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/dashboard/stories/create`}
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-medium">{locale === 'es' ? 'Crear Historia' : 'Criar História'}</p>
            </Link>
            <Link
              href={`/${locale}/dashboard/tv-tube`}
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">{locale === 'es' ? 'Subir Video' : 'Fazer Upload de Vídeo'}</p>
            </Link>
            <Link
              href={`/${locale}/criar-anuncio`}
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition text-center"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-medium">{locale === 'es' ? 'Crear Anuncio' : 'Criar Anúncio'}</p>
            </Link>
          </div>
        </div>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Stories Bar - Above the Fold */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10 mb-6">
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
      )}
    </div>
  ) : (
    // Public view (not authenticated)
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

  // If authenticated, wrap in DashboardLayout; otherwise show standalone
  if (status === 'authenticated' && user) {
    return (
      <DashboardLayout user={user}>
        {pulseContent}
      </DashboardLayout>
    );
  }

  return pulseContent;
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

