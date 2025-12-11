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
  credits?: number;
  isPro?: boolean;
  proUntil?: string | null;
  paymentToken?: string | null; // Will be '***' if exists, null if not
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUSD: number;
  costPerCredit: number;
  discountPercent: number | null;
}

export default function PremiumPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchCreditPackages();
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

  const fetchCreditPackages = async () => {
    try {
      const response = await fetch('/api/credit-packages');
      if (response.ok) {
        const data = await response.json();
        setCreditPackages(Array.isArray(data.packages) ? data.packages : []);
      }
    } catch (error) {
      console.error('Error fetching credit packages:', error);
    }
  };

  const handleOneClickPurchase = async (packageId: string) => {
    if (!user?.paymentToken) {
      // No stored token, redirect to checkout
      handleCheckout(packageId);
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const response = await fetch('/api/purchase/credits/one-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: packageId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh user data to show updated credits
        await fetchUserData();
        alert(locale === 'pt' 
          ? `Sucesso! ${data.creditsAdded} créditos adicionados.` 
          : `¡Éxito! ${data.creditsAdded} créditos añadidos.`);
      } else {
        // If one-click fails, fall back to checkout
        if (data.requiresCheckout) {
          handleCheckout(packageId);
        } else {
          setError(data.error || (locale === 'pt' ? 'Erro ao comprar créditos' : 'Error al comprar créditos'));
        }
      }
    } catch (error) {
      console.error('Error in one-click purchase:', error);
      setError(locale === 'pt' ? 'Erro ao processar pagamento' : 'Error al procesar pago');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCheckout = async (packageId: string) => {
    setPurchasing(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          package: packageId, 
          email: user?.email,
          useStoredToken: false, // Force new checkout
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || (locale === 'pt' ? 'Erro ao iniciar pagamento' : 'Error al iniciar pago'));
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      setError(locale === 'pt' ? 'Erro ao conectar ao processador de pagamento' : 'Error al conectar al procesador de pago');
    } finally {
      setPurchasing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Créditos e Assinaturas' : 'Créditos y Suscripciones'}
        </h1>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Credits Balance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {locale === 'pt' ? 'Saldo de Créditos' : 'Saldo de Créditos'}
              </h2>
              <div className="text-3xl font-bold text-blue-600">{user?.credits || 0}</div>
            </div>
            <p className="text-sm text-gray-600">
              {locale === 'pt' 
                ? 'Use créditos para desbloquear conteúdo premium, fazer chamadas pagas e muito mais.'
                : 'Usa créditos para desbloquear contenido premium, hacer llamadas pagadas y mucho más.'}
            </p>
          </div>

          {/* Pro Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {locale === 'pt' ? 'Status PRO' : 'Estado PRO'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                user?.isPro 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.isPro 
                  ? (locale === 'pt' ? 'Ativo' : 'Activo')
                  : (locale === 'pt' ? 'Inativo' : 'Inactivo')}
              </span>
            </div>
            {user?.isPro && user?.proUntil && (
              <p className="text-sm text-gray-600">
                {locale === 'pt' ? 'Válido até' : 'Válido hasta'}: {new Date(user.proUntil).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES')}
              </p>
            )}
            {!user?.isPro && (
              <Link
                href={`/${locale}/precos`}
                className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {locale === 'pt' ? 'Assinar PRO →' : 'Suscribirse PRO →'}
              </Link>
            )}
          </div>
        </div>

        {/* Credit Packages */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'pt' ? 'Comprar Créditos' : 'Comprar Créditos'}
            </h2>
            <p className="text-gray-600">
              {locale === 'pt' 
                ? 'Quanto mais você compra, mais você economiza! (1 Crédito = $0.10)'
                : '¡Cuanto más compras, más ahorras! (1 Crédito = $0.10)'}
            </p>
            {user?.paymentToken && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {locale === 'pt' ? 'Método de pagamento salvo - Compra rápida disponível!' : 'Método de pago guardado - ¡Compra rápida disponible!'}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPackages.length > 0 ? (
              creditPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border-2 rounded-lg p-6 text-center ${
                    pkg.discountPercent && pkg.discountPercent > 15
                      ? 'border-yellow-400'
                      : pkg.discountPercent && pkg.discountPercent > 0
                      ? 'border-green-400'
                      : 'border-gray-200'
                  }`}
                >
                  {pkg.discountPercent && pkg.discountPercent > 0 && (
                    <div className={`text-xs font-medium px-2 py-1 rounded mb-2 ${
                      pkg.discountPercent > 15
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {pkg.discountPercent}% {locale === 'pt' ? 'Desconto' : 'Descuento'}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(pkg.priceUSD)}</div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">{pkg.credits} {locale === 'pt' ? 'Créditos' : 'Créditos'}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatCurrency(pkg.costPerCredit)} {locale === 'pt' ? 'por crédito' : 'por crédito'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      // Package ID should already be in correct format (e.g., 'credits_starter')
                      if (user?.paymentToken) {
                        handleOneClickPurchase(pkg.id);
                      } else {
                        handleCheckout(pkg.id);
                      }
                    }}
                    disabled={purchasing}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      purchasing && selectedPackage === pkg.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {purchasing && selectedPackage === pkg.id
                      ? (locale === 'pt' ? 'Processando...' : 'Procesando...')
                      : user?.paymentToken
                      ? (locale === 'pt' ? 'Comprar Agora' : 'Comprar Ahora')
                      : (locale === 'pt' ? 'Selecionar' : 'Seleccionar')}
                  </button>
                </div>
              ))
            ) : (
              // Fallback packages if API doesn't return data
              <>
                <div className="border-2 border-gray-200 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$25</div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">250 Créditos</p>
                  <p className="text-sm text-gray-500 mb-4">$0.10 por crédito</p>
                  <button
                    onClick={() => handleCheckout('credits_starter')}
                    disabled={purchasing}
                    className="w-full py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    {locale === 'pt' ? 'Selecionar' : 'Seleccionar'}
                  </button>
                </div>
                <div className="border-2 border-green-400 rounded-lg p-6 text-center">
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                    8.8% Desconto
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$50</div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">550 Créditos</p>
                  <p className="text-sm text-gray-500 mb-4">$0.091 por crédito</p>
                  <button
                    onClick={() => handleCheckout('credits_standard')}
                    disabled={purchasing}
                    className="w-full py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    {locale === 'pt' ? 'Selecionar' : 'Seleccionar'}
                  </button>
                </div>
                <div className="border-2 border-purple-400 rounded-lg p-6 text-center">
                  <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-2">
                    17% Desconto
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Pack</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$100</div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">1,200 Créditos</p>
                  <p className="text-sm text-gray-500 mb-4">$0.083 por crédito</p>
                  <button
                    onClick={() => handleCheckout('credits_pro')}
                    disabled={purchasing}
                    className="w-full py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    {locale === 'pt' ? 'Selecionar' : 'Seleccionar'}
                  </button>
                </div>
                <div className="border-2 border-yellow-400 rounded-lg p-6 text-center">
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mb-2">
                    23% Desconto
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">VIP Bulk</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">$250</div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">3,250 Créditos</p>
                  <p className="text-sm text-gray-500 mb-4">$0.077 por crédito</p>
                  <button
                    onClick={() => handleCheckout('credits_vip')}
                    disabled={purchasing}
                    className="w-full py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    {locale === 'pt' ? 'Selecionar' : 'Seleccionar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pro Subscriptions */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {locale === 'pt' ? 'Assinatura PRO' : 'Suscripción PRO'}
            </h2>
            <p className="text-purple-100">
              {locale === 'pt' 
                ? 'Recursos exclusivos para profissionais'
                : 'Recursos exclusivos para profesionales'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">1 {locale === 'pt' ? 'Mês' : 'Mes'}</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">$9.90</div>
              <button
                onClick={() => router.push(`/${locale}/precos`)}
                className="w-full py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition mt-4"
              >
                {locale === 'pt' ? 'Assinar' : 'Suscribirse'}
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 text-center border-2 border-green-400">
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                33% {locale === 'pt' ? 'Desconto' : 'Descuento'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3 {locale === 'pt' ? 'Meses' : 'Meses'}</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">$24</div>
              <button
                onClick={() => router.push(`/${locale}/precos`)}
                className="w-full py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition mt-4"
              >
                {locale === 'pt' ? 'Assinar' : 'Suscribirse'}
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 text-center border-2 border-yellow-400">
              <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mb-2">
                50% {locale === 'pt' ? 'Desconto' : 'Descuento'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">6 {locale === 'pt' ? 'Meses' : 'Meses'}</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">$36</div>
              <button
                onClick={() => router.push(`/${locale}/precos`)}
                className="w-full py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition mt-4"
              >
                {locale === 'pt' ? 'Assinar' : 'Suscribirse'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
