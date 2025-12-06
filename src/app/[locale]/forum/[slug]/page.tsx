import React from 'react';
import Link from 'next/link';
import { getCategoryBySlug, getCategoryThreads } from '@/lib/data/forum';
import { MessageSquare, Eye, Lock, Pin, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import CreateThreadForm from '@/components/forum/CreateThreadForm';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const threads = await getCategoryThreads(category.id);

  const translations = {
    pt: {
      backToForum: 'Voltar ao Fórum',
      createThread: 'Criar Tópico',
      threads: 'Tópicos',
      replies: 'Respostas',
      views: 'Visualizações',
      lastPost: 'Última Mensagem',
      author: 'Autor',
      noThreads: 'Nenhum tópico ainda. Seja o primeiro a criar um!',
      sticky: 'Fixado',
      sponsored: 'Patrocinado',
      locked: 'Bloqueado'
    },
    es: {
      backToForum: 'Volver al Foro',
      createThread: 'Crear Tema',
      threads: 'Temas',
      replies: 'Respuestas',
      views: 'Visualizaciones',
      lastPost: 'Último Mensaje',
      author: 'Autor',
      noThreads: 'Aún no hay temas. ¡Sé el primero en crear uno!',
      sticky: 'Fijado',
      sponsored: 'Patrocinado',
      locked: 'Bloqueado'
    }
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/${locale}/forum`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t.backToForum}</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
            <CreateThreadForm categoryId={category.id} locale={locale} />
          </div>
        </div>
      </div>

      {/* Threads List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {threads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">{t.noThreads}</p>
            <CreateThreadForm categoryId={category.id} locale={locale} variant="button" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
              <div className="col-span-6">{t.threads}</div>
              <div className="col-span-2 text-center">{t.replies}</div>
              <div className="col-span-2 text-center">{t.views}</div>
              <div className="col-span-2">{t.lastPost}</div>
            </div>

            {/* Threads */}
            <div className="divide-y divide-gray-200">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/${locale}/forum/thread/${thread.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6">
                      <div className="flex items-center gap-2">
                        {thread.isSticky && (
                          <Pin size={16} className="text-red-600" title={t.sticky} />
                        )}
                        {thread.isSponsored && (
                          <Sparkles size={16} className="text-yellow-500" title={t.sponsored} />
                        )}
                        {thread.isLocked && (
                          <Lock size={16} className="text-gray-400" title={t.locked} />
                        )}
                        <h3 className="font-semibold text-gray-900 hover:text-red-600">
                          {thread.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {thread.author?.image && (
                          <img
                            src={thread.author.image}
                            alt={thread.author.name || 'User'}
                            className="w-5 h-5 rounded-full"
                          />
                        )}
                        <span>{thread.author?.name || 'Anônimo'}</span>
                        <span>•</span>
                        <span>
                          {new Date(thread.createdAt).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 'pt-PT',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-gray-600">
                      {thread.postCount || 0}
                    </div>
                    <div className="col-span-2 text-center text-gray-600">
                      <div className="flex items-center justify-center gap-1">
                        <Eye size={16} />
                        {thread.views}
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">
                      {thread.lastPostAt && (
                        <div>
                          <div>
                            {new Date(thread.lastPostAt).toLocaleDateString(
                              locale === 'es' ? 'es-ES' : 'pt-PT',
                              {
                                day: 'numeric',
                                month: 'short'
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(thread.lastPostAt).toLocaleTimeString(
                              locale === 'es' ? 'es-ES' : 'pt-PT',
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

