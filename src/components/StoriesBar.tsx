import React from 'react';
import Link from 'next/link';
import { getStoriesByFilters } from '@/lib/data/stories';

interface StoriesBarProps {
  city: string;
  gender?: string;
  locale?: 'pt' | 'es';
}

/**
 * StoriesBar Component - Instagram-style stories display with city and gender filtering
 * 
 * Displays a horizontal scrollable list of story circles, one per profile.
 * Each profile can have multiple stories that will be shown when clicked.
 */
export default async function StoriesBar({ city, gender, locale = 'pt' }: StoriesBarProps) {
  // Fetch stories based on filters
  const profilesWithStories = await getStoriesByFilters({ city, gender });

  // Gender filter options
  const genderOptions = [
    { value: 'Woman', label: locale === 'es' ? 'Mujer' : 'Mulher' },
    { value: 'Man', label: locale === 'es' ? 'Hombre' : 'Homem' },
    { value: 'Trans', label: locale === 'es' ? 'Trans' : 'Trans' }
  ];

  // Build URL with updated gender filter
  const buildFilterUrl = (newGender?: string) => {
    const params = new URLSearchParams();
    params.set('city', city);
    if (newGender) {
      params.set('gender', newGender);
    }
    return `?${params.toString()}`;
  };

  // Get current pathname (we'll use a relative path)
  const currentPath = locale === 'es' ? '/es/perfis' : '/pt/perfis';

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 px-4">
      {/* Gender Filter Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {locale === 'es' ? 'Filtrar por:' : 'Filtrar por:'}
        </span>
        <Link
          href={`${currentPath}${buildFilterUrl()}`}
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
            href={`${currentPath}${buildFilterUrl(option.value)}`}
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
      {profilesWithStories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            {locale === 'es'
              ? `No hay historias disponibles en ${city}${gender ? ` para ${genderOptions.find(g => g.value === gender)?.label}` : ''}`
              : `Não há histórias disponíveis em ${city}${gender ? ` para ${genderOptions.find(g => g.value === gender)?.label}` : ''}`}
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {profilesWithStories.map((profile) => {
            // Get the first story as preview (or use profile photo as fallback)
            const previewImage = profile.stories[0]?.mediaUrl || profile.profilePhoto;
            const storyCount = profile.stories.length;

            return (
              <Link
                key={profile.id}
                href={`/perfil/${profile.id}/stories`}
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
                            alt={profile.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                            <span className="text-gray-400 text-xs font-medium">
                              {profile.name.charAt(0).toUpperCase()}
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
                          alt={profile.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                          <span className="text-gray-400 text-xs font-medium">
                            {profile.name.charAt(0).toUpperCase()}
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
                {/* Profile Name */}
                <span className="text-xs text-gray-700 text-center max-w-[80px] truncate group-hover:text-red-600 transition-colors">
                  {profile.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}

