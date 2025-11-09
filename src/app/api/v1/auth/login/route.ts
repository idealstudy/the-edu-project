import { NextRequest, NextResponse } from 'next/server';

import {
  applySetCookies,
  extractErrorMessage,
  safeJson,
  serverEnv,
} from '@/lib';

if (!serverEnv.backendApiUrl) throw new Error('BASE_URL is not defined');

export async function POST(request: NextRequest) {
  const body = await request.json();
  const loginResponse = await fetch(`${serverEnv.backendApiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await safeJson(loginResponse);
  if (!loginResponse.ok) {
    const message = extractErrorMessage(payload) ?? '로그인에 실패했습니다.';
    return NextResponse.json({ message }, { status: loginResponse.status });
  }

  const response = NextResponse.json(
    { ok: true },
    { status: loginResponse.status }
  );
  applySetCookies(loginResponse, response);

  // 사용자 정보 조회
  const cookieHeader = loginResponse.headers
    .getSetCookie()
    ?.map((cookie) => cookie.split(';')[0])
    .join('; ');
  const infoResponse = await fetch(`${serverEnv.backendApiUrl}/members/info`, {
    method: 'GET',
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });

  // member 포함해서 반환
  const memberPayload = await safeJson(infoResponse);
  return NextResponse.json(
    { member: memberPayload },
    { headers: response.headers }
  );
}
