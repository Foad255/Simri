import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1e65f4qp3r37w.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'glioblastoma001.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, context: WebpackConfigContext) => {
    if (!context.isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
