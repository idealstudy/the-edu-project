import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '@/constants';
import { extractErrorMessage, getSetCookies, safeJson } from '@/lib';
import { appendSetCookies } from '@/lib/bff/utils';

if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');

export async function POST(request: NextRequest) {
  const body = await request.json();
  const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
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
  const setCookies = getSetCookies(loginResponse);
  appendSetCookies(response, setCookies);
  return response;
}
