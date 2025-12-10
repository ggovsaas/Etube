'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function PremiumPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
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
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Premium' : 'Premium'}
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'pt' ? 'Upgrade para Premium' : 'Actualizar a Premium'}
            </h2>
            <p className="text-gray-700">
              {locale === 'pt' 
                ? 'Desbloqueie recursos exclusivos e aumente a visibilidade dos seus anúncios.'
                : 'Desbloquee recursos exclusivos y aumente la visibilidad de sus anuncios.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{locale === 'pt' ? 'Destaque' : 'Destacado'}</h3>
              <p className="text-sm text-gray-700">
                {locale === 'pt' ? 'Seus anúncios aparecem no topo' : 'Tus anuncios aparecen en la parte superior'}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{locale === 'pt' ? 'Mais Visualizações' : 'Más Visualizaciones'}</h3>
              <p className="text-sm text-gray-700">
                {locale === 'pt' ? 'Aumente sua visibilidade' : 'Aumenta tu visibilidad'}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{locale === 'pt' ? 'Suporte Prioritário' : 'Soporte Prioritario'}</h3>
              <p className="text-sm text-gray-700">
                {locale === 'pt' ? 'Atendimento preferencial' : 'Atención preferencial'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-8 rounded-lg transition duration-200">
              {locale === 'pt' ? 'Assinar Premium' : 'Suscribirse a Premium'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



