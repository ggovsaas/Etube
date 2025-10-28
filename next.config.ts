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
  // Disable static generation to avoid useSearchParams issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
