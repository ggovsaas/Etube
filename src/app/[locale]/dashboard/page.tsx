'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { locale, getLocalizedPath } = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(getLocalizedPath('/login'));
      return;
    }

    // All authenticated users go to dashboard home (no role-based redirect)
    // The sidebar will show different items based on their roles
    router.replace(`/${locale}/dashboard/home`);
  }, [session, status, router, locale, getLocalizedPath]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locale === 'es' ? 'Cargando...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
