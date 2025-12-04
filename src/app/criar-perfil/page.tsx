"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function CriarPerfilPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'escort' | 'user'>('escort');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Detect and store locale on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      let detectedLocale = 'pt'; // default
      
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer);
          const pathname = referrerUrl.pathname;
          if (pathname.startsWith('/es/')) {
            detectedLocale = 'es';
          } else if (pathname.startsWith('/pt/')) {
            detectedLocale = 'pt';
          } else {
            // Check browser language
            const browserLang = navigator.language || navigator.languages?.[0] || 'pt';
            detectedLocale = browserLang.startsWith('es') ? 'es' : 'pt';
          }
        } catch (e) {
          // If referrer parsing fails, try browser language
          const browserLang = navigator.language || navigator.languages?.[0] || 'pt';
          detectedLocale = browserLang.startsWith('es') ? 'es' : 'pt';
        }
      } else {
        // No referrer, check browser language
        const browserLang = navigator.language || navigator.languages?.[0] || 'pt';
        detectedLocale = browserLang.startsWith('es') ? 'es' : 'pt';
      }
      
      sessionStorage.setItem('userLocale', detectedLocale);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountType,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const result = await response.json();
      
      // Redirect to main dashboard with locale (user will be automatically logged in)
      const { getUserLocale } = await import('@/lib/localeHelper');
      const locale = getUserLocale();
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">Criar Conta</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg border ${accountType === 'escort' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setAccountType('escort')}
              >
                Sou Escort
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg border ${accountType === 'user' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setAccountType('user')}
              >
                Sou Cliente
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome de Utilizador</label>
            <input 
              name="username"
              type="text" 
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900" 
              required 
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900" 
              required 
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900" 
              required 
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
            <input 
              name="confirmPassword"
              type="password" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-900" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continue com</span>
            </div>
          </div>

          {/* Google OAuth Signup Button */}
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setError('');
              try {
                const userLocale = typeof window !== 'undefined' ? sessionStorage.getItem('userLocale') || 'pt' : 'pt';
                await signIn('google', {
                  callbackUrl: `/${userLocale}/dashboard`,
                  redirect: true,
                });
              } catch (error) {
                setError(error instanceof Error ? error.message : 'Google sign-up failed');
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="mt-4 w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Criar conta com Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-red-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
} 