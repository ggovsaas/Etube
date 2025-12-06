'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

interface Story {
  id: string;
  mediaUrl: string;
  storyOrder: number;
  profileId: string;
  createdAt: string;
}

interface UserWithStories {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  stories: Story[];
  profileInfo?: {
    city: string;
    gender: string | null;
    profilePhoto: string | null;
  };
}

interface StoriesBarClientProps {
  locale?: 'pt' | 'es';
}

/**
 * Client-side StoriesBar component that fetches stories based on URL search params
 */
export default function StoriesBarClient({ locale = 'pt' }: StoriesBarClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // Get city from URL params, or try to get from common cities, or default to Lisboa
  const cityParam = searchParams.get('city');
  const city = cityParam || 'Lisboa'; // Default city
  const gender = searchParams.get('gender') || undefined;

  const [usersWithStories, setUsersWithStories] = useState<UserWithStories[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch stories from API
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('city', city);
        if (gender) {
          params.set('gender', gender);
        }

        const response = await fetch(`/api/stories?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }

        const data = await response.json();
        setUsersWithStories(data.users || []);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setProfilesWithStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [city, gender]);

  // Gender filter options
  const genderOptions = [
    { value: 'Woman', label: locale === 'es' ? 'Mujer' : 'Mulher' },
    { value: 'Man', label: locale === 'es' ? 'Hombre' : 'Homem' },
    { value: 'Trans', label: locale === 'es' ? 'Trans' : 'Trans' }
  ];

  // Build URL with updated gender filter
  const buildFilterUrl = (newGender?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('city', city);
    if (newGender) {
      params.set('gender', newGender);
    } else {
      params.delete('gender');
    }
    return `?${params.toString()}`;
  };

  return (
    <div className="w-full bg-gray-50 py-4 min-h-[140px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
      {/* Gender Filter Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {locale === 'es' ? 'Filtrar por:' : 'Filtrar por:'}
        </span>
        <Link
          href={`${pathname}${buildFilterUrl()}`}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !gender
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {locale === 'es' ? 'Todos' : 'Todos'}
        </Link>
        {genderOptions.map((option) => (
          <Link
            key={option.value}
            href={`${pathname}${buildFilterUrl(option.value)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              gender === option.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {/* Stories Horizontal Scroll */}
      {usersWithStories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            {locale === 'es'
              ? `No hay historias disponibles en ${city}${gender ? ` para ${genderOptions.find(g => g.value === gender)?.label}` : ''}`
              : `Não há histórias disponíveis em ${city}${gender ? ` para ${genderOptions.find(g => g.value === gender)?.label}` : ''}`}
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {usersWithStories.map((user) => {
            // Get the first story as preview (or use user image/profile photo as fallback)
            const previewImage = user.stories[0]?.mediaUrl || user.image || user.profileInfo?.profilePhoto;
            const storyCount = user.stories.length;
            const displayName = user.name || user.email.split('@')[0];

            return (
              <Link
                key={user.id}
                href={`/perfil/${user.profileInfo ? 'profile-' + user.id : user.id}/stories`}
                className="flex flex-col items-center gap-2 min-w-[80px] flex-shrink-0 group"
              >
                {/* Story Circle with Border Gradient */}
                <div className="relative w-16 h-16">
                  {/* Gradient Border (only show if has stories) */}
                  {storyCount > 0 ? (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500 via-pink-500 to-purple-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt={displayName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                            <span className="text-gray-400 text-xs font-medium">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full ring-2 ring-gray-300 overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-gray-400 text-xs font-medium">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Story Count Badge */}
                  {storyCount > 1 && (
                    <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {storyCount}
                    </div>
                  )}
                </div>
                {/* User Name */}
                <span className="text-xs text-gray-700 text-center max-w-[80px] truncate group-hover:text-red-600 transition-colors">
                  {displayName}
                </span>
              </Link>
            );
          })}
        </div>
      )}
        </>
      )}
      </div>
    </div>
  );
}

