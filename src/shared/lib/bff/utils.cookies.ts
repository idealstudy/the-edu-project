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

const isLocalRuntime = () => {
  const appUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const isLocalGtmDisabled = process.env.NEXT_PUBLIC_ENABLE_GTM === 'false';
  const isLocalSentryDisabled =
    process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'false';

  return (
    process.env.NODE_ENV !== 'production' ||
    appUrl.includes('localhost') ||
    appUrl.includes('127.0.0.1') ||
    (isLocalGtmDisabled && isLocalSentryDisabled)
  );
};

const sanitizeCookieForLocalhost = (cookie: string) => {
  // 로컬 production 실행에서는 dev 백엔드 Domain 쿠키를 localhost에 저장할 수 없다.
  // Vercel Preview도 vercel.app 도메인이므로 백엔드 Domain과 불일치 → 제거 필요
  const isPreview = process.env.VERCEL_ENV === 'preview';
  if (
    !isLocalRuntime() &&
    !isPreview &&
    process.env.NODE_ENV === 'production'
  ) {
    return cookie;
  }

  let sanitized = cookie.replace(/Domain=[^;]+;?\s*/i, '');
  if (isLocalRuntime() && process.env.NODE_ENV !== 'production') {
    sanitized = sanitized
      .replace(/;?\s*Secure/gi, '')
      .replace(/SameSite=None/gi, 'SameSite=Lax');
  }
  return sanitized;
};

// 백엔드는 refresh-token 을 Path=/api/auth/refresh 로 발급한다. 그런데 브라우저가
// 실제로 부르는 곳은 BFF 의 /api/v1/auth/refresh 다. 경로가 어긋나면 브라우저는
// 그 쿠키를 아예 보내지 않으므로 세션 갱신이 항상 실패하고, 접근 토큰이 만료되는
// 순간 사용자가 로그아웃된다(2026-08-07 브라우저 검사에서 관측).
// admin-return 을 /api/admin -> /api/v1/admin 으로 고쳐 주던 것과 같은 처리다.
export const BFF_REFRESH_PATH = '/api/v1/auth/refresh';

const adaptCookiePathForBff = (cookie: string) =>
  cookie.replace(
    /Path=\/api\/auth\/refresh(?=;|$)/i,
    `Path=${BFF_REFRESH_PATH}`
  );

export const applySetCookies = (source: Response, target: NextResponse) => {
  collectSetCookies(source).forEach((cookie) => {
    target.headers.append(
      'Set-Cookie',
      adaptCookiePathForBff(sanitizeCookieForLocalhost(cookie))
    );
  });
};
