import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['app.dev.the-edu.site', '*.dev.the-edu.site'],
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
