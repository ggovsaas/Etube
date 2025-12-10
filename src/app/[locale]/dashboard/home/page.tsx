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

interface DashboardMetrics {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  inactiveListings: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  reportsReceived: number;
  reportsSent: number;
}

export default function DashboardHomePage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    inactiveListings: 0,
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
    reportsReceived: 0,
    reportsSent: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchMetrics();
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

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const listings = Array.isArray(data.listings) ? data.listings : [];
        
        const activeListings = listings.filter((l: any) => l && l.status === 'ACTIVE').length;
        const pendingListings = listings.filter((l: any) => l && l.status === 'PENDING').length;
        const inactiveListings = listings.filter((l: any) => l && l.status === 'INACTIVE').length;
        
        // Fetch reviews count if profile exists
        let totalReviews = 0;
        let averageRating = 0;
        if (data.user?.profile?.id) {
          try {
            const reviewsResponse = await fetch(`/api/reviews?profileId=${data.user.profile.id}&limit=1000`);
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json();
              const reviews = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
              totalReviews = reviews.length;
              if (totalReviews > 0) {
                const sum = reviews.reduce((acc: number, r: any) => acc + (r && r.rating ? r.rating : 0), 0);
                averageRating = sum / totalReviews;
              }
            }
          } catch (error) {
            console.error('Error fetching reviews:', error);
          }
        }

        setMetrics({
          totalListings: listings.length,
          activeListings,
          pendingListings,
          inactiveListings,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          totalViews: 0, // Placeholder - would need to track views
          reportsReceived: 0, // Placeholder - would need Report model
          reportsSent: 0, // Placeholder - would need Report model
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
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
        {/* Warning Banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-yellow-800">
                {locale === 'es' ? 'AVISO IMPORTANTE:' : 'AVISO IMPORTANTE:'}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {locale === 'es' 
                  ? 'Desde Escorttube nunca contactamos por Whatsapp, siempre lo hacemos por email y con dominio @escorttube.vip Si alguien se hace pasar por EscortTube por Whatsapp, ignóralo.'
                  : 'Desde Escorttube nunca contactamos por Whatsapp, sempre o fazemos por email e com domínio @escorttube.vip Se alguém se fizer passar por EscortTube por Whatsapp, ignore-o.'}
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Dashboard' : 'Panel de Control'}
        </h1>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Listings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Total de Anúncios' : 'Total de Anuncios'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalListings}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Listings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Anúncios Ativos' : 'Anuncios Activos'}
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">{metrics.activeListings}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Listings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Anúncios Pendentes' : 'Anuncios Pendientes'}
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pendingListings}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Avaliações' : 'Reseñas'}
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{metrics.totalReviews}</p>
                {metrics.averageRating > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {locale === 'pt' ? 'Média:' : 'Promedio:'} {metrics.averageRating} ⭐
                  </p>
                )}
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.118 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Reports Received */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Denúncias Recebidas' : 'Reportes Recibidos'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-2">{metrics.reportsReceived}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Reports Sent */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Denúncias Enviadas' : 'Reportes Enviados'}
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{metrics.reportsSent}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Profile Views */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {locale === 'pt' ? 'Visualizações do Perfil' : 'Visualizaciones del Perfil'}
                </p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">{metrics.totalViews}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {locale === 'pt' ? 'Ações Rápidas' : 'Acciones Rápidas'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/${locale}/criar-anuncio`}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{locale === 'pt' ? 'Criar Anúncio' : 'Crear Anuncio'}</span>
            </Link>
            <Link
              href={`/${locale}/dashboard/mis-anuncios`}
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{locale === 'pt' ? 'Meus Anúncios' : 'Mis Anuncios'}</span>
            </Link>
            <Link
              href={`/${locale}/dashboard/premium`}
              className="flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>{locale === 'pt' ? 'Premium' : 'Premium'}</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

