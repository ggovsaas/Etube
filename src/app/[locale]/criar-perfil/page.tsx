"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function CriarPerfilPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const { locale: currentLocale } = useLocale();
  
  const [accountType, setAccountType] = useState<'escort' | 'user'>('escort');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Translations
  const translations = {
    pt: {
      title: 'Criar Conta',
      accountType: 'Tipo de Conta',
      escort: 'Sou Escort',
      client: 'Sou Cliente',
      username: 'Nome de Utilizador',
      email: 'Email',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      create: 'Criar Conta',
      creating: 'Criando conta...',
      alreadyHaveAccount: 'Já tem uma conta?',
      login: 'Entrar',
      passwordMismatch: 'As senhas não coincidem',
      passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
      registrationFailed: 'Falha ao criar conta. Por favor, tente novamente.',
    },
    es: {
      title: 'Crear Cuenta',
      accountType: 'Tipo de Cuenta',
      escort: 'Soy Acompañante',
      client: 'Soy Cliente',
      username: 'Nombre de Usuario',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      create: 'Crear Cuenta',
      creating: 'Creando cuenta...',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      login: 'Iniciar Sesión',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
      registrationFailed: 'Error al crear cuenta. Por favor, inténtalo de nuevo.',
    },
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

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
      setError(t.passwordMismatch);
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(t.passwordTooShort);
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
      
      // Redirect to main dashboard with locale
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.registrationFailed);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-6">{t.title}</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.accountType}</label>
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg border ${accountType === 'escort' ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setAccountType('escort')}
              >
                {t.escort}
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-2 rounded-lg border ${accountType === 'user' ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                onClick={() => setAccountType('user')}
              >
                {t.client}
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.username}</label>
            <input 
              name="username"
              type="text" 
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900" 
              required 
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.email}</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900" 
              required 
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.password}</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900" 
              required 
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t.confirmPassword}</label>
            <input 
              name="confirmPassword"
              type="password" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 text-gray-900" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? t.creating : t.create}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          {t.alreadyHaveAccount}{' '}
          <Link href={`/${locale}/login`} className="text-pink-600 hover:underline">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}



