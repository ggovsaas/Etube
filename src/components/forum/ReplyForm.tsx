'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReplyFormProps {
  threadId: string;
  locale: string;
}

export default function ReplyForm({ threadId, locale }: ReplyFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const translations = {
    pt: {
      placeholder: 'Escreva sua resposta aqui...',
      submit: 'Responder',
      submitting: 'Enviando...',
      required: 'Por favor, escreva uma resposta'
    },
    es: {
      placeholder: 'Escribe tu respuesta aquí...',
      submit: 'Responder',
      submitting: 'Enviando...',
      required: 'Por favor, escribe una respuesta'
    }
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          threadId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reply');
      }

      // Reset form and refresh page
      setContent('');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          placeholder={t.placeholder}
          required
        />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {loading ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
}

