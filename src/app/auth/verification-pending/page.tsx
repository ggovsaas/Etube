'use client';

import { FaEnvelope, FaIdCard, FaCheck, FaClock } from 'react-icons/fa';
import Link from 'next/link';

export default function VerificationPending() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Verificação Pendente</h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor, complete as etapas de verificação para acessar sua conta
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Email Verification */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaEnvelope className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Verificação de Email</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    Enviamos um email de verificação para seu endereço. Por favor, verifique sua caixa de entrada e clique no link de confirmação.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Reenviar email
                  </button>
                </div>
              </div>
            </div>

            {/* ID Verification */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaIdCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Verificação de Identidade</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>
                    Nossa equipe está verificando sua identidade. Este processo pode levar até 24 horas.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Enviar documentos novamente
                  </button>
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaClock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Status da Verificação
                    </p>
                    <p className="text-sm text-gray-500">
                      Aguardando confirmação
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                Precisa de ajuda? Entre em contato com nosso suporte em{' '}
                <a href="mailto:support@example.com" className="text-red-600 hover:text-red-500">
                  support@example.com
                </a>
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Voltar para o Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 