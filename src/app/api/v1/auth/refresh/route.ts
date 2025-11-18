import { NextRequest, NextResponse } from 'next/server';

import { serverEnv } from '@/shared/constants/api';
import { applySetCookies } from '@/shared/lib';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const refreshResponse = await fetch(
    `${serverEnv.backendApiUrl}/auth/refresh`,
    {
      method: 'GET',
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      cache: 'no-store',
    }
  );

  if (refreshResponse.status === 204) {
    const response = new NextResponse(null, { status: refreshResponse.status });
    applySetCookies(refreshResponse, response);
    return response;
  }

  const body = await refreshResponse.text();
  const response = new NextResponse(body || null, {
    status: refreshResponse.status,
    headers: {
      'Content-Type':
        refreshResponse.headers.get('Content-Type') ?? 'text/plain',
    },
  });
  applySetCookies(refreshResponse, response);
  return response;
}
