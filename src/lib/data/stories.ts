import { prisma } from '@/lib/prisma';

export interface Story {
  id: string;
  mediaUrl: string;
  storyOrder: number;
  userId: string;
  createdAt: Date;
}

export interface UserWithStories {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  stories: Story[];
  // Profile info for display (from first matching listing)
  profileInfo?: {
    city: string;
    gender: string | null;
    profilePhoto: string | null;
  };
}

interface GetStoriesByListingContextParams {
  city: string;
  gender?: string;
}

/**
 * Fetches stories filtered by listing context (city and gender).
 * Finds all Users whose Listings/Profiles match the city and gender,
 * then returns those Users with their stories.
 * 
 * @param params - Object containing required city and optional gender filter
 * @returns Array of users with their associated stories, grouped by creator
 */
export async function getStoriesByListingContext(
  params: GetStoriesByListingContextParams
): Promise<UserWithStories[]> {
  const { city, gender } = params;

  // First, find all userIds whose Profile (Listing) matches the city and gender
  // CRITICAL FIX: Only include users with at least one ACTIVE listing
  const profileWhere: any = {
    city: city,
    user: {
      listings: {
        some: {
          status: 'ACTIVE',
          isPaused: false
        }
      }
    }
  };

  if (gender) {
    profileWhere.gender = gender;
  }

  // Get unique user IDs from matching profiles
  const matchingProfiles = await prisma.profile.findMany({
    where: profileWhere,
    select: {
      userId: true,
      city: true,
      gender: true,
      profilePhoto: true
    },
    distinct: ['userId']
  });

  if (matchingProfiles.length === 0) {
    return [];
  }

  const userIds = matchingProfiles.map(p => p.userId);

  // Now fetch Users with their stories
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      },
      stories: {
        some: {} // Only users with at least one story
      }
    },
    include: {
      stories: {
        orderBy: {
          storyOrder: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transform to match the return type, including profile info
  return users.map(user => {
    // Find the matching profile info for this user
    const profileInfo = matchingProfiles.find(p => p.userId === user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      stories: user.stories.map(story => ({
        id: story.id,
        mediaUrl: story.mediaUrl,
        storyOrder: story.storyOrder,
        userId: story.userId,
        createdAt: story.createdAt
      })),
      profileInfo: profileInfo ? {
        city: profileInfo.city,
        gender: profileInfo.gender,
        profilePhoto: profileInfo.profilePhoto
      } : undefined
    };
  });
}

// Legacy function for backward compatibility (kept for existing code)
export async function getStoriesByFilters(
  params: GetStoriesByListingContextParams
): Promise<UserWithStories[]> {
  return getStoriesByListingContext(params);
}

