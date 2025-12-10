'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import { getTranslations } from '@/lib/i18n';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const { locale: currentLocale } = useLocale();
  const t = getTranslations(currentLocale);

  // Get redirect URL from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        sessionStorage.setItem('loginRedirect', redirect);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error || 'Login failed');
      }

      if (result?.ok) {
        // Wait a moment for session to be set, then check user role
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get session to check role
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        
        // Check for redirect URL
        const redirectUrl = typeof window !== 'undefined' ? sessionStorage.getItem('loginRedirect') : null;
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('loginRedirect');
        }
        
        // Redirect based on user role or redirect URL
        if (session?.user?.role === 'ADMIN') {
          // Admin users go to /admin (non-localized)
          router.push('/admin');
        } else if (redirectUrl) {
          // Handle redirect URL
          if (redirectUrl.startsWith('/admin')) {
            router.push('/admin');
          } else if (!redirectUrl.startsWith('/pt/') && !redirectUrl.startsWith('/es/')) {
            router.push(`/${locale}${redirectUrl}`);
          } else {
            router.push(redirectUrl);
          }
        } else {
          router.push(`/${locale}/dashboard`);
        }
        router.refresh(); // Refresh to update session
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const redirectUrl = typeof window !== 'undefined' ? sessionStorage.getItem('loginRedirect') : null;
      const callbackUrl = redirectUrl 
        ? (redirectUrl.startsWith('/pt/') || redirectUrl.startsWith('/es/') || redirectUrl.startsWith('/admin') 
          ? redirectUrl 
          : `/${locale}${redirectUrl}`)
        : `/${locale}/dashboard`;
      
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const redirectUrl = typeof window !== 'undefined' ? sessionStorage.getItem('loginRedirect') : null;
      const callbackUrl = redirectUrl 
        ? (redirectUrl.startsWith('/pt/') || redirectUrl.startsWith('/es/') || redirectUrl.startsWith('/admin') 
          ? redirectUrl 
          : `/${locale}${redirectUrl}`)
        : `/${locale}/dashboard`;
      
      await signIn('email', { 
        email,
        callbackUrl,
        redirect: true 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Email sign-in failed');
      setLoading(false);
    }
  };

  const loginText = locale === 'es' ? 'Iniciar Sesión' : 'Login';
  const emailLabel = locale === 'es' ? 'Correo electrónico' : 'Email';
  const passwordLabel = locale === 'es' ? 'Contraseña' : 'Senha';
  const submitText = locale === 'es' ? 'Iniciar Sesión' : 'Entrar';
  const noAccountText = locale === 'es' ? '¿No tienes una cuenta?' : 'Não tem uma conta?';
  const signUpText = locale === 'es' ? 'Regístrate' : 'Registe-se';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {loginText}
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {emailLabel}
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {passwordLabel}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? (locale === 'es' ? 'Cargando...' : 'Carregando...') : submitText}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {locale === 'es' ? 'O continúe con' : 'Ou continue com'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {locale === 'es' ? 'Continuar con Google' : 'Continuar com Google'}
              </button>

              {/* Email Magic Link Button */}
              <button
                type="button"
                onClick={handleEmailSignIn}
                disabled={loading || !email}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {locale === 'es' ? 'Enviar enlace mágico' : 'Enviar link mágico'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/criar-perfil`}
                className="font-medium text-red-600 hover:text-red-500"
              >
                {signUpText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



