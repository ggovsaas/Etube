'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserLocale } from '@/lib/localeHelper';
import ContestBuilder from '@/components/dashboard/ContestBuilder';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: {
    id: string;
    name: string;
    age: number;
    city: string;
    description: string;
    isVerified: boolean;
    isOnline: boolean;
    rating: number;
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleLogout = async () => {
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Account Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Minha Conta</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="text-lg font-medium text-pink-600">{user.profile?.name || user.name || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ativa
                  </span>
                </div>
                <div className="pt-4">
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                    Upgrade para Premium
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Listings Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Free Listing Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Minhas Listagens</h2>
                <Link 
                  href={`/${getUserLocale()}/criar-anuncio`} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Criar Anúncio Grátis
                </Link>
              </div>
            </div>

            {/* Pending Listings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listagens Pendentes</h3>
              {listings.filter(l => l.status === 'PENDING').length > 0 ? (
                <div className="space-y-4">
                  {listings.filter(l => l.status === 'PENDING').map((listing) => (
                    <div key={listing.id} className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-pink-600">{listing.title}</h4>
                          <p className="text-gray-600">{listing.city}</p>
                          <p className="text-sm text-gray-500">Criado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs text-yellow-700 mt-2">⏳ Aguardando aprovação do administrador</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendente
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Link href={`/editar-anuncio/${listing.id}`} className="text-gray-600 hover:text-gray-500 text-sm">
                          Editar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma listagem pendente.</p>
              )}
            </div>

            {/* Active Listings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listagens Ativas</h3>
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
                            Ativo
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Link href={`/anuncio/${listing.id}`} className="text-indigo-600 hover:text-indigo-500 text-sm">
                          Ver
                        </Link>
                        <Link href={`/editar-anuncio/${listing.id}`} className="text-gray-600 hover:text-gray-500 text-sm">
                          Editar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma listagem ativa.</p>
              )}
            </div>

            {/* Contest Builder */}
            {user && (
              <ContestBuilder userId={user.id} locale={getUserLocale() as 'pt' | 'es'} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 