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
  // Optimize dev server performance
  experimental: {
    // Reduce memory usage
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  // Speed up compilation
  swcMinify: true,
};

export default nextConfig;
