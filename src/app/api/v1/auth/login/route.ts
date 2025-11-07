import { NextRequest, NextResponse } from 'next/server';

import type { Member } from '@/features/member/model/types';
import {
  createSessionCookieHeader,
  extractErrorMessage,
  getSetCookies,
  normalizeMember,
  safeJson,
} from '@/lib';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');

export async function POST(request: NextRequest) {
  // 로그인 요청
  const body = await request.json();
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const loginPayload = await safeJson(loginResponse);
  if (!loginResponse.ok) {
    const message =
      extractErrorMessage(loginPayload) ?? '로그인에 실패했습니다.';
    return NextResponse.json({ message }, { status: loginResponse.status });
  }

  const setCookies = getSetCookies(loginResponse);
  const sessionCookieHeader = createSessionCookieHeader(setCookies);

  // 회원 정보 요청(세션 쿠키를 이용해 2차 요청)
  let member: Member | null = null;
  if (sessionCookieHeader) {
    try {
      const infoResponse = await fetch(`${API_BASE_URL}/members/info`, {
        method: 'GET',
        headers: {
          Cookie: sessionCookieHeader,
        },
        cache: 'no-store',
      });

      if (infoResponse.ok) {
        const infoPayload = await safeJson(infoResponse);
        if (infoPayload) {
          member = normalizeMember(infoPayload);
        }
      }
    } catch (error: unknown) {
      // 백엔드 API 호출실패해도 로그인 자체는 성공함
      // TODO: 디버깅 로그
      // eslint-disable-next-line no-console
      console.error('Network error during member info fetch:', error);
      // throw new Error();
    }
  }

  const response = NextResponse.json({ member });
  setCookies.forEach((cookie) => {
    response.headers.append('Set-Cookie', cookie);
  });
  return response;
}
