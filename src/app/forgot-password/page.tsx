'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Detect browser language or use default (pt)
    const browserLang = navigator.language.split('-')[0]; // 'pt-BR' -> 'pt'
    const locale = ['pt', 'es'].includes(browserLang) ? browserLang : 'pt';

    // Redirect to localized page
    router.replace(`/${locale}/forgot-password`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
