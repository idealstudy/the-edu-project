import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// 2026-08-06 회귀 방지.
// clear-session 은 백엔드 logout 의 Set-Cookie(특히 Path=/api/auth/refresh 인 refresh-token
// 만료 헤더)를 그대로 흘려보내야 한다. 과거 구현은 response.cookies.delete 를 써서
// 그 헤더를 통째로 날렸다 — 로그인 장애와 같은 원인(cookies API 가 Set-Cookie 재직렬화).

const backendLogoutResponse = () =>
  new Response(null, {
    headers: {
      'Set-Cookie':
        'refresh-token=; Path=/api/auth/refresh; Max-Age=0; HttpOnly; SameSite=Lax',
    },
  });

describe('clear-session 쿠키 정리', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => backendLogoutResponse())
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('백엔드 만료 헤더를 지우지 않고, refresh-token 도 올바른 Path 로 만료시킨다', async () => {
    const { GET } = await import('@/app/api/v1/auth/clear-session/route');
    const { NextRequest } = await import('next/server');

    const response = await GET(
      new NextRequest('https://dev.d-edu.site/api/v1/auth/clear-session')
    );
    const cookies = response.headers.getSetCookie();

    // 백엔드가 내려준 만료 헤더가 살아있다
    expect(
      cookies.some(
        (c) =>
          c.startsWith('refresh-token=') && c.includes('Path=/api/auth/refresh')
      )
    ).toBe(true);
    // 폴백 삭제 대상이 전부 포함된다
    for (const name of [
      'Authorization',
      'admin-return',
      'admin-impersonating',
      'refresh',
      'refresh-token',
      'sid',
    ]) {
      expect(cookies.some((c) => c.startsWith(`${name}=`))).toBe(true);
    }
    for (const path of ['/', '/api/v1/admin', '/api/admin']) {
      expect(
        cookies.some(
          (cookie) =>
            cookie.startsWith('admin-return=') &&
            cookie.includes(`Path=${path}`) &&
            cookie.includes('Max-Age=0')
        )
      ).toBe(true);
    }
  });
});
