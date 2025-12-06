'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ProfileHero, 
  PhysicalStats, 
  SocialLinks, 
  PricingTable, 
  GalleryGrid,
  ComparisonVideos,
  ServiceTags,
  ContactCard
} from '@/components/listing/ProfileComponents';
import { Card, SectionHeader, Badge } from '@/components/listing/UI';
import { Icons } from '@/components/listing/Icons';
import { ListingProfile } from '@/components/listing/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ListingData {
  id: string;
  title: string;
  description: string;
  city: string;
  age: number;
  phone: string;
  services: string;
  status: string;
  minDuration?: string;
  advanceNotice?: string;
  acceptsCard?: boolean;
  regularDiscount?: string;
  price?: number;
  createdAt: string;
  media: { url: string; type: string }[];
  images: { url: string }[];
  userId?: string;
  user: {
    id?: string;
    profile: {
      name: string;
      age: number;
      description: string;
      neighborhood?: string;
      gender?: string;
      weight?: string;
      height?: string;
      ethnicity?: string;
      eyeColor?: string;
      hairColor?: string;
      shoeSize?: string;
      tattoos?: string;
      piercings?: string;
      smoker?: string;
      languages?: string;
      bodyType?: string;
      breastSize?: string;
      breastType?: string;
      personalityTags?: string[] | string;
      whatsappEnabled?: boolean;
      telegramEnabled?: boolean;
      isVerified?: boolean;
      onlyfans?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      snapchat?: string;
      telegramChannel?: string;
      whatsappBusiness?: string;
      manyvids?: string;
      chaturbate?: string;
      myfreecams?: string;
      livejasmin?: string;
      linkHubUrl?: string;
    };
  };
}

