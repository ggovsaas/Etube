import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { isAdminEmail, isAdminRole } from '@/lib/adminCheck';

// GET /api/profiles - Get all profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const locale = searchParams.get('locale') || 'pt'; // Get locale for filtering

    // Check if user is admin using NextAuth session
    let userIsAdmin = false;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        userIsAdmin = isAdminRole(session.user.role) || isAdminEmail(session.user.email);
      }
    } catch (e) {
      // Not authenticated or not admin, continue with public filter
    }

    // Define cities for each locale (native markets)
    // Users see ONLY their native market by default
    // To see other countries, they must manually visit /network and select a country
    const localeCities: Record<string, string[]> = {
      pt: ['Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Faro'],
      'pt-BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
      'pt-AO': ['Luanda', 'Benguela', 'Lubango', 'Huambo'],
      es: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Marbella'],
      'es-MX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Cancún'],
      'es-CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
      'es-CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena'],
      'es-UY': ['Montevideo', 'Punta del Este', 'Salto', 'Colonia'],
      en: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol'], // Default English (UK)
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

    // Build base where clause
    const where: any = {
      ...(category && { category }),
    };

    // Filter by locale (native market) - users see ONLY their country by default
    // Handle locale variants: en-US, en-GB, etc. fall back to base language
    const baseLocale = locale?.startsWith('en') ? (locale === 'en' ? 'en-GB' : locale) : 
                      locale?.startsWith('pt') ? (locale === 'pt' ? 'pt' : locale) :
                      locale?.startsWith('es') ? (locale === 'es' ? 'es' : locale) :
                      locale?.startsWith('nl') ? (locale === 'nl' ? 'nl' : locale) :
                      locale?.startsWith('fr') ? (locale === 'fr' ? 'fr' : locale) :
                      locale?.startsWith('el') ? (locale === 'el' ? 'el' : locale) :
                      locale;
    
    if (baseLocale && localeCities[baseLocale]) {
      if (city) {
        // If city is specified, verify it belongs to the locale
        if (localeCities[baseLocale].includes(city)) {
          where.city = city;
        } else {
          // City doesn't belong to locale, return empty results
          return NextResponse.json({
            profiles: [],
            total: 0,
            pages: 0,
            currentPage: 1,
          });
        }
      } else {
        // No city specified, filter by all cities in the locale (native market only)
        where.city = {
          in: localeCities[baseLocale],
        };
      }
    } else if (city) {
      // Locale not in our list but city is specified, use city filter
      where.city = city;
    } else {
      // Unknown locale and no city - return empty (shouldn't happen, but safe fallback)
      return NextResponse.json({
        profiles: [],
        total: 0,
        pages: 0,
        currentPage: 1,
      });
    }
    
    // Only apply basic filters for non-admin users
    if (!userIsAdmin) {
      where.age = {
        gt: 0
      };
      // Ensure city filter is set (native market cities)
      if (!where.city) {
        where.city = {
          not: ''
        };
      }
    }

    // For non-admin users, we need to fetch more profiles to filter, then paginate
    // For admin, we can fetch directly with pagination
    const fetchLimit = userIsAdmin ? limit : limit * 3; // Fetch more for filtering
    
    // Fetch profiles with user and listings
    const profiles = await prisma.profile.findMany({
      where,
      skip: userIsAdmin ? (page - 1) * limit : 0,
      take: fetchLimit,
      orderBy: [
        { isOnline: 'desc' },
        { isVerified: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            isOnline: true,
            isProfileHidden: true,
            isContentCreator: true,
            isServiceProvider: true,
            listings: {
              where: userIsAdmin ? {} : { 
                status: 'ACTIVE',
                isPaused: false, // Filter out paused listings
              },
              take: 1,
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        media: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Filter profiles: non-admin only sees profiles with active listings
    const profilesArray = Array.isArray(profiles) ? profiles : [];
    const filteredProfiles = userIsAdmin 
      ? profilesArray 
      : profilesArray.filter(profile => {
          if (!profile || !profile.user) return false;
          
          // Filter out hidden creator profiles
          if (profile.user.isProfileHidden === true) return false;
          
          // For escorts: must have active, non-paused listings
          if (profile.user.isServiceProvider) {
            const listings = Array.isArray(profile.user.listings) ? profile.user.listings : [];
            return listings.length > 0 && listings.some(listing => 
              listing.status === 'ACTIVE' && listing.isPaused === false
            );
          }
          
          // For creators: just check if not hidden (already checked above)
          if (profile.user.isContentCreator) {
            return true; // Already filtered by isProfileHidden
          }
          
          return false;
        });

    // Apply pagination to filtered results for non-admin
    const paginatedProfiles = userIsAdmin 
      ? filteredProfiles 
      : (Array.isArray(filteredProfiles) ? filteredProfiles : []).slice((page - 1) * limit, page * limit);

    // For total count: admin gets accurate count, non-admin gets approximate
    // (For accurate non-admin count, we'd need to fetch all profiles which is expensive)
    const total = userIsAdmin 
      ? await prisma.profile.count({ where })
      : filteredProfiles.length;

    // Transform profiles to match expected structure
    const profilesToTransform = Array.isArray(paginatedProfiles) ? paginatedProfiles : [];
    const transformedProfiles = profilesToTransform
      .filter(profile => profile != null) // Filter out null/undefined profiles first
      .map(profile => {
      if (!profile) return null;
      // Get all gallery images
      const mediaArray = Array.isArray(profile.media) ? profile.media : [];
      const galleryImages = mediaArray
        .filter(m => m && (m.type === 'image' || !m.type) && m.url)
        .map(m => m.url);
      
      const listingsArray = Array.isArray(profile.user?.listings) ? profile.user.listings : [];
      const firstListing = listingsArray[0] || null;
      const firstMedia = mediaArray[0] || null;
      
      return {
        id: profile.id || '',
        listingId: firstListing?.id || null, // Include listing ID for navigation
        name: profile.name || 'Unknown',
        age: profile.age || 0,
        city: profile.city || 'Unknown',
        height: profile.height ? parseInt(String(profile.height)) : 0,
        weight: profile.weight ? parseInt(String(profile.weight)) : 0,
        price: firstListing?.price || 0,
        pricePerHour: firstListing?.price || 0,
        rating: profile.rating || 0,
        reviews: profile._count?.reviews || 0,
        isOnline: profile.user?.isOnline || false,
        isVerified: profile.isVerified || false,
        imageUrl: firstMedia?.url || '/placeholder-profile.jpg',
        description: profile.description || '',
        gallery: galleryImages.length > 0 ? galleryImages : [firstMedia?.url || '/placeholder-profile.jpg'],
        voiceNoteUrl: profile.voiceNoteUrl || null,
        createdAt: profile.createdAt
      };
    }).filter(p => p !== null); // Remove any null entries

    // Always return a valid response, even if empty
    const validProfiles = Array.isArray(transformedProfiles) ? transformedProfiles.filter(p => p != null) : [];
    return NextResponse.json({
      profiles: validProfiles,
      total: validProfiles.length,
      pages: Math.ceil((validProfiles.length || 0) / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json({
      profiles: [],
      total: 0,
      pages: 0,
      currentPage: 1,
      error: error instanceof Error ? error.message : 'Failed to fetch profiles'
    }, { status: 500 });
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      age,
      city,
      height,
      weight,
      description,
      isVerified,
      isOnline,
      media,
    } = body;

    const profile = await prisma.profile.create({
      data: {
        userId: body.userId, // Add required userId
        name,
        age,
        city,
        height,
        weight,
        description,
        isVerified,
        isOnline,
        media: {
          create: media?.map((item: { url: string; type: string }) => ({
            url: item.url,
            type: item.type,
          })) || [],
        },
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 