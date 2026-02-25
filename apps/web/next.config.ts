import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Enable React compiler for automatic memoization
    reactCompiler: true,
  },
};

export default nextConfig;
