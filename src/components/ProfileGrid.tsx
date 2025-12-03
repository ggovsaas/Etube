'use client';

import Link from 'next/link';

export interface Profile {
  id: number;
  listingId?: string | null; // Listing ID for navigation to anuncio page
  name: string;
  age: number;
  city: string;
  height: number;
  weight: number;
  price: number;
  rating: number;
  reviews: number;
  isOnline: boolean;
  isVerified: boolean;
  image: string;
}

export default function ProfileGrid({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <div key={profile.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
          {/* Profile Image */}
          <div className="relative">
            <img 
              src={profile.image} 
              alt={profile.name} 
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Status Badge */}
            {profile.isOnline && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <i className="fas fa-circle text-xs mr-1"></i>Online
              </div>
            )}
            
            {/* Verified Badge */}
            {profile.isVerified && (
              <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full">
                <i className="fas fa-check text-xs"></i>
              </div>
            )}
            
            {/* Favorite Button */}
            <button className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition">
              <i className="far fa-heart"></i>
            </button>
          </div>
          
          {/* Profile Info */}
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
                onClick={(e) => !profile.listingId && e.preventDefault()}
              >
                Ver Perfil
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 