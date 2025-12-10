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

    // Define cities for each locale
    const localeCities: Record<string, string[]> = {
      pt: ['Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Faro'],
      es: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'],
    };

    // Build base where clause
    const where: any = {
      ...(category && { category }),
    };

    // Filter by locale (country) based on cities
    if (locale && localeCities[locale]) {
      if (city) {
        // If city is specified, verify it belongs to the locale
        if (localeCities[locale].includes(city)) {
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
        // No city specified, filter by all cities in the locale
        where.city = {
          in: localeCities[locale],
        };
      }
    } else if (city) {
      // Locale not specified but city is, use city filter
      where.city = city;
    }
    
    // Only apply basic filters for non-admin users
    if (!userIsAdmin) {
      where.age = {
        gt: 0
      };
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
          include: {
            listings: {
              where: userIsAdmin ? {} : { status: 'ACTIVE' },
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
      : profilesArray.filter(profile => profile && profile.user && profile.user.listings && Array.isArray(profile.user.listings) && profile.user.listings.length > 0);

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
        isOnline: profile.isOnline || false,
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