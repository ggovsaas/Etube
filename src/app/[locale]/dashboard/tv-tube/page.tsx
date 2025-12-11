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
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  price: number; // in credits
  isFree: boolean;
  viewsCount: number;
  paidViewsCount: number;
  creditsEarned: number;
  createdAt: string;
}

export default function TVTubePage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: true,
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
  });

  useEffect(() => {
    fetchUserData();
    fetchVideos();
  }, []);

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

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/user/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(Array.isArray(data.videos) ? data.videos : []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.isFree ? '0' : formData.price.toString());
      formDataToSend.append('isFree', formData.isFree.toString());
      if (formData.videoFile) {
        formDataToSend.append('video', formData.videoFile);
      }
      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }

      const response = await fetch('/api/user/videos/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setShowUploadForm(false);
        setFormData({
          title: '',
          description: '',
          price: 0,
          isFree: true,
          videoFile: null,
          thumbnailFile: null,
        });
        await fetchVideos();
      } else {
        alert(locale === 'pt' ? 'Erro ao fazer upload.' : 'Error al subir video.');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(locale === 'pt' ? 'Erro ao fazer upload.' : 'Error al subir video.');
    } finally {
      setUploading(false);
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

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'pt' ? 'TV/Tube' : 'TV/Tube'}
          </h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            {locale === 'pt' ? '+ Novo Vídeo' : '+ Nuevo Video'}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {locale === 'pt' ? 'Upload de Vídeo' : 'Subir Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'pt' ? 'Título' : 'Título'} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'pt' ? 'Descrição' : 'Descripción'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{locale === 'pt' ? 'Gratuito' : 'Gratis'}</span>
                </label>
                {!formData.isFree && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Preço (Créditos)' : 'Precio (Créditos)'} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'pt' ? 'Arquivo de Vídeo' : 'Archivo de Video'} *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFormData({ ...formData, videoFile: e.target.files?.[0] || null })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'pt' ? 'Thumbnail (Opcional)' : 'Thumbnail (Opcional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  {uploading
                    ? locale === 'pt'
                      ? 'Enviando...'
                      : 'Enviando...'
                    : locale === 'pt'
                    ? 'Upload'
                    : 'Subir'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-200"
                >
                  {locale === 'pt' ? 'Cancelar' : 'Cancelar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-video relative bg-gray-200">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {video.isFree
                    ? locale === 'pt'
                      ? 'Gratuito'
                      : 'Gratis'
                    : `${video.price} ${locale === 'pt' ? 'Créditos' : 'Créditos'}`}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                  <div>
                    <div className="font-semibold">{video.viewsCount}</div>
                    <div>{locale === 'pt' ? 'Visualizações' : 'Visualizaciones'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{video.paidViewsCount}</div>
                    <div>{locale === 'pt' ? 'Pagas' : 'Pagadas'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{video.creditsEarned}</div>
                    <div>{locale === 'pt' ? 'Créditos' : 'Créditos'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded transition">
                    {locale === 'pt' ? 'Editar' : 'Editar'}
                  </button>
                  <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm py-2 px-4 rounded transition">
                    {locale === 'pt' ? 'Deletar' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>{locale === 'pt' ? 'Nenhum vídeo ainda.' : 'Aún no hay videos.'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


