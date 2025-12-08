require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

console.log('DATABASE_URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No');

try {
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('\n✅ Database schema synced successfully!');
} catch (error) {
  console.error('\n❌ Error syncing database schema');
  process.exit(1);
}
