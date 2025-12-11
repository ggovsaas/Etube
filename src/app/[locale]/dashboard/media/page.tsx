'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import DashboardLayout from '@/components/DashboardLayout';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'PHOTO' | 'VIDEO' | 'IMAGE';
  profileId?: string;
  listingId?: string;
  createdAt: string;
}

export default function MediaPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchMedia();
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

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/user/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(Array.isArray(data.media) ? data.media : []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          formData.append('files', file);
        }
      });

      const response = await fetch('/api/user/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchMedia();
      } else {
        alert(locale === 'pt' ? 'Erro ao fazer upload.' : 'Error al subir archivos.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(locale === 'pt' ? 'Erro ao fazer upload.' : 'Error al subir archivos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm(locale === 'pt' ? 'Tem certeza que deseja deletar?' : '¿Estás seguro de que deseas eliminar?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMedia();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/user/media/${mediaId}/set-primary`, {
        method: 'PUT',
      });

      if (response.ok) {
        await fetchMedia();
      }
    } catch (error) {
      console.error('Error setting primary:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Media' : 'Media'}
        </h1>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 transition-colors ${
            isDragging
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-gray-600 mb-2">
            {locale === 'pt'
              ? 'Arraste e solte suas fotos/vídeos aqui ou clique para selecionar'
              : 'Arrasta y suelta tus fotos/videos aquí o haz clic para seleccionar'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {locale === 'pt' ? 'PNG, JPG, GIF, MP4 até 50MB' : 'PNG, JPG, GIF, MP4 hasta 50MB'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {uploading
              ? locale === 'pt'
                ? 'Enviando...'
                : 'Enviando...'
              : locale === 'pt'
              ? 'Selecionar Arquivos'
              : 'Seleccionar Archivos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Media Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="relative group bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-square relative">
                {item.type === 'VIDEO' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                  />
                ) : (
                  <Image
                    src={item.url}
                    alt="Media"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleSetPrimary(item.id)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-opacity"
                  >
                    {locale === 'pt' ? 'Principal' : 'Principal'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-opacity"
                  >
                    {locale === 'pt' ? 'Deletar' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {media.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>{locale === 'pt' ? 'Nenhuma mídia ainda.' : 'Aún no hay medios.'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

