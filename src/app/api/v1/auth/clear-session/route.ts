import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/shared/constants/api';
import { applySetCookies } from '@/shared/lib';

const SESSION_COOKIE_NAMES = ['Authorization', 'refresh', 'sid'] as const;

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
  SESSION_COOKIE_NAMES.forEach((name) => response.cookies.delete(name));

  return response;
}
