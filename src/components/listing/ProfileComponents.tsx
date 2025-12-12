'use client';

import React, { useState } from 'react';
import { ListingProfile, PricingRate, SocialMedia } from './types';
import { Icons } from './Icons';
import { Badge } from './UI';
import Link from 'next/link';
import WishlistWidget from '@/components/WishlistWidget';
import FavoriteButton from '@/components/FavoriteButton';
import VoiceWaveVisualizer from '@/components/VoiceWaveVisualizer';
import GreenDotIndicator from '@/components/GreenDotIndicator';

// Helper to get safe image URL
const getImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://via.placeholder.com/400x600?text=Image';
  // Allow http/https URLs and relative paths (they might be served by the app)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // For relative paths, try to use them (they might be served by Next.js)
  if (url.startsWith('/')) {
    return url;
  }
  // Fallback for invalid URLs
  return 'https://via.placeholder.com/400x600?text=Image';
};

// --- Profile Hero Section ---
export const ProfileHero: React.FC<{ 
  profile: ListingProfile;
  creatorId?: string;
  userRoles?: {
    isContentCreator?: boolean;
    isServiceProvider?: boolean;
  };
  isOnline?: boolean;
}> = ({ profile, creatorId, userRoles, isOnline = false }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = 'https://via.placeholder.com/400x600?text=Profile+Image';
    target.onerror = null;
  };

  const mainImage = getImageUrl(profile.gallery?.[0]?.url);

  return (
    <>
      {/* Mobile Header: Full-width image with overlay */}
      <div className="md:hidden relative w-full aspect-[4/5] overflow-hidden">
        <img 
          src={mainImage} 
          alt={profile.name} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
        {/* Favorite Button - Mobile */}
        <div className="absolute top-4 right-4 z-20">
          <FavoriteButton profileId={profile.id} />
        </div>
        {/* Green Dot - Mobile */}
        {isOnline && (
          <div className="absolute top-4 left-4 z-20">
            <GreenDotIndicator isOnline={isOnline} size="md" />
          </div>
        )}
        {/* Voice Wave - Mobile */}
        {(profile as any).voiceNoteUrl && (
          <div className="absolute bottom-20 left-4 z-20">
            <VoiceWaveVisualizer audioUrl={(profile as any).voiceNoteUrl} variant="thumbnail" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full p-5">
          <div className="flex items-center gap-2 mb-2">
            {profile.physical.gender && (
              <Badge 
                label={profile.physical.gender} 
                variant="accent" 
                className="border-none bg-white/20 text-white backdrop-blur-md" 
              />
            )}
            {profile.verified && (
              <span className="flex items-center gap-1.5 text-white text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 px-3 py-1.5 rounded-full shadow-md shadow-red-600/30 border border-red-500/20">
                <Icons.Verified size={12} className="fill-current" />
                <span>Verificada</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {profile.name}, {profile.age}
          </h1>
          <div className="flex items-center gap-2 text-gray-200 text-sm">
            <Icons.Location size={14} className="text-red-500" />
            {profile.neighborhood && `${profile.neighborhood}, `}{profile.city}
          </div>
        </div>
      </div>

      {/* Desktop Header: Split Layout */}
      <div className="hidden md:grid grid-cols-12 gap-8 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Left: Main Photo */}
        <div className="col-span-5 relative h-[500px] rounded-xl overflow-hidden shadow-md group">
          <img 
            src={mainImage} 
            alt={profile.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={handleImageError}
          />
          {profile.verified && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/40 border border-red-500/30 backdrop-blur-sm z-10">
              <Icons.Verified size={16} className="fill-current" />
              <span>Verificada</span>
            </div>
          )}
          {/* Favorite Button - Desktop */}
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton profileId={profile.id} />
          </div>
          {/* Green Dot - Desktop */}
          {isOnline && (
            <div className="absolute top-4 left-4 z-10">
              <GreenDotIndicator isOnline={isOnline} size="md" />
            </div>
          )}
          {/* Voice Wave - Desktop */}
          {(profile as any).voiceNoteUrl && (
            <div className="absolute bottom-4 left-4 z-20">
              <VoiceWaveVisualizer audioUrl={(profile as any).voiceNoteUrl} variant="thumbnail" />
            </div>
          )}
        </div>

        {/* Right: Info & Stats */}
        <div className="col-span-7 flex flex-col justify-center py-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-3 flex-wrap">
                {profile.physical.gender && (
                  <Badge label={profile.physical.gender} variant="accent" />
                )}
                <Badge label="Disponível Agora" variant="brand" />
                {profile.verified && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-xs font-bold shadow-md shadow-red-600/30 border border-red-500/20">
                    <Icons.Verified size={14} className="fill-current" />
                    <span>Verificada</span>
                  </div>
                )}
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
                <span>{profile.name} <span className="text-gray-400 font-light">, {profile.age}</span></span>
                {profile.verified && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-sm font-bold shadow-lg shadow-red-600/40 border border-red-500/30 hover:shadow-xl hover:shadow-red-600/50 transition-all">
                    <Icons.Verified size={18} className="fill-current" />
                    <span>Verificada</span>
                  </div>
                )}
              </h1>
              <div className="flex items-center gap-4 text-gray-500 text-lg mb-6">
                <span className="flex items-center gap-1">
                  <Icons.Location size={18} className="text-red-600" />
                  {profile.neighborhood && `${profile.neighborhood}, `}{profile.city}
                </span>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {profile.physical.height && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold">Altura</span>
                    <span className="block font-semibold text-gray-900">{profile.physical.height}</span>
                  </div>
                )}
                {profile.physical.weight && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold">Peso</span>
                    <span className="block font-semibold text-gray-900">{profile.physical.weight}</span>
                  </div>
                )}
                {profile.physical.eyeColor && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-bold">Olhos</span>
                    <span className="block font-semibold text-gray-900">{profile.physical.eyeColor}</span>
                  </div>
                )}
              </div>

              {/* Call To Actions */}
              <div className="flex gap-4 mt-auto">
                {profile.whatsappEnabled && (
                  <a
                    href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    <Icons.WhatsApp size={22} /> WhatsApp
                  </a>
                )}
                <a 
                  href={`tel:${profile.phone}`}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-red-900/10 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <Icons.Phone size={22} /> Ver Telefone
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Physical Stats Grid ---
export const PhysicalStats: React.FC<{ physical: ListingProfile['physical'] }> = ({ physical }) => {
  const StatItem = ({ label, value, icon: Icon }: { label: string, value: string | boolean | undefined, icon: any }) => {
    if (!value && value !== false) return null;
    
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <div className="p-2 bg-white rounded-full text-red-600 shadow-sm border border-gray-100">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-gray-800">
            {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <StatItem label="Altura" value={physical.height} icon={Icons.Height} />
      <StatItem label="Peso" value={physical.weight} icon={Icons.Weight} />
      <StatItem label="Corpo" value={physical.bodyType} icon={Icons.Body} />
      <StatItem label="Busto" value={physical.bustSize ? `${physical.bustSize} (${physical.bustType})` : undefined} icon={Icons.Bust} />
      <StatItem label="Olhos" value={physical.eyeColor} icon={Icons.Eyes} />
      <StatItem label="Cabelo" value={physical.hairColor} icon={Icons.Service} />
      <StatItem label="Etnia" value={physical.ethnicity} icon={Icons.Ethnicity} />
      <StatItem label="Pés" value={physical.shoeSize} icon={Icons.Shoe} />
      <StatItem label="Fumante" value={physical.smoker} icon={Icons.Tattoo} />
      {physical.languages.length > 0 && (
        <StatItem label="Idiomas" value={physical.languages.join(', ')} icon={Icons.Language} />
      )}
    </div>
  );
};

// --- Social Media Links ---
export const SocialLinks: React.FC<{ socials: SocialMedia[] }> = ({ socials }) => {
  if (!socials || socials.length === 0) return null;

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Icons.Instagram />;
      case 'twitter': return <Icons.Twitter />;
      case 'whatsapp_business': return <Icons.WhatsApp />;
      case 'onlyfans': return <Icons.OnlyFans />;
      default: return <Icons.Share />;
    }
  };

  const getColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white';
      case 'twitter': return 'bg-black text-white';
      case 'onlyfans': return 'bg-blue-500 text-white';
      case 'whatsapp_business': return 'bg-green-600 text-white';
      default: return 'bg-gray-800 text-white';
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {socials.map((social, idx) => (
        <a 
          key={idx} 
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-transform hover:scale-105 shadow-sm w-full sm:w-auto justify-center sm:justify-start ${getColor(social.platform)}`}
        >
          {getIcon(social.platform)}
          <span className="capitalize font-bold text-sm">{social.platform.replace('_', ' ')}</span>
        </a>
      ))}
    </div>
  );
};

// --- Pricing Table ---
export const PricingTable: React.FC<{ pricing: ListingProfile['pricing'] }> = ({ pricing }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'outcall'>('local');

  if (!pricing.showOnProfile) return null;

  const renderRates = (rates: PricingRate[]) => {
    if (!rates || rates.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhuma tarifa disponível
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-4">
        {rates.map((rate, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-gray-600 font-medium capitalize flex items-center gap-2">
              <Icons.Duration size={16} className="text-gray-400" />
              {rate.duration}
            </span>
            <span className="text-red-600 font-bold text-lg">
              {rate.currency} {rate.price}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            activeTab === 'local' 
              ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setActiveTab('outcall')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            activeTab === 'outcall' 
              ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Deslocação
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'local' ? renderRates(pricing.localRates) : renderRates(pricing.outcallRates)}
      </div>

      {/* Extras - All grouped together */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
          <span className="uppercase text-[10px] tracking-wider font-bold text-gray-400">Pagamento</span>
          <span className="font-bold text-gray-800">
            {pricing.acceptsCard ? "Cartão & Dinheiro" : "Apenas Dinheiro"}
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
          <span className="uppercase text-[10px] tracking-wider font-bold text-gray-400">Promoção</span>
          <span className={`font-bold ${pricing.regularDiscount ? "text-green-600" : "text-gray-400"}`}>
            {pricing.regularDiscount ? "Desc. para Regulares" : "Sem descontos"}
          </span>
        </div>
        {pricing.minDuration && pricing.minDuration.trim() !== '' && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
            <span className="uppercase text-[10px] tracking-wider font-bold text-gray-400">Duração mínima</span>
            <span className="font-bold text-gray-800">{pricing.minDuration}</span>
          </div>
        )}
        {pricing.noticeRequired && pricing.noticeRequired.trim() !== '' && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
            <span className="uppercase text-[10px] tracking-wider font-bold text-gray-400">Aviso prévio</span>
            <span className="font-bold text-gray-800">{pricing.noticeRequired}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Gallery Grid ---
export const GalleryGrid: React.FC<{ images: ListingProfile['gallery'] }> = ({ images }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Available';
    target.onerror = null;
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {images.map((img) => (
        <div key={img.id} className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer shadow-sm bg-gray-100">
          <img 
            src={getImageUrl(img.url)} 
            alt="Gallery" 
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        </div>
      ))}
    </div>
  );
};

// --- Comparison Videos ---
export const ComparisonVideos: React.FC<{ videos: ListingProfile['comparisonMedia'] }> = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {videos.map((media) => {
        const thumbnailUrl = getImageUrl(media.thumbnail || media.url);
        
        return (
          <div key={media.id} className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
            <img 
              src={thumbnailUrl} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Video+Thumbnail';
                e.currentTarget.onerror = null;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Icons.Video size={24} className="fill-current" />
              </div>
            </div>
            {media.isVerification && (
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                VERIFICADO
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Service Tags ---
export const ServiceTags: React.FC<{ services: string[] }> = ({ services }) => {
  if (!services || services.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {services.map((service, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-white hover:shadow-md hover:border-red-200 transition-all rounded-lg text-sm text-gray-700 border border-gray-200 cursor-default"
        >
          <Icons.CheckCircle2 size={16} className="text-red-600" />
          <span className="font-medium">{service}</span>
        </div>
      ))}
    </div>
  );
};

// --- Contact Card (Sidebar) ---
export const ContactCard: React.FC<{ 
  profile: ListingProfile; 
  creatorId?: string; 
  locale?: 'pt' | 'es';
  userRoles?: {
    isContentCreator?: boolean;
    isServiceProvider?: boolean;
  };
  contactSettings?: {
    publicPhoneVisibility?: boolean;
    whatsappVisibility?: boolean;
  };
  isOnline?: boolean;
}> = ({ profile, creatorId, locale = 'pt', userRoles, contactSettings, isOnline = false }) => {
  // For creators, check visibility settings; for escorts, use defaults
  const showPhone = userRoles?.isContentCreator 
    ? (contactSettings?.publicPhoneVisibility ?? false)
    : true; // Escorts always show phone
  const showWhatsApp = userRoles?.isContentCreator
    ? (contactSettings?.whatsappVisibility ?? false)
    : (profile.whatsappEnabled ?? false); // Escorts use profile setting

  return (
    <div className="bg-white border border-red-100 rounded-xl shadow-lg shadow-red-900/5 p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icons.Phone size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Interessado?</h3>
        <p className="text-gray-500 text-sm">Entre em contato agora</p>
      </div>
      
      {/* Contact Buttons - Unified height (py-3.5) and width (w-full) */}
      <div className="space-y-3">
        {showWhatsApp && (
          <a 
            href={isOnline ? `https://wa.me/${profile.phone.replace(/\D/g, '')}` : '#'}
            target={isOnline ? "_blank" : undefined}
            rel={isOnline ? "noopener noreferrer" : undefined}
            onClick={(e) => {
              if (!isOnline) {
                e.preventDefault();
                alert(locale === 'pt' ? 'Usuário está offline. Tente mais tarde.' : 'Usuario está offline. Intenta más tarde.');
              }
            }}
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              isOnline
                ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-green-900/10'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Icons.WhatsApp size={20} /> WhatsApp
          </a>
        )}
        {profile.telegramEnabled && (
          <a 
            href={isOnline ? `https://t.me/${profile.phone.replace(/\D/g, '')}` : '#'}
            target={isOnline ? "_blank" : undefined}
            rel={isOnline ? "noopener noreferrer" : undefined}
            onClick={(e) => {
              if (!isOnline) {
                e.preventDefault();
                alert(locale === 'pt' ? 'Usuário está offline. Tente mais tarde.' : 'Usuario está offline. Intenta más tarde.');
              }
            }}
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              isOnline
                ? 'bg-[#0088cc] hover:bg-[#007ebd] text-white shadow-sky-900/10'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Icons.Telegram size={20} /> Telegram
          </a>
        )}
        {showPhone && (
          <a 
            href={`tel:${profile.phone}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 bg-red-600 hover:bg-red-700 text-white shadow-red-900/10"
          >
            <Icons.Phone size={20} /> {locale === 'es' ? 'Ver Teléfono' : 'Ver Telefone'}
          </a>
        )}
      </div>

      {/* Separator */}
      {(showPhone || showWhatsApp || profile.telegramEnabled) && (
        <div className="border-t border-gray-200 my-4"></div>
      )}

      {/* Action Buttons: Gift Me, Tip Me - Unified styling with motion effects */}
      <div className="space-y-3">
        {/* Gift Me Button - Full width with motion effect */}
        {creatorId && (
          <Link
            href={`/${locale}/wishlist/${creatorId}`}
            className="group flex items-center justify-between w-full py-3.5 px-4 bg-white border-2 border-red-200 hover:border-red-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-900/10 active:scale-[0.98] hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 group-hover:bg-red-100 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {locale === 'es' ? 'Comprar Regalo' : 'Comprar Presente'}
                </p>
                <p className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {locale === 'es' ? 'Lista de deseos' : 'Lista de desejos'}
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Tip Me Button - Full width with motion effect */}
        <button
          onClick={() => {
            // TODO: Open tip modal
            alert(locale === 'es' ? 'Función de propina próximamente' : 'Função de gorjeta em breve');
          }}
          className="group flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md shadow-yellow-900/20 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-900/30 active:scale-[0.98] hover:-translate-y-0.5 hover:scale-105"
        >
          <div className="w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-all group-hover:rotate-12">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {locale === 'es' ? 'Propina' : 'Gorjeta'}
        </button>

        {/* Contest/Poll Button - Only show if user is Content Creator or Service Provider */}
        {(userRoles?.isContentCreator || userRoles?.isServiceProvider) && (
          <button
            onClick={() => {
              // TODO: Open contest/poll modal
              alert(locale === 'es' ? 'Función de concursos próximamente' : 'Função de concursos em breve');
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-md shadow-purple-900/10 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            {locale === 'es' ? 'Concursos' : 'Concursos'}
          </button>
        )}
      </div>
    </div>
  );
};


