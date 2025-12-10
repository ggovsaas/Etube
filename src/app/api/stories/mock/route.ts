import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Find profiles in Lisboa (or create test data)
    let profiles = await prisma.profile.findMany({
      where: {
        city: {
          contains: 'Lisboa',
          mode: 'insensitive'
        }
      },
      take: 2
    });

    if (profiles.length === 0) {
      // Create test users
      const testUser1 = await prisma.user.create({
        data: {
          email: `test-story-1-${Date.now()}@example.com`,
          name: 'Hela',
          role: 'ESCORT'
        }
      });

      const testUser2 = await prisma.user.create({
        data: {
          email: `test-story-2-${Date.now()}@example.com`,
          name: 'Jesse',
          role: 'ESCORT'
        }
      });

      // Create profiles
      const profile1 = await prisma.profile.create({
        data: {
          userId: testUser1.id,
          name: 'Hela',
          age: 25,
          city: 'Lisboa',
          gender: 'Woman',
          profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616c4e1e8c7?w=400&h=400&fit=crop&crop=face'
        }
      });

      const profile2 = await prisma.profile.create({
        data: {
          userId: testUser2.id,
          name: 'Jesse',
          age: 28,
          city: 'Lisboa',
          gender: 'Woman',
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
        }
      });

      profiles = [profile1, profile2];
    }

    // Check if stories already exist for these profiles
    const existingStories = await prisma.story.findMany({
      where: {
        profileId: {
          in: profiles.map(p => p.id)
        }
      }
    });

    if (existingStories.length > 0) {
      return NextResponse.json({
        message: 'Stories already exist for these profiles',
        profiles: profiles.map(p => ({ id: p.id, name: p.name }))
      });
    }

    // Create stories
    const stories = await prisma.story.createMany({
      data: [
        {
          mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop',
          storyOrder: 0,
          profileId: profiles[0].id
        },
        {
          mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
          storyOrder: 0,
          profileId: profiles[1]?.id || profiles[0].id
        },
        ...(profiles[1] ? [{
          mediaUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop',
          storyOrder: 1,
          profileId: profiles[1].id
        }] : [])
      ]
    });

    return NextResponse.json({
      message: 'Mock stories created successfully',
      storiesCreated: stories.count,
      profiles: profiles.map(p => ({ id: p.id, name: p.name, city: p.city }))
    });
  } catch (error) {
    console.error('Error creating mock stories:', error);
    return NextResponse.json(
      { error: 'Failed to create mock stories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



