'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

export default function DashboardPage() {
  const { locale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/dashboard/home`);
  }, [locale, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{locale === 'pt' ? 'Redirecionando...' : 'Redirigiendo...'}</p>
      </div>
    </div>
  );
}
