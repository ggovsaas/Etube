import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';

/**
 * Get country scope for the current admin user
 */
async function getAdminCountryScope(): Promise<string | null> {
  const { session, isMasterAdmin: isMaster } = await verifyAdminSession();
  
  if (isMaster) {
    return null; // Master admin has global scope (null = all countries)
  }
  
  if (!session?.user?.email) {
    return null;
  }
  
  // Get user's admin role and country scope
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { adminRole: true }
  });
  
  return user?.adminRole?.countryScope || null;
}

/**
 * Build country filter for Prisma queries
 */
function buildCountryFilter(countryScope: string | null, fieldName: string = 'city') {
  if (countryScope === null) {
    return {}; // Master admin - no filter
  }
  
  // Map country scope to cities (simplified - you may want to expand this)
  const countryCityMap: Record<string, string[]> = {
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
    'Portugal': ['Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Faro'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'],
  };
  
  const cities = countryCityMap[countryScope] || [];
  if (cities.length === 0) {
    return {}; // No cities mapped, return empty filter (shouldn't happen)
  }
  
  return {
    [fieldName]: {
      in: cities
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error, isMasterAdmin: isMaster } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    const countryScope = await getAdminCountryScope();
    const countryFilter = buildCountryFilter(countryScope, 'city');
    
    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Site Health & Growth Metrics
    const [
      totalUsers,
      totalListings,
      newUsersLast7Days,
      activeListings,
      newCreatorsLast7Days,
      newClientOnlyUsersLast7Days,
      userRolesBreakdown,
    ] = await Promise.all([
      // Total Users (with country filter for profiles)
      prisma.user.count(),
      
      // Total Listings (with country filter)
      prisma.listing.count({
        where: {
          ...(Object.keys(countryFilter).length > 0 ? {
            profile: countryFilter
          } : {})
        }
      }),
      
      // New Users (Last 7 Days)
      prisma.user.count({
        where: {
          createdAt: { gte: last7Days }
        }
      }),
      
      // Active Listings (with country filter)
      prisma.listing.count({
        where: {
          status: 'ACTIVE',
          ...(Object.keys(countryFilter).length > 0 ? {
            profile: countryFilter
          } : {})
        }
      }),
      
      // New Creators (Last 7 Days) - users with isContentCreator or isServiceProvider
      prisma.user.count({
        where: {
          createdAt: { gte: last7Days },
          OR: [
            { isContentCreator: true },
            { isServiceProvider: true }
          ]
        }
      }),
      
      // New Client-Only Users (Last 7 Days)
      prisma.user.count({
        where: {
          createdAt: { gte: last7Days },
          isClient: true,
          isContentCreator: false,
          isServiceProvider: false
        }
      }),
      
      // User Roles Breakdown
      Promise.all([
        prisma.user.count({ where: { isClient: true } }),
        prisma.user.count({ where: { isContentCreator: true } }),
        prisma.user.count({ where: { isServiceProvider: true } }),
        prisma.user.count({ where: { role: 'CAM_CREATOR' } })
      ]).then(([clients, creators, providers, camCreators]) => ({
        clients,
        creators,
        providers,
        camCreators,
        total: clients + creators + providers + camCreators
      }))
    ]);

    // 2. Monetization & Sales Metrics (Master Admin Only)
    let monetizationMetrics = null;
    if (isMaster) {
      const [
        totalRevenueLast30Days,
        creditSalesLast7Days,
        contestRevenue,
        directChatRevenue,
        videoViewsPaid,
        tipsProcessed,
        creatorPayoutLiability,
        arpu,
      ] = await Promise.all([
        // Total Revenue (Last 30 Days) - placeholder, needs CreditTransaction model
        prisma.creditTransaction.aggregate({
          where: {
            type: 'PURCHASE',
            createdAt: { gte: last30Days }
          },
          _sum: {
            amount: true
          }
        }).then(result => result._sum.amount || 0),
        
        // Credit Sales (Last 7 Days)
        prisma.creditTransaction.aggregate({
          where: {
            type: 'PURCHASE',
            createdAt: { gte: last7Days }
          },
          _sum: {
            amount: true
          }
        }).then(result => result._sum.amount || 0),
        
        // Contest Revenue - placeholder (needs ContestEntry model with payment tracking)
        Promise.resolve(0),
        
        // DirectChat/Call Revenue - placeholder
        Promise.resolve(0),
        
        // Video Views (Paid) - placeholder
        Promise.resolve(0),
        
        // Tips Processed - placeholder
        Promise.resolve(0),
        
        // Creator Payout Liability - placeholder
        Promise.resolve(0),
        
        // ARPU (Average Revenue Per User)
        Promise.resolve(0) // Will calculate below
      ]);
      
      const activeUsersCount = await prisma.user.count({
        where: {
          createdAt: { gte: last30Days }
        }
      });
      
      monetizationMetrics = {
        totalRevenueLast30Days,
        creditSalesLast7Days,
        contestRevenue,
        directChatRevenue,
        videoViewsPaid,
        tipsProcessed,
        creatorPayoutLiability,
        arpu: activeUsersCount > 0 ? totalRevenueLast30Days / activeUsersCount : 0
      };
    }

    // 3. Compliance & Content Moderation Metrics
    const [
      pendingListingApproval,
      pendingPhotoVerification,
      pendingIdVerification,
      newBlogPostsUnmoderated,
      reportedProfilesActive,
      totalAccountsBannedLast30Days,
    ] = await Promise.all([
      // Pending Listing Approval (with country filter)
      prisma.listing.count({
        where: {
          status: 'PENDING',
          ...(Object.keys(countryFilter).length > 0 ? {
            profile: countryFilter
          } : {})
        }
      }),
      
      // Pending Photo Verification (with country filter)
      prisma.verificationRequest.count({
        where: {
          status: 'PENDING',
          ...(Object.keys(countryFilter).length > 0 ? {
            user: {
              profile: countryFilter
            }
          } : {})
        }
      }),
      
      // Pending ID Verification (CAM_CREATOR accounts) - Master Admin only
      isMaster ? prisma.user.count({
        where: {
          role: 'CAM_CREATOR',
          // Add ID verification status check when implemented
        }
      }) : Promise.resolve(0),
      
      // New Blog Posts (Unmoderated) - all posts for sub-admins, filtered for master
      prisma.blogPost.count({
        where: {
          isPublished: false,
          ...(Object.keys(countryFilter).length > 0 ? {
            author: {
              profile: countryFilter
            }
          } : {})
        }
      }),
      
      // Reported Profiles (Active) - placeholder (needs Report model)
      Promise.resolve(0),
      
      // Total Accounts Banned (Last 30 Days) - placeholder (needs ban status in User model)
      Promise.resolve(0)
    ]);

    // 4. Community & Engagement Metrics (Master Admin Only)
    let communityMetrics = null;
    if (isMaster) {
      const [
        newForumThreadsLast24h,
        activeContestsTotal,
        activeBloggersLast7Days,
        wishlistItemsCreated,
        totalBlogPostsPublished,
        avgSessionDuration,
      ] = await Promise.all([
        // New Forum Threads (Last 24h)
        prisma.forumThread.count({
          where: {
            createdAt: { gte: last24Hours }
          }
        }),
        
        // Active Contests (Total)
        prisma.contest.count({
          where: {
            status: 'OPEN'
          }
        }),
        
        // Active Bloggers (Last 7 Days)
        prisma.user.count({
          where: {
            blogPosts: {
              some: {
                createdAt: { gte: last7Days },
                isPublished: true
              }
            }
          }
        }),
        
        // Wishlist Items Created
        prisma.wishlistItem.count(),
        
        // Total Blog Posts Published
        prisma.blogPost.count({
          where: {
            isPublished: true
          }
        }),
        
        // Avg Session Duration - placeholder (needs analytics integration)
        Promise.resolve(0)
      ]);
      
      communityMetrics = {
        newForumThreadsLast24h,
        activeContestsTotal,
        activeBloggersLast7Days,
        wishlistItemsCreated,
        totalBlogPostsPublished,
        avgSessionDuration
      };
    }

    // 5. Service Utilization Metrics (Master Admin Only)
    let serviceMetrics = null;
    if (isMaster) {
      const [
        directChatSessionsTotal,
        contestEntriesTotal,
        premiumSubscriptionsActive,
        tvTubeViews,
      ] = await Promise.all([
        // DirectChat Sessions (Total) - placeholder
        Promise.resolve(0),
        
        // Contest Entries (Total)
        prisma.contestEntry.count(),
        
        // Premium Subscriptions (Active)
        prisma.subscription.count({
          where: {
            status: 'ACTIVE'
          }
        }),
        
        // TV/Tube (VOD) Views - placeholder
        Promise.resolve(0)
      ]);
      
      serviceMetrics = {
        directChatSessionsTotal,
        contestEntriesTotal,
        premiumSubscriptionsActive,
        tvTubeViews
      };
    }

    return NextResponse.json({
      siteHealth: {
        totalUsers,
        totalListings,
        newUsersLast7Days,
        activeListings,
        newCreatorsLast7Days,
        newClientOnlyUsersLast7Days,
        userRolesBreakdown
      },
      monetization: monetizationMetrics,
      compliance: {
        pendingListingApproval,
        pendingPhotoVerification,
        pendingIdVerification: isMaster ? pendingIdVerification : null,
        newBlogPostsUnmoderated,
        reportedProfilesActive,
        totalAccountsBannedLast30Days
      },
      community: communityMetrics,
      service: serviceMetrics,
      countryScope: countryScope || 'GLOBAL'
    });

  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

