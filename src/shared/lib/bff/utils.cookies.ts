import { NextResponse } from 'next/server';

export const safeJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const headerWithGetSetCookie = (headers: Headers) => {
  return headers as unknown as { getSetCookie?: () => string[] };
};

export const collectSetCookies = (response: Response): string[] => {
  const accessor = headerWithGetSetCookie(response.headers);
  if (typeof accessor.getSetCookie === 'function') {
    return accessor.getSetCookie();
  }
  const single = response.headers.get('set-cookie');
  return single ? [single] : [];
};

export const createSessionCookieHeader = (setCookies: string[]): string => {
  return setCookies
    .map((cookie) => cookie.split(';')[0])
    .filter(Boolean)
    .join('; ');
};

const sanitizeCookieForLocalhost = (cookie: string) => {
  if (process.env.NODE_ENV === 'production') {
    return cookie;
  }

  return cookie.replace(/Domain=[^;]+;?\s*/i, '');
};

export const applySetCookies = (source: Response, target: NextResponse) => {
  collectSetCookies(source).forEach((cookie) => {
    target.headers.append('Set-Cookie', sanitizeCookieForLocalhost(cookie));
  });
};
