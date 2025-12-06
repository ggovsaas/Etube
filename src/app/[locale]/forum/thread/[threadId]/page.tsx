import React from 'react';
import Link from 'next/link';
import { getThreadWithPosts } from '@/lib/data/forum';
import { ArrowLeft, Lock, Pin, Sparkles, MessageSquare } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReplyForm from '@/components/forum/ReplyForm';
import ContestWidget from '@/components/ContestWidget';
import { getContestsByThread } from '@/lib/data/contests';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ThreadPageProps {
  params: Promise<{
    locale: string;
    threadId: string;
  }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { locale, threadId } = await params;
  const { thread, posts } = await getThreadWithPosts(threadId);

  if (!thread) {
    notFound();
  }

  // Get category info for breadcrumb
  const category = await prisma.forumCategory.findUnique({
    where: { id: thread.categoryId },
    select: { name: true, slug: true }
  });

  // Get contests for this thread
  const contests = await getContestsByThread(threadId);

  const translations = {
    pt: {
      backToCategory: 'Voltar à Categoria',
      replies: 'Respostas',
      views: 'Visualizações',
      postedBy: 'Publicado por',
      on: 'em',
      reply: 'Responder',
      locked: 'Este tópico está bloqueado. Não é possível responder.',
      noReplies: 'Ainda não há respostas. Seja o primeiro a responder!',
      sticky: 'Fixado',
      sponsored: 'Patrocinado',
      locked: 'Bloqueado'
    },
    es: {
      backToCategory: 'Volver a la Categoría',
      replies: 'Respuestas',
      views: 'Visualizaciones',
      postedBy: 'Publicado por',
      on: 'en',
      reply: 'Responder',
      locked: 'Este tema está bloqueado. No se puede responder.',
      noReplies: 'Aún no hay respuestas. ¡Sé el primero en responder!',
      sticky: 'Fijado',
      sponsored: 'Patrocinado',
      lockedLabel: 'Bloqueado'
    }
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={category ? `/${locale}/forum/${category.slug}` : `/${locale}/forum`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t.backToCategory}</span>
          </Link>
          <div className="flex items-start gap-3">
            {thread.isSticky && (
              <Pin size={20} className="text-red-600 mt-1" title={t.sticky} />
            )}
            {thread.isSponsored && (
              <Sparkles size={20} className="text-yellow-500 mt-1" title={t.sponsored} />
            )}
            {thread.isLocked && (
              <Lock size={20} className="text-gray-400 mt-1" title={t.lockedLabel} />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{thread.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <span>{posts.length} {t.replies}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{thread.views} {t.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contest Widgets */}
        {contests.length > 0 && (
          <div className="mb-6">
            {contests.map((contest) => (
              <ContestWidget key={contest.id} contestId={contest.id} locale={locale} />
            ))}
          </div>
        )}

        {/* Original Post */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              {thread.author?.image && (
                <img
                  src={thread.author.image}
                  alt={thread.author.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <div className="font-semibold text-gray-900">
                  {thread.author?.name || 'Anônimo'}
                </div>
                <div className="text-sm text-gray-500">
                  {t.postedBy} {thread.author?.name || 'Anônimo'} {t.on}{' '}
                  {new Date(thread.createdAt).toLocaleDateString(
                    locale === 'es' ? 'es-ES' : 'pt-PT',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {thread.content}
            </div>
          </div>
        </div>

        {/* Replies */}
        {posts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {posts.length} {t.replies}
            </h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg border border-gray-200">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.author?.image && (
                        <img
                          src={post.author.image}
                          alt={post.author.name || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {post.author?.name || 'Anônimo'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 'pt-PT',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      {post.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Form */}
        {thread.isLocked ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <Lock size={24} className="text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-800">{t.locked}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t.reply}</h3>
            </div>
            <ReplyForm threadId={thread.id} locale={locale} />
          </div>
        )}

        {posts.length === 0 && !thread.isLocked && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p>{t.noReplies}</p>
          </div>
        )}
      </div>
    </div>
  );
}

