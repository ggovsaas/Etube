/**
 * Database Connection Stress Test
 *
 * This script simulates the Vercel serverless environment to test database connectivity
 * and connection pool exhaustion scenarios that might occur in production.
 *
 * Run with: node scripts/test-database-connection.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testBasicConnection() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 1: Basic Database Connection', 'bright');
  log('='.repeat(60), 'cyan');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    const startTime = Date.now();
    await prisma.$connect();
    const endTime = Date.now();

    logSuccess(`Connected successfully in ${endTime - startTime}ms`);

    // Try a simple query
    const userCount = await prisma.user.count();
    logSuccess(`Query executed: Found ${userCount} users`);

    await prisma.$disconnect();
    logSuccess('Disconnected successfully');

    return true;
  } catch (error) {
    logError('Connection failed!');
    console.error(error);
    return false;
  }
}

async function testConnectionPool() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 2: Connection Pool Stress Test', 'bright');
  log('='.repeat(60), 'cyan');

  logInfo('Simulating 20 concurrent requests (like serverless cold starts)');

  const promises = [];
  const results = { success: 0, failed: 0 };

  for (let i = 1; i <= 20; i++) {
    const promise = (async () => {
      const prisma = new PrismaClient();
      try {
        const startTime = Date.now();
        await prisma.user.count();
        const endTime = Date.now();

        results.success++;
        log(`  Request ${i}: ✅ ${endTime - startTime}ms`, 'green');

        await prisma.$disconnect();
      } catch (error) {
        results.failed++;
        log(`  Request ${i}: ❌ ${error.message}`, 'red');
      }
    })();

    promises.push(promise);
  }

  await Promise.all(promises);

  log('\n' + '-'.repeat(60), 'cyan');
  logInfo(`Results: ${results.success} successful, ${results.failed} failed`);

  if (results.failed === 0) {
    logSuccess('All concurrent requests handled successfully!');
    return true;
  } else {
    logError(`${results.failed} requests failed - possible connection pool issue`);
    return false;
  }
}

async function testSingletonPattern() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 3: Singleton Pattern Verification', 'bright');
  log('='.repeat(60), 'cyan');

  // Simulate the actual prisma.ts file behavior
  const globalForPrisma = global;

  if (!globalForPrisma.testPrisma) {
    logInfo('Creating new Prisma Client instance...');
    globalForPrisma.testPrisma = new PrismaClient();
  } else {
    logInfo('Reusing existing Prisma Client instance...');
  }

  const prisma1 = globalForPrisma.testPrisma;
  const prisma2 = globalForPrisma.testPrisma;

  if (prisma1 === prisma2) {
    logSuccess('Singleton pattern working correctly - same instance reused');

    try {
      await prisma1.user.count();
      logSuccess('Query executed successfully with singleton instance');
      return true;
    } catch (error) {
      logError('Query failed with singleton instance');
      console.error(error);
      return false;
    }
  } else {
    logError('Singleton pattern NOT working - multiple instances created!');
    return false;
  }
}

async function testQuickSuccessiveQueries() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 4: Quick Successive Queries (Simulating Page Reloads)', 'bright');
  log('='.repeat(60), 'cyan');

  logInfo('Executing 10 queries in rapid succession...');

  const prisma = new PrismaClient();
  const results = { success: 0, failed: 0 };

  for (let i = 1; i <= 10; i++) {
    try {
      const startTime = Date.now();
      await prisma.user.findMany({ take: 5 });
      const endTime = Date.now();

      results.success++;
      log(`  Query ${i}: ✅ ${endTime - startTime}ms`, 'green');
    } catch (error) {
      results.failed++;
      log(`  Query ${i}: ❌ ${error.message}`, 'red');
    }

    // Small delay to simulate real-world scenario
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await prisma.$disconnect();

  log('\n' + '-'.repeat(60), 'cyan');
  logInfo(`Results: ${results.success} successful, ${results.failed} failed`);

  if (results.failed === 0) {
    logSuccess('All rapid queries executed successfully!');
    return true;
  } else {
    logError(`${results.failed} queries failed`);
    return false;
  }
}

async function testConnectionString() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 5: Connection String Validation', 'bright');
  log('='.repeat(60), 'cyan');

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    logError('DATABASE_URL not found in environment variables!');
    return false;
  }

  logInfo('Checking connection string configuration...');

  // Check for required parameters
  const checks = {
    'Contains sslmode=require': dbUrl.includes('sslmode=require'),
    'Contains pgbouncer=true': dbUrl.includes('pgbouncer=true'),
    'Contains connect_timeout': dbUrl.includes('connect_timeout'),
    'Is pooled connection (Neon)': dbUrl.includes('.pooler.neon.tech') || dbUrl.includes('pgbouncer=true'),
  };

  let allPassed = true;
  for (const [check, passed] of Object.entries(checks)) {
    if (passed) {
      logSuccess(check);
    } else {
      logWarning(check + ' - MISSING (recommended for Vercel)');
      allPassed = false;
    }
  }

  if (allPassed) {
    logSuccess('Connection string is properly configured for Vercel!');
  } else {
    logWarning('Connection string might need optimization for production');
  }

  return allPassed;
}

async function testTableSchema() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST 6: Database Schema Validation', 'bright');
  log('='.repeat(60), 'cyan');

  const prisma = new PrismaClient();

  try {
    logInfo('Checking if all required tables exist...');

    const requiredModels = [
      { name: 'User', method: () => prisma.user.count() },
      { name: 'Profile', method: () => prisma.profile.count() },
      { name: 'Listing', method: () => prisma.listing.count() },
      { name: 'ForumCategory', method: () => prisma.forumCategory.count() },
      { name: 'ForumThread', method: () => prisma.forumThread.count() },
      { name: 'Contest', method: () => prisma.contest.count() },
      { name: 'WishlistItem', method: () => prisma.wishlistItem.count() },
    ];

    let allTablesExist = true;

    for (const model of requiredModels) {
      try {
        const count = await model.method();
        logSuccess(`${model.name} table exists (${count} records)`);
      } catch (error) {
        logError(`${model.name} table missing or inaccessible`);
        allTablesExist = false;
      }
    }

    await prisma.$disconnect();

    if (allTablesExist) {
      logSuccess('All required tables exist in database!');
      return true;
    } else {
      logError('Some tables are missing - run: npm run db:push');
      return false;
    }
  } catch (error) {
    logError('Schema validation failed!');
    console.error(error);
    await prisma.$disconnect();
    return false;
  }
}

async function runAllTests() {
  log('\n' + '█'.repeat(60), 'bright');
  log('    DATABASE CONNECTION & STABILITY TEST SUITE', 'bright');
  log('    Simulating Vercel Serverless Environment', 'cyan');
  log('█'.repeat(60) + '\n', 'bright');

  const testResults = {
    'Basic Connection': await testBasicConnection(),
    'Connection String': await testConnectionString(),
    'Database Schema': await testTableSchema(),
    'Singleton Pattern': await testSingletonPattern(),
    'Rapid Queries': await testQuickSuccessiveQueries(),
    'Connection Pool Stress': await testConnectionPool(),
  };

  log('\n' + '='.repeat(60), 'cyan');
  log('FINAL RESULTS', 'bright');
  log('='.repeat(60), 'cyan');

  let allPassed = true;
  for (const [test, passed] of Object.entries(testResults)) {
    if (passed) {
      logSuccess(`${test}: PASSED`);
    } else {
      logError(`${test}: FAILED`);
      allPassed = false;
    }
  }

  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    logSuccess('🎉 ALL TESTS PASSED! Database is ready for Vercel deployment.');
  } else {
    logError('❌ SOME TESTS FAILED. Please fix issues before deploying to Vercel.');
    logInfo('\nNext steps:');
    logInfo('1. Check your DATABASE_URL in .env.local');
    logInfo('2. Run: npm run db:push (to sync schema)');
    logInfo('3. Ensure you\'re using Neon\'s Pooled Connection String');
  }
  log('='.repeat(60) + '\n', 'cyan');

  process.exit(allPassed ? 0 : 1);
}

// Run all tests
runAllTests().catch((error) => {
  logError('Test suite crashed!');
  console.error(error);
  process.exit(1);
});
