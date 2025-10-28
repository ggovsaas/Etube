import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  experimental: {
    // Disable static optimization
    staticPageGenerationTimeout: 1000,
  },
};

export default nextConfig;
