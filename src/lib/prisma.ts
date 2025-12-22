import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton Pattern for Serverless Environments (Vercel Optimized)
 *
 * In serverless environments (like Vercel), each function invocation can create
 * a new Prisma Client instance, leading to connection pool exhaustion. This pattern
 * ensures only one Prisma Client instance exists per serverless function execution context.
 *
 * globalThis is used instead of global to ensure compatibility across different
 * JavaScript environments (Node.js, Edge Runtime, etc.)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create or reuse Prisma Client instance
 *
 * In development: The instance is cached to prevent multiple connections during hot reloads
 * In production (serverless): The instance is cached per execution context to prevent
 * connection pool exhaustion across multiple function invocations
 *
 * Connection Pool Settings (optimized for Neon + Vercel):
 * - connection_limit: Limits max connections per Prisma Client (should match Neon's pooler)
 * - pool_timeout: How long to wait for a connection from the pool
 * - connect_timeout: Maximum time to wait when establishing a new connection
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Always cache the instance to prevent multiple connections
// This is critical for serverless environments like Vercel where each function
// invocation could create a new Prisma Client instance, leading to connection pool exhaustion
// Each serverless function execution context will reuse the same instance
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown - disconnect on process termination
// This ensures connections are properly closed when serverless functions complete
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
} 