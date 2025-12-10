'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import ReactMarkdown from 'react-markdown';

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

export default function BlogPostPage() {
  const params = useParams();
  const { locale } = useLocale();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        setPost(null);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link
            href={`/${locale}/blog`}
            className="text-red-600 hover:text-red-700 underline"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Blog */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Feature Image */}
        {post.featureImageUrl && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featureImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              {post.author.image && (
                <img
                  src={post.author.image}
                  alt={post.author.name || 'Author'}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {post.author.name || post.author.email}
                </p>
                {post.publishedAt && (
                  <p className="text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* JSON-LD Schema for BlogPosting */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.metaDescription || post.excerpt || '',
              image: post.featureImageUrl || '',
              datePublished: post.publishedAt || post.createdAt,
              dateModified: post.createdAt,
              author: {
                '@type': 'Person',
                name: post.author.name || post.author.email,
                email: post.author.email
              },
              publisher: {
                '@type': 'Organization',
                name: 'EscortTube',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.escorttube.vip/logo.png'
                }
              }
            })
          }}
        />
      </article>
    </div>
  );
}

