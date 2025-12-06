'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import VoiceWaveVisualizer from './VoiceWaveVisualizer';

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
  gallery?: string[]; // Array of gallery image URLs
  voiceNoteUrl?: string | null; // Voice note URL
}

export default function ProfileGrid({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Initialize gallery images
  useEffect(() => {
    const images = profile.gallery && profile.gallery.length > 0 
      ? profile.gallery 
      : [profile.image];
    setGalleryImages(images);
  }, [profile.gallery, profile.image]);

  // Auto-cycle through gallery on hover
  useEffect(() => {
    if (!isHovered || galleryImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, [isHovered, galleryImages.length]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0); // Reset to first image
  };

  const currentImage = galleryImages[currentImageIndex] || profile.image;

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Profile Image with Gallery Slider */}
      <div className="relative overflow-hidden">
        <img 
          src={currentImage} 
          alt={profile.name} 
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Gallery Navigation Arrows (only show on hover if multiple images) */}
        {isHovered && galleryImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition z-10"
              aria-label="Previous image"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition z-10"
              aria-label="Next image"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </>
        )}
        
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
        
        {/* Voice Wave Visualizer (Thumbnail) */}
        {profile.voiceNoteUrl && (
          <VoiceWaveVisualizer 
            audioUrl={profile.voiceNoteUrl} 
            variant="thumbnail"
            className="z-20"
          />
        )}
        
        {/* Favorite Button */}
        <div className="absolute bottom-3 right-3 z-10">
          <FavoriteButton profileId={profile.id} />
        </div>
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
  );
}
