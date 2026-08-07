import { NextResponse } from 'next/server';

import { describe, expect, it } from 'vitest';

import { applySetCookies } from './utils.cookies';

describe('refresh-token Path 를 BFF 경로로 교정', () => {
  // 2026-08-07 브라우저 검사에서 관측: 백엔드가 Path=/api/auth/refresh 로 발급하는데
  // 브라우저는 BFF 의 /api/v1/auth/refresh 를 부른다. 경로가 어긋나면 쿠키가 전송되지
  // 않아 세션 갱신이 항상 실패하고, 접근 토큰 만료 시 사용자가 로그아웃된다.
  it('백엔드 refresh-token 의 Path 를 /api/v1/auth/refresh 로 바꾼다', () => {
    const source = new Response(null, {
      headers: {
        'Set-Cookie':
          'refresh-token=abc; Path=/api/auth/refresh; Max-Age=604800; HttpOnly; Secure; SameSite=None',
      },
    });
    const target = new NextResponse(null);

    applySetCookies(source, target);

    const cookies = target.headers.getSetCookie();
    expect(
      cookies.some(
        (c) =>
          c.startsWith('refresh-token=') &&
          c.includes('Path=/api/v1/auth/refresh')
      )
    ).toBe(true);
    expect(cookies.some((c) => c.includes('Path=/api/auth/refresh;'))).toBe(
      false
    );
  });

  it('다른 쿠키의 Path 는 건드리지 않는다', () => {
    const source = new Response(null, {
      headers: { 'Set-Cookie': 'Authorization=xyz; Path=/; HttpOnly' },
    });
    const target = new NextResponse(null);

    applySetCookies(source, target);

    expect(
      target.headers.getSetCookie().some((c) => c.includes('Path=/;'))
    ).toBe(true);
  });
});
