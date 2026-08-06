import { NextResponse } from 'next/server';

import { collectSetCookies } from './utils.cookies';

const adaptAdminCookieForBff = (cookie: string) => {
  let adapted = cookie.replace(
    /Path=\/api\/admin(?=;|$)/i,
    'Path=/api/v1/admin'
  );
  if (process.env.NODE_ENV !== 'production') {
    adapted = adapted
      .replace(/;\s*Domain=[^;]*/gi, '')
      .replace(/;\s*Secure(?=;|$)/gi, '')
      .replace(/SameSite=None/gi, 'SameSite=Lax');
  }
  return adapted;
};

export const applyAdminReturnCookieForBff = (
  source: Response,
  target: NextResponse
) => {
  collectSetCookies(source)
    .filter((cookie) => cookie.startsWith('admin-return='))
    .forEach((cookie) => {
      const expired =
        /^admin-return=;/i.test(cookie) || /Max-Age=0(?:;|$)/i.test(cookie);
      target.cookies.set('admin-impersonating', expired ? '' : '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expired ? 0 : 30 * 60,
      });
      target.headers.append('Set-Cookie', adaptAdminCookieForBff(cookie));
    });
};
