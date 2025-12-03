import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { serverEnv } from '@/shared/constants/api';
import { extractErrorMessage, safeJson } from '@/shared/lib';

if (!serverEnv.backendApiUrl) throw new Error('BASE_URL is not defined');

/**
 * [GET] 알림 목록 조회
 */
export async function GET() {
  // 쿠키에서 인증 토큰 가져오기
  const cookieJar = await cookies();
  const token = cookieJar.get('Authorization') ?? cookieJar.get('sid');

  // 인증 토큰 없으면 401
  if (!token) {
    return NextResponse.json(
      { message: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  // 필요한 쿠키만 필터링
  const allow = new Set(['Authorization', 'refresh']);
  const cookieHeader = cookieJar
    .getAll()
    .filter((cookie) => allow.has(cookie.name))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // 백엔드 API 호출
  const response = await fetch(`${serverEnv.backendApiUrl}/notification/all`, {
    method: 'GET',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });

  // 응답 처리
  const payload = await safeJson(response);

  // 에러 처리
  if (!response.ok) {
    const message =
      extractErrorMessage(payload) ?? '알림을 가져오는데 실패했습니다.';
    return NextResponse.json({ message }, { status: response.status });
  }

  if (!payload?.data) {
    // [BFF Notification] 백엔드 응답 data 필드 없음
    return NextResponse.json({
      status: 200,
      message: 'success',
      data: [],
    });
  }

  // 성공 - 데이터 반환
  return NextResponse.json(payload);
}
