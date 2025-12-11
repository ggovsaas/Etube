import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { locales } from '@/middleware';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.escorttube.vip';
  // Use all supported locales from middleware
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = [
    '',
    '/blog',
    '/forum',
    '/webcam',
  ];

  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  // Published blog posts
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      }
    });

    for (const locale of locales) {
      for (const post of blogPosts) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt || post.publishedAt || new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Profile listings (only published/active)
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        user: {
          listings: {
            some: {
              status: 'ACTIVE'
            }
          }
        }
      },
      select: {
        id: true,
        updatedAt: true
      },
      take: 1000 // Limit to prevent sitemap from being too large
    });

    for (const locale of locales) {
      for (const profile of profiles) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/anuncio/${profile.id}`,
          lastModified: profile.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching profiles for sitemap:', error);
  }

  // Forum categories and threads
  try {
    const forumThreads = await prisma.forumThread.findMany({
      select: {
        id: true,
        updatedAt: true
      },
      take: 500 // Limit to prevent sitemap from being too large
    });

    for (const locale of locales) {
      for (const thread of forumThreads) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/forum/thread/${thread.id}`,
          lastModified: thread.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching forum threads for sitemap:', error);
  }

  return sitemapEntries;
}


