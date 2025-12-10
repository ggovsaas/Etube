import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMockStories() {
  try {
    console.log('Adding mock stories...');

    // Find profiles in Lisboa (or create test data)
    const profiles = await prisma.profile.findMany({
      where: {
        city: {
          contains: 'Lisboa',
          mode: 'insensitive'
        }
      },
      take: 2
    });

    if (profiles.length === 0) {
      console.log('No profiles found in Lisboa. Creating test profiles...');
      
      // Create a test user first
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

      // Create profiles for these users
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

      // Create stories for these profiles
      await prisma.story.createMany({
        data: [
          {
            mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop',
            storyOrder: 0,
            profileId: profile1.id
          },
          {
            mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
            storyOrder: 0,
            profileId: profile2.id
          },
          {
            mediaUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1200&fit=crop',
            storyOrder: 1,
            profileId: profile2.id
          }
        ]
      });

      console.log('✅ Created 2 test profiles with 3 stories total');
    } else {
      console.log(`Found ${profiles.length} profiles in Lisboa. Adding stories...`);

      // Add stories to existing profiles
      for (let i = 0; i < Math.min(profiles.length, 2); i++) {
        const profile = profiles[i];
        
        await prisma.story.createMany({
          data: [
            {
              mediaUrl: `https://images.unsplash.com/photo-${1517841905240 + i}?w=800&h=1200&fit=crop`,
              storyOrder: 0,
              profileId: profile.id
            },
            ...(i === 1 ? [{
              mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
              storyOrder: 1,
              profileId: profile.id
            }] : [])
          ]
        });
      }

      console.log(`✅ Added stories to ${Math.min(profiles.length, 2)} profiles`);
    }

    console.log('✅ Mock stories added successfully!');
  } catch (error) {
    console.error('❌ Error adding mock stories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMockStories();



