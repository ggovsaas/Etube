'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const { locale: currentLocale } = useLocale();

  const translations = {
    pt: {
      title: 'Recuperar Senha',
      subtitle: 'Digite seu email para receber o link de recuperação',
      emailLabel: 'Email',
      emailPlaceholder: 'seu-email@exemplo.com',
      submitButton: 'Enviar Link de Recuperação',
      sending: 'Enviando...',
      successMessage: 'Se existe uma conta com este email, você receberá um link de recuperação em breve. Verifique sua caixa de entrada.',
      backToLogin: 'Voltar para Login',
      requiredField: 'Email é obrigatório',
    },
    es: {
      title: 'Recuperar Contraseña',
      subtitle: 'Ingresa tu email para recibir el enlace de recuperación',
      emailLabel: 'Email',
      emailPlaceholder: 'tu-email@ejemplo.com',
      submitButton: 'Enviar Enlace de Recuperación',
      sending: 'Enviando...',
      successMessage: 'Si existe una cuenta con este email, recibirás un enlace de recuperación pronto. Revisa tu bandeja de entrada.',
      backToLogin: 'Volver al Login',
      requiredField: 'El email es obligatorio',
    },
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!email) {
      setError(t.requiredField);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
      setEmail(''); // Clear email field
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <p className="text-sm">{t.successMessage}</p>
              </div>
              <div className="text-center">
                <Link
                  href={`/${locale}/login`}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  {t.backToLogin}
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t.emailLabel}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? t.sending : t.submitButton}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href={`/${locale}/login`}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  {t.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
