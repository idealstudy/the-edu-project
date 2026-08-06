import { NextResponse } from 'next/server';

import { applySetCookies } from '@/shared/lib/bff/utils.cookies';
import { afterEach, describe, expect, test, vi } from 'vitest';

const BACKEND_COOKIE =
  'Authorization=test-token; Domain=.d-edu.site; Path=/; Secure; HttpOnly; SameSite=None';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('sanitizeCookieForLocalhost', () => {
  const applyCookie = () => {
    const source = new Response(null, {
      headers: { 'Set-Cookie': BACKEND_COOKIE },
    });
    const target = NextResponse.json({ ok: true });

    applySetCookies(source, target);
    return target.headers.get('Set-Cookie');
  };

  test('개발 localhost에서는 host-only Lax 쿠키로 변환한다', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_GTM', '');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_SENTRY', '');

    expect(applyCookie()).toBe(
      'Authorization=test-token; Path=/; HttpOnly; SameSite=Lax'
    );
  });

  test('Vercel Preview에서는 Domain만 제거하고 HTTPS 속성을 보존한다', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_GTM', '');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_SENTRY', '');

    expect(applyCookie()).toBe(
      'Authorization=test-token; Path=/; Secure; HttpOnly; SameSite=None'
    );
  });

  test('운영 도메인에서는 백엔드 쿠키 속성을 변경하지 않는다', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://d-edu.site');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_GTM', 'true');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_SENTRY', 'true');

    expect(applyCookie()).toBe(BACKEND_COOKIE);
  });
});
