'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateThreadFormProps {
  categoryId: string;
  locale: string;
  variant?: 'button' | 'inline';
}

export default function CreateThreadForm({ categoryId, locale, variant = 'inline' }: CreateThreadFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const translations = {
    pt: {
      createThread: 'Criar Tópico',
      title: 'Título',
      content: 'Conteúdo',
      submit: 'Criar Tópico',
      cancel: 'Cancelar',
      required: 'Obrigatório',
      creating: 'Criando...',
      success: 'Tópico criado com sucesso!'
    },
    es: {
      createThread: 'Crear Tema',
      title: 'Título',
      content: 'Contenido',
      submit: 'Crear Tema',
      cancel: 'Cancelar',
      required: 'Obligatorio',
      creating: 'Creando...',
      success: '¡Tema creado con éxito!'
    }
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          categoryId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create thread');
      }

      // Reset form and refresh page
      setFormData({ title: '', content: '' });
      setShowForm(false);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} />
            {t.createThread}
          </button>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.createThread}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', content: '' });
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.title} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={t.title}
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.content} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={t.content}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', content: '' });
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.creating : t.submit}
                </button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Plus size={18} />
          {t.createThread}
        </button>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.createThread}</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ title: '', content: '' });
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {t.title} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t.title}
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                {t.content} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t.content}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', content: '' });
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.creating : t.submit}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

