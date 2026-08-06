import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/shared/constants/api';
import { applySetCookies } from '@/shared/lib';

// 삭제 대상 쿠키와 그 Path. Path 가 다르면 브라우저는 다른 쿠키로 보고 지우지 않는다.
// refresh-token 은 백엔드가 Path=/api/auth/refresh 로 발급하므로 그 경로로 만료시킨다
// (AuthController.java 의 logout 응답과 동일).
const SESSION_COOKIES = [
  { name: 'Authorization', path: '/' },
  { name: 'refresh', path: '/' },
  { name: 'refresh-token', path: '/api/auth/refresh' },
  { name: 'sid', path: '/' },
] as const;

// NextResponse.cookies.delete 는 내부적으로 set 을 호출하고, set 은 기존 Set-Cookie
// 헤더를 버린 뒤 자체 저장소만 다시 직렬화한다. 그래서 바로 위에서 applySetCookies 가
// 붙인 백엔드 만료 헤더(특히 refresh-token)가 통째로 사라진다
// — 2026-08-06 로그인 장애와 똑같은 경로다. 따라서 헤더 append 만 쓴다.
const buildExpiredCookie = (name: string, path: string) =>
  [
    `${name}=`,
    `Path=${path}`,
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ');

// AuthLayout에서 만료·미인증 쿠키가 감지될 때 호출된다.
// 백엔드 logout 성공 여부와 무관하게 쿠키를 직접 삭제한 뒤 /login으로 리다이렉트한다.
export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  // 백엔드 logout 응답의 Set-Cookie 헤더 적용 (domain 등 속성 포함)
  try {
    const logoutResponse = await fetch(
      `${serverEnv.backendApiUrl}/auth/logout`,
      {
        method: 'POST',
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        cache: 'no-store',
      }
    );
    applySetCookies(logoutResponse, response);
  } catch {
    // 네트워크 오류 시 아래 직접 삭제로 폴백
  }

  // 백엔드 응답과 무관하게 직접 삭제 (만료 토큰으로 logout 실패 시 폴백)
  SESSION_COOKIES.forEach(({ name, path }) =>
    response.headers.append('Set-Cookie', buildExpiredCookie(name, path))
  );

  return response;
}
