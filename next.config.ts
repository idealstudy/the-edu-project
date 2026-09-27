import type { NextConfig } from 'next';

import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['app.dev.the-edu.site', '*.dev.the-edu.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'theedu.s3.ap-northeast-2.amazonaws.com',
      },
      {
        // R2 이관 이후 이미지 호스트. next/image 미허용으로 study-rooms
        // 목록에서 Invalid src prop 렌더 크래시가 발생해 에러 바운더리
        // 텍스트가 그대로 넘쳐 768/834px 가로 넘침(74px/41px)을 일으킨
        // 실측 결함(dev.d-edu.site 실데이터, 2026-09-25) 수정.
        protocol: 'https',
        hostname: '32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
const shouldEnableSentry = process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

const sentryOptions = {
  silent: true,
  telemetry: false,
  widenClientFileUpload: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'dedu',
  project: 'dedu',
  sentryUrl: 'https://app.glitchtip.com',
};

export default shouldEnableSentry
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