// Map API data to ListingProfile interface
function mapListingToProfile(listing: ListingData): ListingProfile {
  try {
    const profile = listing.user?.profile || {};
    
    // Combine all media from listing and profile
    const allMedia = [
      ...(listing.media || []),
      ...((listing.images || []).map(img => ({ ...img, type: 'image' }))),
      ...((listing.user?.profile?.media || []).map(m => ({ ...m, type: m.type || 'image' })))
    ];
    
    // Separate photos and videos
    const photos = allMedia.filter(m => {
      const type = m.type?.toLowerCase() || '';
      return !type || type === 'photo' || type === 'image' || type === 'IMAGE';
    });
    
    const videos = allMedia.filter(m => {
      const type = m.type?.toLowerCase() || '';
      return type === 'video' || type === 'VIDEO';
    });

    // Parse services
    let servicesList: string[] = [];
    try {
      if (typeof listing.services === 'string' && listing.services) {
        servicesList = listing.services.split(',').map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(listing.services)) {
        servicesList = listing.services;
      }
    } catch (e) {
      console.error('Error parsing services:', e);
      servicesList = [];
    }

    // Parse languages
    let languagesList: string[] = [];
    try {
      if (profile.languages) {
        if (typeof profile.languages === 'string') {
          if (profile.languages.startsWith('[')) {
            languagesList = JSON.parse(profile.languages);
          } else {
            languagesList = profile.languages.split(',').map(l => l.trim()).filter(l => l);
          }
        } else if (Array.isArray(profile.languages)) {
          languagesList = profile.languages;
        }
      }
    } catch (e) {
      console.error('Error parsing languages:', e);
      languagesList = [];
    }

    // Parse personality tags
    let personalityTags: string[] = [];
    try {
      if (profile.personalityTags) {
        if (typeof profile.personalityTags === 'string') {
          if (profile.personalityTags.startsWith('[')) {
            personalityTags = JSON.parse(profile.personalityTags);
          } else {
            personalityTags = profile.personalityTags.split(',').map(t => t.trim()).filter(t => t);
          }
        } else if (Array.isArray(profile.personalityTags)) {
          personalityTags = profile.personalityTags;
        }
      }
    } catch (e) {
      console.error('Error parsing personality tags:', e);
      personalityTags = [];
    }

    // Build social media links
    const socials: ListingProfile['socials'] = [];
    if (profile.onlyfans) socials.push({ platform: 'onlyfans', username: 'OnlyFans', url: profile.onlyfans });
    if (profile.instagram) socials.push({ platform: 'instagram', username: 'Instagram', url: profile.instagram });
    if (profile.twitter) socials.push({ platform: 'twitter', username: 'Twitter', url: profile.twitter });
    if (profile.tiktok) socials.push({ platform: 'tiktok', username: 'TikTok', url: profile.tiktok });
    if (profile.snapchat) socials.push({ platform: 'snapchat', username: 'Snapchat', url: profile.snapchat });
    if (profile.telegramChannel) socials.push({ platform: 'telegram_channel', username: 'Telegram', url: profile.telegramChannel });
    if (profile.whatsappBusiness) socials.push({ platform: 'whatsapp_business', username: 'WhatsApp Business', url: profile.whatsappBusiness });
    if (profile.manyvids) socials.push({ platform: 'manyvids', username: 'ManyVids', url: profile.manyvids });
    if (profile.chaturbate) socials.push({ platform: 'chaturbate', username: 'Chaturbate', url: profile.chaturbate });
    if (profile.myfreecams) socials.push({ platform: 'myfreecams', username: 'MyFreeCams', url: profile.myfreecams });
    if (profile.livejasmin) socials.push({ platform: 'livejasmin', username: 'LiveJasmin', url: profile.livejasmin });
    if (profile.linkHubUrl) socials.push({ platform: 'linkhub', username: 'Links', url: profile.linkHubUrl });

    // Parse pricing
    const parsePricingFromDescription = (desc: string | null | undefined) => {
      const localRates: ListingProfile['pricing']['localRates'] = [];
      const outcallRates: ListingProfile['pricing']['outcallRates'] = [];
      
      if (!desc || typeof desc !== 'string') {
        return { localRates, outcallRates };
      }
      
      try {
        const localMatch = desc.match(/Local:\s*1h\s*€?(\d+)[,\s]*2h\s*€?(\d+)[,\s]*Pernoite\s*€?(\d+)/i);
        if (localMatch) {
          if (localMatch[1]) localRates.push({ duration: '1h', price: parseInt(localMatch[1]), currency: '€' });
          if (localMatch[2]) localRates.push({ duration: '2h', price: parseInt(localMatch[2]), currency: '€' });
          if (localMatch[3]) localRates.push({ duration: 'pernoite', price: parseInt(localMatch[3]), currency: '€' });
        }
        
        const outcallMatch = desc.match(/Deslocação:\s*1h\s*€?(\d+)[,\s]*2h\s*€?(\d+)[,\s]*Pernoite\s*€?(\d+)/i);
        if (outcallMatch) {
          if (outcallMatch[1]) outcallRates.push({ duration: '1h', price: parseInt(outcallMatch[1]), currency: '€' });
          if (outcallMatch[2]) outcallRates.push({ duration: '2h', price: parseInt(outcallMatch[2]), currency: '€' });
          if (outcallMatch[3]) outcallRates.push({ duration: 'pernoite', price: parseInt(outcallMatch[3]), currency: '€' });
        }
      } catch (e) {
        console.error('Error parsing pricing from description:', e);
      }
      
      return { localRates, outcallRates };
    };

    const parsedPricing = parsePricingFromDescription(listing.description || '');
    const pricing: ListingProfile['pricing'] = {
      showOnProfile: (listing.price !== undefined && listing.price > 0) || parsedPricing.localRates.length > 0,
      minDuration: listing.minDuration && listing.minDuration.trim() !== '' ? listing.minDuration : undefined,
      noticeRequired: listing.advanceNotice && listing.advanceNotice.trim() !== '' ? listing.advanceNotice : undefined,
      acceptsCard: listing.acceptsCard || false,
      regularDiscount: !!listing.regularDiscount,
      localRates: parsedPricing.localRates.length > 0 
        ? parsedPricing.localRates 
        : (listing.price ? [{ duration: '1h', price: listing.price, currency: '€' }] : []),
      outcallRates: parsedPricing.outcallRates
    };

    // Clean description - remove pricing patterns
    const cleanDescription = (desc: string | null | undefined): string => {
      if (!desc || typeof desc !== 'string') return '';
      
      let cleaned = desc;
      
      // Remove pricing patterns
      cleaned = cleaned.replace(/Preços?:.*$/gmi, '');
      cleaned = cleaned.replace(/Local\s*15min:.*$/gmi, '');
      cleaned = cleaned.replace(/Deslocação\s*15min:.*$/gmi, '');
      cleaned = cleaned.replace(/Local:\s*1h\s*€?[\d,]+[,\s]*2h\s*€?[\d,]+[,\s]*Pernoite\s*€?[\d,]+/gi, '');
      cleaned = cleaned.replace(/Deslocação:\s*1h\s*€?[\d,]+[,\s]*2h\s*€?[\d,]+[,\s]*Pernoite\s*€?[\d,]+/gi, '');
      
      // Clean up extra whitespace
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      cleaned = cleaned.trim();
      
      return cleaned;
    };

    const description = cleanDescription(listing.description || profile.description || '');

    return {
      id: listing.id,
      name: profile.name || listing.title || 'Anúncio',
      age: listing.age || profile.age || 0,
      city: listing.city || '',
      neighborhood: profile.neighborhood || '',
      phone: listing.phone || '',
      whatsappEnabled: profile.whatsappEnabled || false,
      telegramEnabled: profile.telegramEnabled || false,
      description: description,
      verified: profile.isVerified || false,
      socials,
      physical: {
        gender: profile.gender || '',
        preference: '',
        weight: profile.weight || '',
        height: profile.height || '',
        ethnicity: profile.ethnicity || '',
        eyeColor: profile.eyeColor || '',
        hairColor: profile.hairColor || '',
        shoeSize: profile.shoeSize || '',
        tattoos: profile.tattoos || '',
        piercings: profile.piercings || '',
        smoker: profile.smoker === 'Sim' || profile.smoker === 'Yes' || profile.smoker === 'true',
        languages: languagesList,
        bodyType: profile.bodyType || '',
        bustSize: profile.breastSize || '',
        bustType: (profile.breastType === 'Silicone' ? 'Silicone' : 'Natural') as 'Natural' | 'Silicone',
        personalityTags
      },
      services: servicesList,
      pricing,
      gallery: photos.length > 0 ? photos.map((img, idx) => ({
        id: `img-${idx}`,
        type: 'image' as const,
        url: img.url || ''
      })) : [],
      comparisonMedia: videos.map((vid, idx) => ({
        id: `vid-${idx}`,
        type: 'video' as const,
        url: vid.url || '',
        thumbnail: vid.url || '',
        isVerification: false
      }))
    };
  } catch (error) {
    console.error('Error mapping listing to profile:', error);
    throw error;
  }
}

