'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserLocale } from '@/lib/localeHelper';

// Redirect to criar-anuncio page with edit mode
export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id as string;

  useEffect(() => {
    if (listingId) {
      const locale = getUserLocale();
      // Redirect to locale-aware criar-anuncio page with edit query param
      router.replace(`/${locale}/criar-anuncio?edit=${listingId}`);
    }
  }, [listingId, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando para edição...</p>
      </div>
    </div>
  );
} 