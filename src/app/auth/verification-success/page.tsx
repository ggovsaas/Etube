'use client';

import { FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerificationSuccess() {
  const searchParams = useSearchParams();
  const alreadyVerified = searchParams.get('already-verified') === 'true';

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FaCheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {alreadyVerified ? 'Email Já Verificado' : 'Email Verificado com Sucesso!'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {alreadyVerified
              ? 'Seu email já estava verificado anteriormente.'
              : 'Sua conta foi verificada com sucesso. Agora você pode usar todos os recursos da plataforma.'}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
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

