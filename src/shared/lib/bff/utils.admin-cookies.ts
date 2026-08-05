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
      target.headers.append('Set-Cookie', adaptAdminCookieForBff(cookie));
    });
};
