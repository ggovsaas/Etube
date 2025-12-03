'use client';

import Link from 'next/link';
import type { Profile as ProfileType } from './ProfileGrid';

interface Profile extends ProfileType {
  description?: string;
}

export default function ProfileList({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <div key={profile.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="flex">
            {/* Profile Image */}
            <div className="relative w-48 h-32 flex-shrink-0">
              <img 
                src={profile.image} 
                alt={profile.name} 
                className="w-full h-full object-cover"
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
            
            {/* Profile Details */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                    <button className="text-gray-400 hover:text-red-600 transition">
                      <i className="far fa-heart text-lg"></i>
                    </button>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    <span>{profile.city}</span>
                    <span className="mx-2">•</span>
                    <span>{profile.age} anos</span>
                    <span className="mx-2">•</span>
                    <span>{profile.height}cm, {profile.weight}kg</span>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {Array.from({ length: profile.rating }).map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400 text-sm"></i>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">({profile.reviews} avaliações)</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {profile.description || ''}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-red-600">
                      €{profile.price}/hora
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                        <i className="fas fa-phone mr-1"></i>Contactar
                      </button>
                      <Link 
                        href={profile.listingId ? `/anuncio/${profile.listingId}` : '#'}
                        className={`bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium ${!profile.listingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => !profile.listingId && e.preventDefault()}
                      >
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 