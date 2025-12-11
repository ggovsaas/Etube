'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';

// Currency formatting function
function formatCurrency(amount: number, locale: string): string {
  if (locale === 'pt' || locale.startsWith('pt')) {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  } else if (locale === 'es' || locale.startsWith('es')) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
  // Default to USD for other locales
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function PricingPage() {
  const { locale, t } = useLocale();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedTurbo, setSelectedTurbo] = useState<string>('');
  const [selectedCredits, setSelectedCredits] = useState<string>('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProCheckout = async () => {
    if (!selectedPlan || !email) {
      setError(locale === 'pt' ? 'Por favor, selecione um plano e insira seu email.' : 'Por favor, selecciona un plan e introduce tu email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || (locale === 'pt' ? 'Erro ao iniciar pagamento.' : 'Error al iniciar el pago.'));
      }
    } catch (err) {
      setError(locale === 'pt' ? 'Erro ao conectar ao processador de pagamento.' : 'Error al conectar con el procesador de pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsCheckout = async () => {
    if (!selectedCredits || !email) {
      setError(locale === 'pt' ? 'Por favor, selecione um pacote de créditos e insira seu email.' : 'Por favor, selecciona un paquete de créditos e introduce tu email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: selectedCredits, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || (locale === 'pt' ? 'Erro ao iniciar pagamento.' : 'Error al iniciar el pago.'));
      }
    } catch (err) {
      setError(locale === 'pt' ? 'Erro ao conectar ao processador de pagamento.' : 'Error al conectar con el procesador de pago.');
    } finally {
      setLoading(false);
    }
  };

  const isRTL = false;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.plansAndPricing}</h1>
          <p className="text-xl text-gray-600 text-expand-safe">{t.choosePerfectPlan}</p>
        </div>

        {/* Email Input */}
        <div className="mb-8 flex flex-col items-center">
          <input
            type="email"
            placeholder={t.yourEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white mb-2"
            disabled={loading}
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        </div>

        {/* Credit Packages - Responsive Grid */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">{t.buyCredits}</h2>
            <p className="text-blue-100 mb-6 text-expand-safe">
              {locale === 'pt'
                ? 'Compre créditos para usar na plataforma (1 Crédito = €0.10)'
                : 'Compra créditos para usar en la plataforma (1 Crédito = €0.10)'}
            </p>
            <p className="text-blue-200 text-sm">
              {locale === 'pt' ? 'Quanto mais você compra, mais você economiza!' : '¡Cuanto más compras, más ahorras!'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Starter Package */}
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(25, locale)}</div>
              <p className="text-lg font-semibold text-gray-700 mb-1">250 {locale === 'pt' ? 'Créditos' : 'Créditos'}</p>
              <p className="text-sm text-gray-500 mb-4">{formatCurrency(0.1, locale)} {locale === 'pt' ? 'por crédito' : 'por crédito'}</p>
              <button
                onClick={() => setSelectedCredits('credits_starter')}
                className={`w-full py-2 rounded-lg font-semibold transition btn-expand-safe ${
                  selectedCredits === 'credits_starter'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.select}
              </button>
            </div>

            {/* Standard Package */}
            <div className="bg-white rounded-lg p-6 text-center border-2 border-green-400">
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                8.8% {locale === 'pt' ? 'Desconto' : 'Descuento'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Standard</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(50, locale)}</div>
              <p className="text-lg font-semibold text-gray-700 mb-1">550 {locale === 'pt' ? 'Créditos' : 'Créditos'}</p>
              <p className="text-sm text-gray-500 mb-4">{formatCurrency(0.091, locale)} {locale === 'pt' ? 'por crédito' : 'por crédito'}</p>
              <button
                onClick={() => setSelectedCredits('credits_standard')}
                className={`w-full py-2 rounded-lg font-semibold transition btn-expand-safe ${
                  selectedCredits === 'credits_standard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.select}
              </button>
            </div>

            {/* Pro Pack */}
            <div className="bg-white rounded-lg p-6 text-center border-2 border-purple-400">
              <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mb-2">
                17% {locale === 'pt' ? 'Desconto' : 'Descuento'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Pack</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(100, locale)}</div>
              <p className="text-lg font-semibold text-gray-700 mb-1">1,200 {locale === 'pt' ? 'Créditos' : 'Créditos'}</p>
              <p className="text-sm text-gray-500 mb-4">{formatCurrency(0.083, locale)} {locale === 'pt' ? 'por crédito' : 'por crédito'}</p>
              <button
                onClick={() => setSelectedCredits('credits_pro')}
                className={`w-full py-2 rounded-lg font-semibold transition btn-expand-safe ${
                  selectedCredits === 'credits_pro'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.select}
              </button>
            </div>

            {/* VIP Bulk */}
            <div className="bg-white rounded-lg p-6 text-center border-2 border-yellow-400">
              <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mb-2">
                23% {locale === 'pt' ? 'Desconto' : 'Descuento'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">VIP Bulk</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(250, locale)}</div>
              <p className="text-lg font-semibold text-gray-700 mb-1">3,250 {locale === 'pt' ? 'Créditos' : 'Créditos'}</p>
              <p className="text-sm text-gray-500 mb-4">{formatCurrency(0.077, locale)} {locale === 'pt' ? 'por crédito' : 'por crédito'}</p>
              <button
                onClick={() => setSelectedCredits('credits_vip')}
                className={`w-full py-2 rounded-lg font-semibold transition btn-expand-safe ${
                  selectedCredits === 'credits_vip'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.select}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCreditsCheckout}
              disabled={loading || !selectedCredits}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 btn-expand-safe"
            >
              {loading ? (locale === 'pt' ? 'Aguarde...' : 'Espera...') : t.buyCredits}
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'pt' ? 'Métodos de Pagamento' : 'Métodos de Pago'}
            </h2>
            <p className="text-gray-600">
              {locale === 'pt' ? 'Pagamentos seguros e rápidos' : 'Pagos seguros y rápidos'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {locale === 'pt' ? 'Cartões' : 'Tarjetas'}
              </h3>
              <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">MB WAY</h3>
              <p className="text-sm text-gray-600">
                {locale === 'pt' ? 'Pagamento móvel português' : 'Pago móvil portugués'}
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-2xl">🏦</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Multibanco</h3>
              <p className="text-sm text-gray-600">
                {locale === 'pt' ? 'Transferência bancária' : 'Transferencia bancaria'}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 text-expand-safe">
              {locale === 'pt'
                ? 'Todos os pagamentos são processados de forma segura por processadores de pagamento especializados'
                : 'Todos los pagos se procesan de forma segura por procesadores de pago especializados'}
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href={`/${locale}`} className="text-red-600 hover:underline">
            {locale === 'pt' ? 'Voltar à página inicial' : 'Volver a la página inicial'}
          </Link>
        </div>
      </div>
    </div>
  );
}

