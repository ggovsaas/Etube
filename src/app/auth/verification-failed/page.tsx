'use client';

import { FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerificationFailed() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'missing-token':
        return 'Link de verificação inválido. O token está faltando.';
      case 'invalid-token':
        return 'Link de verificação inválido ou expirado. Por favor, solicite um novo link de verificação.';
      case 'server-error':
        return 'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.';
      default:
        return 'Não foi possível verificar seu email. Por favor, tente novamente.';
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <FaExclamationCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verificação Falhou</h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage()}</p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Se você precisa de um novo link de verificação, entre em contato com o suporte ou tente fazer login novamente.
            </p>
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Fazer Login
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

