'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import DashboardLayout from '@/components/DashboardLayout';

export default function CreateStoryPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError(locale === 'pt' ? 'Apenas imagens e vídeos são permitidos' : 'Solo se permiten imágenes y videos');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError(locale === 'pt' ? 'Arquivo muito grande. Máximo 50MB' : 'Archivo muy grande. Máximo 50MB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/stories', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMediaUrl(data.mediaUrl);
        // Redirect to stories list or feed
        router.push(`/${locale}/dashboard/blogs?tab=stories`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || (locale === 'pt' ? 'Erro ao fazer upload' : 'Error al subir'));
      }
    } catch (error) {
      console.error('Error uploading story:', error);
      setError(locale === 'pt' ? 'Erro ao fazer upload' : 'Error al subir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Criar Story' : 'Crear Story'}
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'pt' ? 'Upload de Mídia' : 'Subir Media'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-red-400 transition">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h4m-4-4v4m0 4v4m0-4h4m-4-4h4"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <span>{locale === 'pt' ? 'Escolher arquivo' : 'Elegir archivo'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                  </label>
                  <p className="pl-1">{locale === 'pt' ? 'ou arraste e solte' : 'o arrastra y suelta'}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {locale === 'pt' ? 'PNG, JPG, GIF, MP4 até 50MB' : 'PNG, JPG, GIF, MP4 hasta 50MB'}
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                {locale === 'pt' ? 'Fazendo upload...' : 'Subiendo...'}
              </p>
            </div>
          )}

          {mediaUrl && (
            <div className="mt-4">
              <p className="text-sm text-green-600 mb-2">
                {locale === 'pt' ? 'Upload concluído!' : '¡Subida completada!'}
              </p>
              <div className="relative">
                {mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={mediaUrl} alt="Story preview" className="max-w-full h-auto rounded-lg" />
                ) : (
                  <video src={mediaUrl} controls className="max-w-full h-auto rounded-lg" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

