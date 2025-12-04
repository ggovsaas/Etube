import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton Pattern for Serverless Environments
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
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })

// Always cache the instance to prevent multiple connections
// This is critical for serverless environments like Vercel where each function
// invocation could create a new Prisma Client instance, leading to connection pool exhaustion
// Each serverless function execution context will reuse the same instance
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
} 