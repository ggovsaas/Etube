'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: {
    id: string;
    name: string;
  };
}

interface Listing {
  id: string;
  title: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FINISHED' | 'PENDING';
  isPremium: boolean;
  createdAt: string;
}

export default function MisAnunciosPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm(locale === 'pt' 
      ? 'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.' 
      : '¿Está seguro de que desea eliminar este anuncio? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(listingId);
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setListings(prev => prev.filter(l => l.id !== listingId));
        alert(locale === 'pt' ? 'Anúncio excluído com sucesso!' : '¡Anuncio eliminado con éxito!');
      } else {
        const data = await response.json();
        alert(locale === 'pt' 
          ? `Erro ao excluir: ${data.error || 'Erro desconhecido'}` 
          : `Error al eliminar: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert(locale === 'pt' ? 'Erro ao excluir anúncio.' : 'Error al eliminar anuncio.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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
          <p className="text-gray-600 mb-4">{locale === 'pt' ? 'Você precisa estar logado para acessar esta página.' : 'Necesitas estar conectado para acceder a esta página.'}</p>
          <Link href={`/${locale}/login`} className="text-indigo-600 hover:text-indigo-500">
            {locale === 'pt' ? 'Fazer Login' : 'Iniciar Sesión'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">{locale === 'pt' ? 'Meus Anúncios' : 'Mis Anuncios'}</h1>

        <div className="space-y-6">
          {/* Create Free Listing Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-end">
              <Link 
                href={`/${locale}/criar-anuncio`} 
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {locale === 'pt' ? 'Criar Anúncio Grátis' : 'Crear Anuncio Gratis'}
              </Link>
            </div>
          </div>

          {/* Pending Listings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-black mb-4">{locale === 'pt' ? 'Anúncios Pendentes' : 'Anuncios Pendientes'}</h2>
            {listings.filter(l => l.status === 'PENDING').length > 0 ? (
              <div className="space-y-4">
                {listings.filter(l => l.status === 'PENDING').map((listing) => (
                  <div key={listing.id} className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-pink-600">{listing.title}</h4>
                        <p className="text-gray-600">{listing.city}</p>
                        <p className="text-sm text-gray-500">Criado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-yellow-700 mt-2">⏳ {locale === 'pt' ? 'Aguardando Aprovação' : 'Esperando Aprobación'}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {locale === 'pt' ? 'Pendente' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Link href={`/editar-anuncio/${listing.id}`} className="text-gray-600 hover:text-gray-500 text-sm">
                        {locale === 'pt' ? 'Editar' : 'Editar'}
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={deleting === listing.id}
                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === listing.id 
                          ? (locale === 'pt' ? 'Excluindo...' : 'Eliminando...')
                          : (locale === 'pt' ? 'Excluir' : 'Eliminar')
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{locale === 'pt' ? 'Nenhuma listagem pendente.' : 'No hay anuncios pendientes.'}</p>
            )}
          </div>

          {/* Active Listings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-black mb-4">{locale === 'pt' ? 'Anúncios Ativos' : 'Anuncios Activos'}</h2>
            {listings.filter(l => l.status === 'ACTIVE').length > 0 ? (
              <div className="space-y-4">
                {listings.filter(l => l.status === 'ACTIVE').map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 relative">
                    {listing.isPremium && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Premium
                      </span>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-pink-600">{listing.title}</h4>
                        <p className="text-gray-600">{listing.city}</p>
                        <p className="text-sm text-gray-500">Criado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {locale === 'pt' ? 'Ativo' : 'Activo'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Link href={`/anuncio/${listing.id}`} className="text-indigo-600 hover:text-indigo-500 text-sm">
                        {locale === 'pt' ? 'Ver' : 'Ver'}
                      </Link>
                      <Link href={`/editar-anuncio/${listing.id}`} className="text-gray-600 hover:text-gray-500 text-sm">
                        {locale === 'pt' ? 'Editar' : 'Editar'}
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        disabled={deleting === listing.id}
                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === listing.id 
                          ? (locale === 'pt' ? 'Excluindo...' : 'Eliminando...')
                          : (locale === 'pt' ? 'Excluir' : 'Eliminar')
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{locale === 'pt' ? 'Nenhuma listagem ativa.' : 'No hay anuncios activos.'}</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



