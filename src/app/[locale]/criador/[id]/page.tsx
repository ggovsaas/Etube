'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ProfileHero, 
  SocialLinks, 
  GalleryGrid,
  ContactCard
} from '@/components/listing/ProfileComponents';
import { Card, SectionHeader } from '@/components/listing/UI';
import { Icons } from '@/components/listing/Icons';
import { ListingProfile } from '@/components/listing/types';
import VoiceWaveVisualizer from '@/components/VoiceWaveVisualizer';
import FavoriteButton from '@/components/FavoriteButton';

interface CreatorProfile {
  id: string;
  name: string;
  bio: string;
  profilePhoto: string | null;
  voiceNoteUrl: string | null;
  isVerified: boolean;
  city: string;
  age: number;
  publicPhoneVisibility: boolean;
  whatsappVisibility: boolean;
  phone: string | null;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  onlyfans?: string;
  media: { url: string; type: string }[];
  user: {
    id: string;
    isContentCreator: boolean;
    isServiceProvider: boolean;
  };
}

export default function CreatorProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const locale = (params?.locale as 'pt' | 'es') || 'pt';
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchCreatorProfile();
    }
  }, [userId]);

  const fetchCreatorProfile = async () => {
    try {
      const response = await fetch(`/api/creator/${userId}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'Este perfil não existe.'}</p>
          <Link
            href={`/${locale}/perfis`}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 inline-block"
          >
            Voltar aos Perfis
          </Link>
        </div>
      </div>
    );
  }

  // Map creator profile to ListingProfile format for reuse
  const mappedProfile: ListingProfile = {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    city: profile.city,
    description: profile.bio || '',
    profilePhoto: profile.profilePhoto || '',
    isVerified: profile.isVerified,
    phone: profile.phone || '',
    whatsappEnabled: profile.whatsappEnabled,
    telegramEnabled: profile.telegramEnabled,
    photos: profile.media.filter(m => m.type === 'PHOTO' || m.type === 'IMAGE').map(m => ({ url: m.url })),
    videos: profile.media.filter(m => m.type === 'VIDEO').map(m => ({ url: m.url })),
    services: [],
    pricing: {
      showOnProfile: false,
      rates: [],
    },
    physical: {},
    socials: [
      ...(profile.instagram ? [{ platform: 'Instagram', url: profile.instagram }] : []),
      ...(profile.twitter ? [{ platform: 'Twitter', url: profile.twitter }] : []),
      ...(profile.tiktok ? [{ platform: 'TikTok', url: profile.tiktok }] : []),
      ...(profile.onlyfans ? [{ platform: 'OnlyFans', url: profile.onlyfans }] : []),
    ],
    comparisonMedia: [],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-7xl mx-auto md:px-6 md:py-8">
        {/* Profile Hero */}
        <ProfileHero 
          profile={mappedProfile} 
          creatorId={profile.user.id}
          userRoles={{
            isContentCreator: profile.user.isContentCreator,
            isServiceProvider: profile.user.isServiceProvider,
          }}
        />

        <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 md:mt-0">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Me / Bio */}
            {profile.bio && (
              <section>
                <Card className="bg-white">
                  <SectionHeader title={locale === 'es' ? 'Sobre Mí' : 'Sobre Mim'} />
                  {/* Voice Note */}
                  {profile.voiceNoteUrl && (
                    <div className="mb-6">
                      <VoiceWaveVisualizer audioUrl={profile.voiceNoteUrl} />
                    </div>
                  )}
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </div>
                </Card>
              </section>
            )}

            {/* Gallery */}
            {profile.media.length > 0 && (
              <section>
                <SectionHeader title={locale === 'es' ? 'Galería' : 'Galeria'} />
                <GalleryGrid photos={mappedProfile.photos} />
              </section>
            )}

            {/* Socials Block */}
            {mappedProfile.socials.length > 0 && (
              <section className="mb-8">
                <SectionHeader title={locale === 'es' ? 'Redes Sociales' : 'Redes Sociais'} />
                <SocialLinks socials={mappedProfile.socials} />
              </section>
            )}
          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="hidden lg:block">
                <ContactCard
                  profile={mappedProfile}
                  creatorId={profile.user.id}
                  locale={locale}
                  userRoles={{
                    isContentCreator: profile.user.isContentCreator,
                    isServiceProvider: profile.user.isServiceProvider,
                  }}
                  contactSettings={{
                    publicPhoneVisibility: profile.publicPhoneVisibility,
                    whatsappVisibility: profile.whatsappVisibility,
                  }}
                  isOnline={profile.user.isOnline || false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 p-3 z-40 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {profile.whatsappVisibility && profile.whatsappEnabled && (
              <a
                href={`https://wa.me/${profile.phone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-[#25D366] text-white rounded-xl py-2.5 shadow-lg active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-1.5">
                  <Icons.WhatsApp size={20} />
                  <span className="text-sm font-bold">WhatsApp</span>
                </div>
              </a>
            )}
            {profile.publicPhoneVisibility && profile.phone && (
              <a 
                href={`tel:${profile.phone}`}
                className="flex flex-col items-center justify-center bg-red-600 text-white rounded-xl py-2.5 shadow-lg active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-1.5">
                  <Icons.Phone size={20} />
                  <span className="text-sm font-bold">Ligar</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

