# Database Connection Pooling Configuration

## Prisma Schema Configuration

The `schema.prisma` file has been configured with `relationMode = "prisma"` for serverless environments.

## Connection Pool Limits

Prisma doesn't support setting connection pool limits directly in the `schema.prisma` file. Connection pooling must be configured via the `DATABASE_URL` connection string.

### For Neon PostgreSQL

If you're using Neon (recommended for Vercel), add connection pool parameters to your `DATABASE_URL`:

```
postgresql://user:password@host/db?connection_limit=5&pool_timeout=10
```

### For Standard PostgreSQL

For standard PostgreSQL connections, you can use:

```
postgresql://user:password@host:port/db?connection_limit=5&pool_timeout=10
```

### Recommended Settings for Vercel Serverless

- **connection_limit**: 5 (prevents connection pool exhaustion)
- **pool_timeout**: 10 (seconds to wait for a connection)

### Environment Variable Example

In your `.env.local` or Vercel environment variables:

```env
DATABASE_URL="postgresql://user:password@host:port/db?connection_limit=5&pool_timeout=10"
```

### Using a Connection Pooler (Recommended)

For production serverless environments, consider using a connection pooler like PgBouncer or Neon's built-in connection pooling:

**Neon Connection Pooling:**
- Neon provides built-in connection pooling
- Use the pooled connection string from your Neon dashboard
- It typically includes `?pgbouncer=true` or similar parameters

**Benefits:**
- Better connection management
- Reduced connection overhead
- Improved performance in serverless environments

## Current Configuration

- ✅ `relationMode = "prisma"` - Set in `schema.prisma`
- ✅ Prisma Client Singleton Pattern - Implemented in `src/lib/prisma.ts`
- ⚠️ Connection limit - Must be set in `DATABASE_URL` environment variable

## Next Steps

1. Update your `DATABASE_URL` in Vercel environment variables to include connection pool parameters
2. For Neon users: Use the pooled connection string from your Neon dashboard
3. Monitor connection usage in your database dashboard

