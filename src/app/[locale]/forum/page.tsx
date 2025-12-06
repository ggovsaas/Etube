import React from 'react';
import Link from 'next/link';
import { getForumCategories } from '@/lib/data/forum';
import { MessageSquare, Users, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ForumDirectoryPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ForumDirectoryPage({ params }: ForumDirectoryPageProps) {
  const { locale } = await params;
  const categories = await getForumCategories();

  const translations = {
    pt: {
      title: 'Fórum',
      subtitle: 'Conecte-se, compartilhe e descubra',
      categories: 'Categorias',
      threads: 'Tópicos',
      lastPost: 'Última Mensagem',
      noCategories: 'Nenhuma categoria disponível',
      viewCategory: 'Ver Categoria'
    },
    es: {
      title: 'Foro',
      subtitle: 'Conéctate, comparte y descubre',
      categories: 'Categorías',
      threads: 'Temas',
      lastPost: 'Último Mensaje',
      noCategories: 'No hay categorías disponibles',
      viewCategory: 'Ver Categoría'
    }
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <MessageSquare size={32} className="text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t.noCategories}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/forum/${category.slug}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-gray-600 mb-4">{category.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} />
                          <span>
                            {category.threadCount || 0} {t.threads}
                          </span>
                        </div>
                        {category.lastPostAt && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>
                              {new Date(category.lastPostAt).toLocaleDateString(
                                locale === 'es' ? 'es-ES' : 'pt-PT',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 text-red-600">
                      <span className="text-sm font-semibold">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

