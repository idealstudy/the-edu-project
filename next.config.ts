import type { NextConfig } from 'next';

import { withSentryConfig } from '@sentry/nextjs';
import { execFileSync } from 'node:child_process';

import packageJson from './package.json';

const resolveBuildCommit = () => {
  const vercelCommit = process.env.VERCEL_GIT_COMMIT_SHA?.trim();

  if (vercelCommit) return vercelCommit.slice(0, 7);

  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'local';
  }
};

const appVersion = packageJson.version;
const buildCommit = resolveBuildCommit();
const builtAt = new Date().toISOString();
const appEnvironment =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local';
const appVersionIdentity = `${appVersion}+${buildCommit}`;

const nextConfig: NextConfig = {
  allowedDevOrigins: ['app.dev.the-edu.site', '*.dev.the-edu.site'],
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_APP_COMMIT: buildCommit,
    NEXT_PUBLIC_APP_BUILT_AT: builtAt,
    NEXT_PUBLIC_APP_ENV: appEnvironment,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-app-version',
            value: appVersionIdentity,
          },
        ],
      },
    ];
  },
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
