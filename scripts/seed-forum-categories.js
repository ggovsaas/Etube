const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedForumCategories() {
  try {
    console.log('🌱 Seeding forum categories...');

    const categories = [
      {
        name: 'Reviews',
        description: 'Share your experiences and read reviews',
        slug: 'reviews',
        order: 1
      },
      {
        name: 'General Chat',
        description: 'General discussions and conversations',
        slug: 'general-chat',
        order: 2
      },
      {
        name: 'Questions & Answers',
        description: 'Ask questions and get answers from the community',
        slug: 'questions-answers',
        order: 3
      },
      {
        name: 'Announcements',
        description: 'Important announcements and updates',
        slug: 'announcements',
        order: 4
      }
    ];

    for (const category of categories) {
      const existing = await prisma.forumCategory.findUnique({
        where: { slug: category.slug }
      });

      if (!existing) {
        await prisma.forumCategory.create({
          data: category
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }

    console.log('✅ Forum categories seeded successfully!');
    console.log('\n📋 You can now visit:');
    console.log('   http://localhost:3000/pt/forum');
    console.log('   http://localhost:3000/es/forum');

  } catch (error) {
    console.error('❌ Error seeding forum categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedForumCategories();

