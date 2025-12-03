'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Profile {
  id: string;
  listingId?: string | null; // Listing ID for navigation to anuncio page
  name: string;
  age: number;
  city: string;
  price: number;
  rating: number;
  isVerified: boolean;
  isOnline: boolean;
  media: { url: string }[];
  _count: {
    reviews: number;
    questions: number;
  };
}

export default function SamePhoneProfilesPage() {
  const params = useParams();
  const phone = params.phone;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`/api/profiles/search?phone=${phone}`);
        const data = await response.json();
        setProfiles(data.profiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [phone]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Perfis com o mesmo número
          </h1>
          <p className="mt-2 text-gray-600">
            Encontrados {profiles.length} perfis com este número
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Link 
              href={profile.listingId ? `/anuncio/${profile.listingId}` : '#'} 
              key={profile.id}
              className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${!profile.listingId ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => !profile.listingId && e.preventDefault()}
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={profile.media[0]?.url || '/placeholder.jpg'}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                {profile.isOnline && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <i className="fas fa-circle text-xs mr-1"></i>Online
                  </div>
                )}
                {profile.isVerified && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span>{profile.age} anos</span>
                  <span className="mx-2">•</span>
                  <span>{profile.city}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 mr-1"></i>
                    <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 ml-1">({profile._count.reviews})</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.price}€/h
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 