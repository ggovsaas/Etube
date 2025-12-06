'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getGuestFavorites } from '@/components/FavoriteButton';
import type { Profile } from '@/components/ProfileGrid';

function FavoritesContent() {
  const params = useParams();
  const locale = (params?.locale as 'pt' | 'es') || 'pt';
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const favoriteIds = getGuestFavorites();
        
        if (favoriteIds.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Fetch all profiles
        const response = await fetch('/api/profiles');
        const data = await response.json();
        
        // Filter to only favorited profiles
        const favoritedProfiles = (data.profiles || [])
          .filter((profile: any) => favoriteIds.includes(String(profile.id)))
          .map((profile: any) => ({
            id: profile.id,
            listingId: profile.listingId || null,
            name: profile.name || 'Unknown',
            age: profile.age || 0,
            city: profile.city || 'Unknown',
            height: profile.height || 0,
            weight: profile.weight || 0,
            price: profile.price || profile.pricePerHour || 0,
            rating: profile.rating || 0,
            reviews: profile.reviews || 0,
            isOnline: profile.isOnline || false,
            isVerified: profile.isVerified || false,
            image: profile.imageUrl || '/placeholder-profile.jpg',
            description: profile.description || 'No description available',
            gallery: profile.gallery || [],
            voiceNoteUrl: profile.voiceNoteUrl || null,
          }));

        setFavorites(favoritedProfiles);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Favoritos
          </h1>
          <p className="text-gray-600">
            {favorites.length === 0 
              ? 'Você ainda não tem perfis favoritos.' 
              : `Você tem ${favorites.length} ${favorites.length === 1 ? 'perfil favorito' : 'perfis favoritos'}.`}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <i className="far fa-heart text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-500 mb-6">
              Comece a adicionar perfis aos seus favoritos para encontrá-los facilmente depois.
            </p>
            <Link
              href={`/${locale}/perfis`}
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Explorar Perfis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={profile.image} 
                    alt={profile.name} 
                    className="w-full h-64 object-cover"
                  />
                  
                  {profile.isOnline && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <i className="fas fa-circle text-xs mr-1"></i>Online
                    </div>
                  )}
                  
                  {profile.isVerified && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full">
                      <i className="fas fa-check text-xs"></i>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                    <span className="text-sm text-gray-500">{profile.age} anos</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    <span>{profile.city}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      <span>{profile.height}cm • {profile.weight}kg</span>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: profile.rating }).map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({profile.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold text-red-600">
                      €{profile.price}/hora
                    </div>
                    <Link 
                      href={profile.listingId ? `/anuncio/${profile.listingId}` : '#'}
                      className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium ${!profile.listingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <FavoritesContent />
    </Suspense>
  );
}

