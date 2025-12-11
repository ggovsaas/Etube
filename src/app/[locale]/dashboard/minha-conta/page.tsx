'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isPro: boolean;
  proUntil: string | null;
  credits: number;
  profile?: {
    id: string;
    name: string;
    age: number;
    city: string;
    phone: string | null;
  };
}

export default function MinhaContaPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {locale === 'pt' ? 'Carregando...' : 'Cargando...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === 'pt' ? 'Acesso Negado' : 'Acceso Denegado'}
            </h2>
            <p className="text-gray-600 mb-4">
              {locale === 'pt' 
                ? 'Você precisa estar logado para acessar esta página.' 
                : 'Necesitas estar conectado para acceder a esta página.'}
            </p>
            <Link href={`/${locale}/login`} className="text-red-600 hover:text-red-700">
              {locale === 'pt' ? 'Fazer Login' : 'Iniciar Sesión'}
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Minha Conta' : 'Mi Cuenta'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {locale === 'pt' ? 'Informações da Conta' : 'Información de la Cuenta'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'pt' ? 'Nome' : 'Nombre'}
                </label>
                <p className="text-gray-900">
                  {user.profile?.name || user.name || (locale === 'pt' ? 'Não definido' : 'No definido')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'pt' ? 'Papel' : 'Rol'}
                </label>
                <p className="text-gray-900 capitalize">{user.role.toLowerCase()}</p>
              </div>
              {user.profile && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'pt' ? 'Idade' : 'Edad'}
                    </label>
                    <p className="text-gray-900">{user.profile.age}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'pt' ? 'Cidade' : 'Ciudad'}
                    </label>
                    <p className="text-gray-900">{user.profile.city}</p>
                  </div>
                  {user.profile.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'pt' ? 'Telefone' : 'Teléfono'}
                      </label>
                      <p className="text-gray-900">{user.profile.phone}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Subscription & Credits */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {locale === 'pt' ? 'Assinatura e Créditos' : 'Suscripción y Créditos'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'pt' ? 'Status PRO' : 'Estado PRO'}
                </label>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.isPro 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isPro 
                      ? (locale === 'pt' ? 'Ativo' : 'Activo')
                      : (locale === 'pt' ? 'Inativo' : 'Inactivo')}
                  </span>
                  {!user.isPro && (
                    <Link
                      href={`/${locale}/precos`}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {locale === 'pt' ? 'Assinar →' : 'Suscribirse →'}
                    </Link>
                  )}
                </div>
                {user.isPro && user.proUntil && (
                  <p className="text-sm text-gray-600 mt-1">
                    {locale === 'pt' ? 'Válido até' : 'Válido hasta'}: {new Date(user.proUntil).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'pt' ? 'Créditos' : 'Créditos'}
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-blue-600">{user.credits || 0}</p>
                  <Link
                    href={`/${locale}/dashboard/premium`}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    {locale === 'pt' ? 'Comprar →' : 'Comprar →'}
                  </Link>
                </div>
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
              href={`/${locale}/dashboard/settings`}
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
            >
              <h3 className="font-medium text-gray-900 mb-1">
                {locale === 'pt' ? 'Configurações' : 'Configuración'}
              </h3>
              <p className="text-sm text-gray-600">
                {locale === 'pt' ? 'Alterar senha, privacidade, notificações' : 'Cambiar contraseña, privacidad, notificaciones'}
              </p>
            </Link>
            <Link
              href={`/${locale}/dashboard/dados-faturacao`}
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
            >
              <h3 className="font-medium text-gray-900 mb-1">
                {locale === 'pt' ? 'Dados de Faturação' : 'Datos de Facturación'}
              </h3>
              <p className="text-sm text-gray-600">
                {locale === 'pt' ? 'Informações de faturação e pagamento' : 'Información de facturación y pago'}
              </p>
            </Link>
            <Link
              href={`/${locale}/dashboard/premium`}
              className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition"
            >
              <h3 className="font-medium text-gray-900 mb-1">
                {locale === 'pt' ? 'Créditos e Assinaturas' : 'Créditos y Suscripciones'}
              </h3>
              <p className="text-sm text-gray-600">
                {locale === 'pt' ? 'Comprar créditos, assinar PRO' : 'Comprar créditos, suscribirse PRO'}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

