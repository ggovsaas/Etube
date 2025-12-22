import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Locale-to-city mapping (same as profiles API)
const localeCities: Record<string, string[]> = {
  pt: ['Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Faro'],
  'pt-BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
  'pt-AO': ['Luanda', 'Benguela', 'Lubango', 'Huambo'],
  es: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Marbella'],
  'es-MX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Cancún'],
  'es-CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
  'es-CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena'],
  'es-UY': ['Montevideo', 'Punta del Este', 'Salto', 'Colonia'],
  en: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol'],
  'en-GB': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol', 'Leeds'],
  'en-US': ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Chicago', 'Houston'],
  'en-ZA': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  'en-CY': ['Limassol', 'Nicosia', 'Paphos', 'Larnaca', 'Ayia Napa'],
  de: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'],
  nl: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  'nl-BE': ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Leuven'],
  fr: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'],
  'fr-BE': ['Brussels', 'Liège', 'Charleroi', 'Namur'],
  it: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Florence'],
  pl: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'],
  hr: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Dubrovnik'],
  el: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Mykonos', 'Santorini'],
  'el-CY': ['Limassol', 'Nicosia', 'Paphos', 'Larnaca', 'Ayia Napa'],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const type = searchParams.get('type'); // Optional: PHOTO_POST, VIDEO_POST, STORY
    const locale = searchParams.get('locale') || 'pt'; // CRITICAL: Get locale for geographic filtering

    // Determine base locale (handle variants)
    const baseLocale = locale?.startsWith('en') ? (locale === 'en' ? 'en-GB' : locale) : 
                      locale?.startsWith('pt') ? (locale === 'pt' ? 'pt' : locale) :
                      locale?.startsWith('es') ? (locale === 'es' ? 'es' : locale) :
                      locale?.startsWith('nl') ? (locale === 'nl' ? 'nl' : locale) :
                      locale?.startsWith('fr') ? (locale === 'fr' ? 'fr' : locale) :
                      locale?.startsWith('el') ? (locale === 'el' ? 'el' : locale) :
                      locale;

    // Get allowed cities for this locale
    const allowedCities = baseLocale && localeCities[baseLocale] ? localeCities[baseLocale] : [];

    const where: any = {
      isPublic: true,
    };

    if (type && ['PHOTO_POST', 'VIDEO_POST', 'STORY'].includes(type)) {
      where.type = type;
    }

    // Fetch ALL content items (no geographic filter yet - we'll filter listings after)
    const [allItems, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        skip: (page - 1) * limit * 2, // Fetch more to account for filtering
        take: limit * 2,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isOnline: true,
              isServiceProvider: true,
              profile: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                  city: true, // CRITICAL: Need city for geographic filtering
                },
              },
              listings: {
                where: {
                  status: 'ACTIVE',
                  isPaused: false,
                },
                select: {
                  id: true,
                  city: true,
                },
                take: 1,
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      }),
      prisma.contentItem.count({ where }),
    ]);

    // CRITICAL FILTERING LOGIC:
    // 1. Mix ALL UGC content (photos, videos, stories) - language prioritized
    // 2. STRICTLY FILTER any linked listings/profiles to match locale geography
    const filteredItems = allItems.filter((item) => {
      // If user is a service provider (escort/creator with listings), check geographic match
      if (item.user.isServiceProvider && item.user.listings && item.user.listings.length > 0) {
        const listingCity = item.user.listings[0].city;
        // Only include if listing city matches locale's allowed cities
        return allowedCities.length === 0 || (listingCity && allowedCities.includes(listingCity));
      }
      
      // If user has a profile with a city, check geographic match
      if (item.user.profile?.city) {
        return allowedCities.length === 0 || allowedCities.includes(item.user.profile.city);
      }

      // Standalone content creators (no listings, no city) - include them (language prioritized)
      // This allows global content creators to appear in all feeds
      return true;
    }).slice(0, limit); // Take only the requested limit after filtering

    return NextResponse.json({
      items: filteredItems,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

