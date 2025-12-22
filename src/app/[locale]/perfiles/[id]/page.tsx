'use client';

// Redirect /perfis/[id] to /anuncio/[id] to use the new listing UI
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProfilePageRedirect() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  useEffect(() => {
    if (profileId) {
      // Redirect to anuncio page with the same ID
      router.replace(`/anuncio/${profileId}`);
    }
  }, [profileId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Redirecionando...</div>
    </div>
  );
}
