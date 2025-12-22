'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featureImageUrl: string | null;
  excerpt: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function BlogPage() {
  const { locale, t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchPopularPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/blog?page=${page}&limit=12&publishedOnly=true`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularPosts = async () => {
    try {
      const response = await fetch(`/api/blog?page=1&limit=5&publishedOnly=true`);
      if (response.ok) {
        const data = await response.json();
        setPopularPosts(data.posts?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error fetching popular posts:', error);
    }
  };

  const filteredPosts = searchQuery
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  // Determine if locale is RTL
  const isRTL = false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loadingFeed}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.articles}</h1>
          <p className="text-lg text-gray-600 text-expand-safe">
            {locale === 'es'
              ? 'Últimos artículos, consejos y guías especializadas'
              : 'Últimos artigos, conselhos e guias especializadas'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchArticles}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {locale === 'es' ? 'Aún no hay artículos disponibles.' : 'Ainda não há artigos disponíveis.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/blog/${post.slug}`}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {post.featureImageUrl && (
                      <div className="relative h-64 w-full">
                        <Image
                          src={post.featureImageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 text-expand-safe">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 text-expand-safe">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="text-expand-safe">
                          {t.by} {post.author.name || post.author.email}
                        </span>
                        {post.publishedAt && (
                          <span>
                            {t.publishedOn}{' '}
                            {new Date(post.publishedAt).toLocaleDateString(
                              locale === 'pt' ? 'pt-PT' : 'es-ES'
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 btn-expand-safe"
                >
                  {t.previous}
                </button>
                <span className="px-4 py-2 text-gray-700">
                  {t.page} {page} {t.of} {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 btn-expand-safe"
                >
                  {t.next}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.popularPosts}</h3>
              <div className="space-y-4">
                {popularPosts.slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/blog/${post.slug}`}
                    className="block hover:text-red-600 transition"
                  >
                    <h4 className="font-semibold text-sm text-expand-safe line-clamp-2">{post.title}</h4>
                    {post.publishedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.publishedAt).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES')}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
