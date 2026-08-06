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

// admin-impersonating 쿠키 문자열을 직접 만든다(cookies.set 사용 금지 사유는 아래 주석).
const buildAdminImpersonatingCookie = (expired: boolean) => {
  const parts = [
    `admin-impersonating=${expired ? '' : '1'}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${expired ? 0 : 30 * 60}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
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
      // NextResponse.cookies.set 은 자체 쿠키 저장소에서 Set-Cookie 헤더를 다시 직렬화한다.
      // 그 저장소는 앞서 headers.append 로 붙인 원본 쿠키를 모르기 때문에, cookies.set 을
      // 쓰면 이미 붙여둔 Authorization·refresh-token 이 통째로 사라진다
      // (2026-08-06 dev 로그인 전면 실패: 응답은 ok:true 인데 인증 쿠키가 0개 도착).
      // 따라서 이 유틸은 헤더 append 만 사용한다 — 다른 쿠키를 절대 건드리지 않는다.
      target.headers.append(
        'Set-Cookie',
        buildAdminImpersonatingCookie(expired)
      );
      target.headers.append('Set-Cookie', adaptAdminCookieForBff(cookie));
    });
};
