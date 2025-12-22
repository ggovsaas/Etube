'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserLocale } from '@/lib/localeHelper';

export default function CriarAnuncioRedirect() {
  const router = useRouter();

  useEffect(() => {
    const locale = getUserLocale();
    router.replace(`/${locale}/criar-anuncio`);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
