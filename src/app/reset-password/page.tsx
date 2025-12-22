'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // Detect browser language
  const [locale, setLocale] = useState('pt');
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    setLocale(['pt', 'es'].includes(browserLang) ? browserLang : 'pt');
  }, []);

  const t = {
    pt: {
      title: 'Redefinir Senha',
      subtitle: 'Digite sua nova senha',
      passwordLabel: 'Nova Senha',
      confirmPasswordLabel: 'Confirmar Nova Senha',
      submitButton: 'Redefinir Senha',
      resetting: 'Redefinindo...',
      successMessage: 'Senha redefinida com sucesso! Você pode agora fazer login.',
      goToLogin: 'Ir para Login',
      invalidToken: 'Link inválido ou expirado. Por favor, solicite um novo link de recuperação.',
      requestNew: 'Solicitar Novo Link',
      passwordMismatch: 'As senhas não coincidem',
      passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
      requiredFields: 'Todos os campos são obrigatórios',
    },
    es: {
      title: 'Restablecer Contraseña',
      subtitle: 'Ingresa tu nueva contraseña',
      passwordLabel: 'Nueva Contraseña',
      confirmPasswordLabel: 'Confirmar Nueva Contraseña',
      submitButton: 'Restablecer Contraseña',
      resetting: 'Restableciendo...',
      successMessage: '¡Contraseña restablecida con éxito! Ahora puedes iniciar sesión.',
      goToLogin: 'Ir al Login',
      invalidToken: 'Enlace inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.',
      requestNew: 'Solicitar Nuevo Enlace',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
      requiredFields: 'Todos los campos son obligatorios',
    },
  };

  const translations = t[locale as 'pt' | 'es'] || t.pt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!password || !confirmPassword) {
      setError(translations.requiredFields);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(translations.passwordTooShort);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(translations.passwordMismatch);
      setLoading(false);
      return;
    }

    if (!token) {
      setError(translations.invalidToken);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <p className="text-sm">{translations.invalidToken}</p>
            </div>
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="font-medium text-red-600 hover:text-red-500"
              >
                {translations.requestNew}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {translations.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {translations.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                <p className="text-sm">{translations.successMessage}</p>
              </div>
              <div className="text-center">
                <Link
                  href={`/${locale}/login`}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  {translations.goToLogin}
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {translations.passwordLabel}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {translations.confirmPasswordLabel}
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? translations.resetting : translations.submitButton}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
