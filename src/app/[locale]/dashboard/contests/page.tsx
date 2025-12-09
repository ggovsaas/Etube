'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ContestBuilder from '@/components/dashboard/ContestBuilder';

export default function ContestsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const locale = (params?.locale as 'pt' | 'es') || 'pt';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

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

  if (loading || status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {locale === 'es' ? 'Cargando...' : 'Carregando...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === 'es' ? 'Acceso Denegado' : 'Acesso Negado'}
            </h2>
            <p className="text-gray-600 mb-4">
              {locale === 'es' 
                ? 'Necesitas estar conectado para acceder a esta página.' 
                : 'Você precisa estar logado para acessar esta página.'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'es' ? 'Gestión de Rifas' : 'Gestão de Rifas'}
          </h1>
          <p className="text-gray-600">
            {locale === 'es' 
              ? 'Crea y gestiona rifas para tus anuncios. Los usuarios pueden comprar entradas para ganar premios.' 
              : 'Crie e gerencie rifas para seus anúncios. Os usuários podem comprar entradas para ganhar prêmios.'}
          </p>
        </div>

        <ContestBuilder userId={user.id} locale={locale} />
      </div>
    </DashboardLayout>
  );
}

