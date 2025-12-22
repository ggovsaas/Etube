import { prisma } from '@/lib/prisma';

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  order: number;
  isActive: boolean;
  threadCount?: number;
  lastPostAt?: Date | null;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  views: number;
  isSticky: boolean;
  isLocked: boolean;
  isSponsored: boolean;
  categoryId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  lastPostAt: Date;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  postCount?: number;
}

export interface ForumPost {
  id: string;
  content: string;
  threadId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

/**
 * Fetches a category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const category = await prisma.forumCategory.findUnique({
    where: {
      slug: slug,
      isActive: true
    }
  });

  if (!category) {
    return null;
  }

  const threadCount = await prisma.forumThread.count({
    where: {
      categoryId: category.id
    }
  });

  const lastThread = await prisma.forumThread.findFirst({
    where: {
      categoryId: category.id
    },
    orderBy: {
      lastPostAt: 'desc'
    },
    select: {
      lastPostAt: true
    }
  });

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    slug: category.slug,
    order: category.order,
    isActive: category.isActive,
    threadCount,
    lastPostAt: lastThread?.lastPostAt || null
  };
}

/**
 * Fetches all active forum categories with thread counts
 */
export async function getForumCategories(): Promise<ForumCategory[]> {
  const categories = await prisma.forumCategory.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      order: 'asc'
    },
    include: {
      threads: {
        select: {
          id: true,
          lastPostAt: true
        },
        orderBy: {
          lastPostAt: 'desc'
        },
        take: 1
      }
    }
  });

  // Get thread counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const threadCount = await prisma.forumThread.count({
        where: {
          categoryId: category.id
        }
      });

      const lastPost = category.threads[0];
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        order: category.order,
        isActive: category.isActive,
        threadCount,
        lastPostAt: lastPost?.lastPostAt || null
      };
    })
  );

  return categoriesWithCounts;
}

/**
 * Fetches all threads in a category, with sponsored/sticky threads first
 */
export async function getCategoryThreads(
  categoryId: string,
  includeSponsored: boolean = true
): Promise<ForumThread[]> {
  const threads = await prisma.forumThread.findMany({
    where: {
      categoryId: categoryId
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: [
      { isSticky: 'desc' },
      { isSponsored: 'desc' },
      { lastPostAt: 'desc' }
    ]
  });

  return threads.map(thread => ({
    id: thread.id,
    title: thread.title,
    content: thread.content,
    views: thread.views,
    isSticky: thread.isSticky,
    isLocked: thread.isLocked,
    isSponsored: thread.isSponsored,
    categoryId: thread.categoryId,
    authorId: thread.authorId,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    lastPostAt: thread.lastPostAt,
    author: thread.author ? {
      id: thread.author.id,
      name: thread.author.name,
      image: thread.author.image
    } : undefined,
    postCount: thread._count.posts
  }));
}

/**
 * Fetches a single thread with all its posts
 */
export async function getThreadWithPosts(threadId: string): Promise<{
  thread: ForumThread | null;
  posts: ForumPost[];
}> {
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          posts: true
        }
      }
    }
  });

  if (!thread) {
    return { thread: null, posts: [] };
  }

  // Increment view count
  await prisma.forumThread.update({
    where: { id: threadId },
    data: { views: { increment: 1 } }
  });

  const posts = await prisma.forumPost.findMany({
    where: {
      threadId: threadId
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return {
    thread: {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      views: thread.views + 1, // Include the increment
      isSticky: thread.isSticky,
      isLocked: thread.isLocked,
      isSponsored: thread.isSponsored,
      categoryId: thread.categoryId,
      authorId: thread.authorId,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      lastPostAt: thread.lastPostAt,
      author: thread.author ? {
        id: thread.author.id,
        name: thread.author.name,
        image: thread.author.image
      } : undefined,
      postCount: thread._count.posts
    },
    posts: posts.map(post => ({
      id: post.id,
      content: post.content,
      threadId: post.threadId,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author ? {
        id: post.author.id,
        name: post.author.name,
        image: post.author.image
      } : undefined
    }))
  };
}

/**
 * Fetches sponsored listings for homepage/profile search
 */
export async function getSponsoredListings(
  placementType: 'homepage' | 'profile_search' | 'forum_category',
  limit: number = 3
) {
  const now = new Date();
  
  const placements = await prisma.productPlacementPricing.findMany({
    where: {
      placementType: placementType,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    },
    include: {
      // Note: We'll need to fetch the actual listing/thread separately
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  return placements;
}


