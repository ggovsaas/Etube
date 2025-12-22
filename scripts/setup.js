const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function setup() {
  try {
    console.log('🚀 Setting up Dating Directory...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@datingdirectory.com',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User'
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@datingdirectory.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setup(); 