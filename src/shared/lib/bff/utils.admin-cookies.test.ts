import { NextResponse } from 'next/server';

import { describe, expect, it } from 'vitest';

import { applyAdminReturnCookieForBff } from './utils.admin-cookies';

describe('admin-return BFF cookie adaptation', () => {
  it('narrows the browser cookie to the BFF admin route and sets a non-secret page marker', () => {
    const source = new Response(null, {
      headers: {
        'Set-Cookie':
          'admin-return=packed; Path=/api/admin; Max-Age=1800; HttpOnly; Secure; SameSite=Lax',
      },
    });
    const target = new NextResponse(null);

    applyAdminReturnCookieForBff(source, target);

    const cookies = target.headers.getSetCookie();
    expect(
      cookies.some((cookie) => cookie.includes('Path=/api/v1/admin'))
    ).toBe(true);
    expect(
      cookies.some(
        (cookie) =>
          cookie.includes('admin-impersonating=1') && cookie.includes('Path=/')
      )
    ).toBe(true);
  });

  it('expires the page marker when the return cookie is cleared', () => {
    const source = new Response(null, {
      headers: {
        'Set-Cookie':
          'admin-return=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
      },
    });
    const target = new NextResponse(null);

    applyAdminReturnCookieForBff(source, target);

    expect(
      target.headers
        .getSetCookie()
        .some(
          (cookie) =>
            cookie.includes('admin-impersonating=') && /Max-Age=0/i.test(cookie)
        )
    ).toBe(true);
  });
});

describe('회귀 방지 — 인증 쿠키 보존', () => {
  // 2026-08-06 dev 로그인 전면 실패: BFF 응답이 ok:true 인데 Authorization·refresh-token 이
  // 브라우저에 0개 도착했다. 원인 = NextResponse.cookies.set 이 자체 저장소에서 Set-Cookie 를
  // 재직렬화하며 앞서 headers.append 로 붙인 쿠키를 통째로 날린 것.
  it('앞서 붙인 Authorization·refresh-token 을 지우지 않는다', () => {
    const target = new NextResponse(null);
    target.headers.append(
      'Set-Cookie',
      'Authorization=token-a; Path=/; HttpOnly'
    );
    target.headers.append(
      'Set-Cookie',
      'refresh-token=token-r; Path=/; HttpOnly'
    );

    const source = new Response(null, {
      headers: {
        'Set-Cookie':
          'admin-return=packed; Path=/api/admin; Max-Age=1800; HttpOnly; Secure; SameSite=Lax',
      },
    });

    applyAdminReturnCookieForBff(source, target);

    const cookies = target.headers.getSetCookie();
    expect(cookies.some((c) => c.startsWith('Authorization='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh-token='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('admin-impersonating='))).toBe(
      true
    );
  });
});
