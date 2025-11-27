import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'car-rental-api.goit.global',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ac.goit.global',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
