import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  applySetCookies,
  extractErrorMessage,
  safeJson,
  serverEnv,
} from '@/lib';

if (!serverEnv.backendApiUrl) throw new Error('BASE_URL is not defined');

export async function GET() {
  const cookieJar = await cookies();
  const token = cookieJar.get('Authorization') ?? cookieJar.get('sid');
  if (!token) return new NextResponse(null, { status: 204 });

  const allow = new Set(['Authorization', 'refresh']);
  const cookieHeader = cookieJar
    .getAll()
    .filter((cookie) => allow.has(cookie.name))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const infoResponse = await fetch(`${serverEnv.backendApiUrl}/members/info`, {
    method: 'GET',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });

  // 204 No Content는 별도로 처리
  // 그 외 에러(4xx, 5xx)처리
  const payload = await safeJson(infoResponse);
  if (!infoResponse.ok) {
    const message =
      extractErrorMessage(payload) ?? '멤버 정보를 가져오는데 실패했습니다.';
    return NextResponse.json({ message }, { status: infoResponse.status });
  }

  let response: NextResponse;
  if (infoResponse.status === 204) {
    response = new NextResponse(null, { status: infoResponse.status });
    return response;
  } else {
    response = NextResponse.json(payload ?? null, {
      status: infoResponse.status,
    });
  }

  applySetCookies(infoResponse, response);
  return response;
}
