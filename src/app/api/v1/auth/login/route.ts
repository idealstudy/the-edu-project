import { NextRequest, NextResponse } from 'next/server';

import {
  applySetCookies,
  extractErrorMessage,
  safeJson,
  serverEnv,
} from '@/shared/lib';

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

  const response = NextResponse.json({ ok: true }, { status: 200 });
  applySetCookies(loginResponse, response);
  return response;
}
