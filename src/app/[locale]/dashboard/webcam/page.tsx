'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function WebcamStudioPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const locale = (params?.locale as 'pt' | 'es') || 'pt';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

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
        // TODO: Check if user has completed Age/ID Verification
        // For now, we'll assume they need to verify
        setIsVerified(false);
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

  // If not verified, show verification requirement
  if (!isVerified) {
    return (
      <DashboardLayout user={user}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🆔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === 'es' ? 'Verificación Requerida' : 'Verificação Necessária'}
            </h1>
            <p className="text-gray-700 mb-6">
              {locale === 'es' 
                ? 'Para transmitir en vivo, debe completar la verificación de edad e identidad. Esto es necesario para cumplir con las regulaciones de plataformas de transmisión y requisitos legales para contenido para adultos.' 
                : 'Para transmitir ao vivo, você deve completar a verificação de idade e identidade. Isso é necessário para cumprir com as regulamentações de plataformas de transmissão e requisitos legais para conteúdo adulto.'}
            </p>
            <div className="bg-white rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold text-gray-900 mb-3">
                {locale === 'es' ? 'Proceso de Verificación:' : 'Processo de Verificação:'}
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>
                  {locale === 'es' 
                    ? 'Sube una foto de tu documento de identidad emitido por el gobierno (Pasaporte, Licencia de Conducir) con tu fecha de nacimiento claramente visible.' 
                    : 'Envie uma foto do seu documento de identidade emitido pelo governo (Passaporte, Carteira de Motorista) com sua data de nascimento claramente visível.'}
                </li>
                <li>
                  {locale === 'es' 
                    ? 'Toma una foto de ti mismo sosteniendo el ID junto a tu cara para verificación de identidad uno a uno.' 
                    : 'Tire uma foto de si mesmo segurando o ID ao lado do seu rosto para verificação de identidade um a um.'}
                </li>
              </ol>
            </div>
            <Link
              href={`/${locale}/dashboard/verificar-fotos`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              {locale === 'es' ? 'Iniciar Verificación' : 'Iniciar Verificação'}
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main webcam studio interface (to be implemented)
  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'es' ? 'Webcam Studio' : 'Webcam Studio'}
          </h1>
          <p className="text-gray-600">
            {locale === 'es' 
              ? 'Transmite en vivo y gestiona tus sesiones de webcam.' 
              : 'Transmita ao vivo e gerencie suas sessões de webcam.'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            {locale === 'es' 
              ? 'La funcionalidad de transmisión en vivo estará disponible próximamente.' 
              : 'A funcionalidade de transmissão ao vivo estará disponível em breve.'}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}



