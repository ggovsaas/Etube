'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isServiceProvider: boolean;
  isContentCreator: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface Story {
  id: string;
  mediaUrl: string;
  storyOrder: number;
  createdAt: string;
}

export default function BlogsPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'blog' | 'stories'>('blog');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    if (activeTab === 'blog') {
      fetchBlogPosts();
    } else {
      fetchStories();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only current user's posts
        const userPosts = Array.isArray(data.posts)
          ? data.posts.filter((post: BlogPost) => post.id) // Will filter by userId on backend
          : [];
        setBlogPosts(userPosts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/user/stories');
      if (response.ok) {
        const data = await response.json();
        setStories(Array.isArray(data.stories) ? data.stories : []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'pt' ? 'Carregando...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{locale === 'pt' ? 'Acesso Negado' : 'Acceso Denegado'}</h2>
        </div>
      </div>
    );
  }

  const canManageStories = user.isServiceProvider || user.isContentCreator;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Artigos & Stories' : 'Artículos & Stories'}
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('blog')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blog'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {locale === 'pt' ? 'Artigos Principais' : 'Artículos Principales'}
            </button>
            {canManageStories && (
              <button
                onClick={() => setActiveTab('stories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stories'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {locale === 'pt' ? 'Stories do Perfil' : 'Stories del Perfil'}
              </button>
            )}
          </nav>
        </div>

        {/* Blog Posts Tab */}
        {activeTab === 'blog' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {locale === 'pt'
                  ? 'Gerencie seus artigos principais. Use o CMS de administração para criar e editar artigos completos.'
                  : 'Gestiona tus artículos principales. Usa el CMS de administración para crear y editar artículos completos.'}
              </p>
              <Link
                href="/admin/blog"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                {locale === 'pt' ? 'Ir para CMS' : 'Ir al CMS'}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          post.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.isPublished
                          ? locale === 'pt'
                            ? 'Publicado'
                            : 'Publicado'
                          : locale === 'pt'
                          ? 'Rascunho'
                          : 'Borrador'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/blog?edit=${post.id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded text-center transition"
                      >
                        {locale === 'pt' ? 'Editar' : 'Editar'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {blogPosts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>{locale === 'pt' ? 'Nenhum artigo ainda.' : 'Aún no hay artículos.'}</p>
                <Link
                  href="/admin/blog"
                  className="mt-4 inline-block text-red-600 hover:text-red-700 font-medium"
                >
                  {locale === 'pt' ? 'Criar primeiro artigo →' : 'Crear primer artículo →'}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && canManageStories && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {locale === 'pt'
                  ? 'Gerencie suas stories que aparecem no topo do feed de perfis. Stories são atualizações curtas e temporárias.'
                  : 'Gestiona tus stories que aparecen en la parte superior del feed de perfiles. Las stories son actualizaciones cortas y temporales.'}
              </p>
              <Link
                href={`/${locale}/dashboard/stories/create`}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                {locale === 'pt' ? '+ Nova Story' : '+ Nueva Story'}
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={story.mediaUrl}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded transition">
                        {locale === 'pt' ? 'Editar' : 'Editar'}
                      </button>
                      <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs py-1 px-2 rounded transition">
                        {locale === 'pt' ? 'Deletar' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {stories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>{locale === 'pt' ? 'Nenhuma story ainda.' : 'Aún no hay stories.'}</p>
                <Link
                  href={`/${locale}/dashboard/stories/create`}
                  className="mt-4 inline-block text-red-600 hover:text-red-700 font-medium"
                >
                  {locale === 'pt' ? 'Criar primeira story →' : 'Crear primera story →'}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

