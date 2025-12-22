require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

console.log('📊 Pushing Prisma schema to database...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found');

try {
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Schema pushed successfully!');
} catch (error) {
  console.error('❌ Error pushing schema:', error.message);
  process.exit(1);
}
