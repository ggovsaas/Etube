// Types for the new listing/anuncio page

export interface SocialMedia {
  platform: 'onlyfans' | 'instagram' | 'twitter' | 'tiktok' | 'snapchat' | 'telegram_channel' | 'whatsapp_business' | 'manyvids' | 'chaturbate' | 'myfreecams' | 'livejasmin' | 'linkhub';
  username: string;
  url: string;
}

export interface PricingRate {
  duration: '15min' | '30min' | '1h' | '2h' | 'pernoite';
  price: number;
  currency: string;
}

export interface Pricing {
  showOnProfile: boolean;
  minDuration?: string;
  noticeRequired?: string;
  acceptsCard: boolean;
  regularDiscount: boolean;
  localRates: PricingRate[];
  outcallRates: PricingRate[];
}

export interface PhysicalAttributes {
  gender: string;
  preference: string;
  weight: string;
  height: string;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  shoeSize: string;
  tattoos?: string;
  piercings?: string;
  smoker: boolean;
  languages: string[];
  bodyType: string;
  bustSize: string;
  bustType: 'Natural' | 'Silicone';
  personalityTags: string[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  isVerification?: boolean;
}

export interface ListingProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  neighborhood: string;
  phone: string;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  description: string;
  verified: boolean;
  socials: SocialMedia[];
  physical: PhysicalAttributes;
  services: string[];
  pricing: Pricing;
  gallery: MediaItem[];
  comparisonMedia: MediaItem[];
}






