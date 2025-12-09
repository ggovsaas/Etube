'use client';

import { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  profileId: string | number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FAVORITES_STORAGE_KEY = 'guest_favorites';

export default function FavoriteButton({ profileId, className = '', size = 'md' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we only access localStorage on client
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const favorites = getFavorites();
      setIsFavorited(favorites.includes(String(profileId)));
    }
  }, [profileId]);

  const getFavorites = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return [];
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof window === 'undefined') return;

    try {
      const favorites = getFavorites();
      const profileIdStr = String(profileId);
      
      if (favorites.includes(profileIdStr)) {
        // Remove from favorites
        const updated = favorites.filter(id => id !== profileIdStr);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
        setIsFavorited(false);
      } else {
        // Check if limit reached (50 favorites max)
        if (favorites.length >= 50) {
          alert('Você atingiu o limite de 50 favoritos. Remova alguns favoritos antes de adicionar novos.');
          return;
        }
        // Add to favorites
        favorites.push(profileIdStr);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (!mounted) {
    // Return placeholder during SSR
    return (
      <button
        className={`${className} bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition p-2`}
        aria-label="Favorite"
      >
        <i className="far fa-heart"></i>
      </button>
    );
  }

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`${className} ${sizeClasses[size]} bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200 ${
        isFavorited ? 'bg-red-600 bg-opacity-80' : ''
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <i className={isFavorited ? 'fas fa-heart' : 'far fa-heart'}></i>
    </button>
  );
}

// Helper function to get all favorites (exported for use in favorites page)
export function getGuestFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

