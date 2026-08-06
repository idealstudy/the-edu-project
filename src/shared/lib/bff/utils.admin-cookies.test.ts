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