export default function ListingPage() {
  const params = useParams();
  const listingId = params.id as string;
  
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching listing with ID:', listingId);
        
        const response = await fetch(`/api/listings/${listingId}`);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          let errorMessage = `Listing not found (${response.status})`;
          try {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If JSON parsing fails, try to get text
            try {
              const errorText = await response.text();
              console.error('API error text:', errorText);
              errorMessage = errorText || errorMessage;
            } catch (textError) {
              console.error('Could not parse error response:', textError);
            }
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Listing data received:', data?.id, data?.title);
        console.log('Full listing data:', JSON.stringify(data, null, 2));
        
        if (!data || !data.id) {
          console.error('Invalid listing data:', data);
          throw new Error('Invalid listing data received');
        }
        
        // Ensure data structure
        if (!data.user) data.user = { id: data.userId, profile: {} };
        if (!data.user.id) data.user.id = data.userId;
        if (!data.user.profile) data.user.profile = {};
        if (!Array.isArray(data.media)) data.media = [];
        if (!Array.isArray(data.images)) data.images = [];
        
        // Debug: Log creatorId for wishlist
        console.log('Listing userId:', data.userId);
        console.log('Listing user.id:', data.user?.id);
        console.log('CreatorId for wishlist:', data.userId || data.user?.id);
        
        setListing(data);
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        setError(error.message || 'Listing not found or no longer available');
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    } else {
      setError('Invalid listing ID');
      setLoading(false);
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Anúncio não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'Este anúncio não existe ou foi removido.'}</p>
          <div className="space-x-4">
            <Link
              href="/perfis"
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 inline-block"
            >
              Ver outros anúncios
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 inline-block"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Map listing to profile
  let profile: ListingProfile;
  try {
    profile = mapListingToProfile(listing);
  } catch (error) {
    console.error('Error mapping listing to profile:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar anúncio</h1>
          <p className="text-gray-600 mb-6">Ocorreu um erro ao processar os dados do anúncio.</p>
          <Link
            href="/dashboard"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 inline-block"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 font-sans">
        <main className="max-w-7xl mx-auto md:px-6 md:py-8">
          {/* Profile Hero */}
          <ProfileHero profile={profile} />

          <div className="px-4 md:px-0 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 md:mt-0">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-8 space-y-8">
              {/* About Me */}
              {profile.description && (
                <section>
                  <Card className="bg-white">
                    <SectionHeader title="Sobre Mim" />
                    <div className="prose prose-slate text-gray-600 leading-relaxed whitespace-pre-line">
                      <p className={!showFullDesc ? 'line-clamp-4 md:line-clamp-none' : ''}>
                        {profile.description}
              </p>
            </div>
                    {/* Mobile 'Read More' toggle */}
                    <button 
                      onClick={() => setShowFullDesc(!showFullDesc)} 
                      className="md:hidden mt-3 text-red-600 text-sm font-bold flex items-center gap-1"
                    >
                      {showFullDesc ? "Ler menos" : "Ler mais"}
                    </button>
                    {profile.physical.personalityTags.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {profile.physical.personalityTags.map((tag, i) => (
                          <Badge key={i} label={tag} variant="default" />
                        ))}
            </div>
          )}
                  </Card>
                </section>
              )}

              {/* Gallery */}
              {profile.gallery.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <SectionHeader title="Minha Galeria" subtitle={`${profile.gallery.length} fotos disponíveis`} />
        </div>
                  <GalleryGrid images={profile.gallery} />
                </section>
              )}

        {/* Physical Details */}
              <section>
                <Card>
                  <SectionHeader title="Detalhes Físicos" />
                  <PhysicalStats physical={profile.physical} />
                  {/* Tattoos & Piercings Detail Box */}
                  {(profile.physical.tattoos || profile.physical.piercings) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.physical.tattoos && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <span className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-1">
                            <Icons.Tattoo size={14} /> Tatuagens
                          </span>
                          <p className="text-gray-700 text-sm font-medium">{profile.physical.tattoos}</p>
              </div>
            )}
                      {profile.physical.piercings && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <span className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-1">
                            <Icons.Piercing size={14} /> Piercings
                          </span>
                          <p className="text-gray-700 text-sm font-medium">{profile.physical.piercings}</p>
              </div>
            )}
              </div>
            )}
                </Card>
              </section>

              {/* Services */}
              {profile.services.length > 0 && (
                <section>
                  <Card>
                    <SectionHeader title="Serviços Oferecidos" />
                    <ServiceTags services={profile.services} />
                  </Card>
                </section>
              )}

              {/* Comparison Media (Videos) */}
              {profile.comparisonMedia.length > 0 && (
                <section>
                  <SectionHeader title="Vídeos de Comparação" subtitle="Realidade sem filtros" />
                  <ComparisonVideos videos={profile.comparisonMedia} />
                </section>
              )}

              {/* Socials Block */}
              {profile.socials.length > 0 && (
                <section className="mb-8">
                  <SectionHeader title="Redes Sociais" />
                  <SocialLinks socials={profile.socials} />
                </section>
            )}
          </div>

            {/* Right Column (Sticky Sidebar) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Contact Card (Desktop Only - Mobile has bottom bar) */}
                <div className="hidden lg:block">
                  <ContactCard 
                    profile={profile} 
                    creatorId={listing?.userId || listing?.user?.id} 
                    locale="pt"
                  />
            </div>

                {/* Pricing Card */}
                {profile.pricing.showOnProfile && (
                  <Card title="Investimento" icon={<Icons.Price size={20} />}>
                    <PricingTable pricing={profile.pricing} />
                  </Card>
                )}

                {/* Check Duplicates Button */}
                <Link 
                  href={`/perfis/mesmo-numero/${encodeURIComponent(profile.phone)}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-bold hover:text-red-600 hover:border-red-300 hover:shadow-sm transition-all group"
                >
                  <Icons.Users size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                  Ver perfis com o mesmo número
                </Link>

                {/* Safety Tips (Widget) */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
                  <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <Icons.Verified size={16} /> 
                    <span className="font-bold uppercase tracking-wide">Dica de Segurança</span>
              </div>
                  <p className="leading-relaxed">Nunca envie pagamentos antecipados sem verificação. O PortalEscorts recomenda o contato inicial via WhatsApp ou Vídeo.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Fixed Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 p-3 z-40 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {profile.whatsappEnabled ? (
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-[#25D366] text-white rounded-xl py-2.5 shadow-lg active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-1.5">
                  <Icons.WhatsApp size={20} />
                  <span className="text-sm font-bold">WhatsApp</span>
            </div>
              </a>
            ) : profile.telegramEnabled ? (
              <a
                href={`https://t.me/${profile.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-[#0088cc] text-white rounded-xl py-2.5 shadow-lg active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-1.5">
                  <Icons.Telegram size={20} />
                  <span className="text-sm font-bold">Telegram</span>
              </div>
              </a>
            ) : null}
            <a 
              href={`tel:${profile.phone}`}
              className="flex flex-col items-center justify-center bg-red-600 text-white rounded-xl py-2.5 shadow-lg active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-1.5">
                <Icons.Phone size={20} />
                <span className="text-sm font-bold">Ligar</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 

