import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    remotePatterns: [
      { hostname: '*.googleusercontent.com' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'phinf.pstatic.net' },
      { hostname: '*.kakaocdn.net' },
      { hostname: 'localhost' },
      { hostname: 'localhost', port: '3000', protocol: 'http' },
    ],
  },
};

export default nextConfig;
