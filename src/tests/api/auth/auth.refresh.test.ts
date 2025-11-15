import { server } from '@/mocks/node';
import { env } from '@/shared/constants/api';
import { HttpResponse, http } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const REFRESH_URL = `${env.backendApiUrl}/auth/refresh`;
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('토큰 재발급 핸들러 테스트 (GET /api/v1/auth/refresh)', () => {
  // ----------------------------------------------------
  // 성공 시나리오 (기본 핸들러) 검증: 204 No Content
  // ----------------------------------------------------
  it('[재발급 성공] 유효한 리프레시 토큰으로 세션 토큰 재발급 및 쿠키 전달 확인 (204)', async () => {
    // 유효한 refresh 토큰을 포함한 Cookie 헤더를 보낸다고 가정
    // 실제로는 토큰이 없어도 204가 반환되지만, 성공 케이스의 의도를 반영
    const response = await fetch(REFRESH_URL, {
      method: 'GET',
      headers: {
        Cookie: 'refresh=valid_refresh_token_xyz',
      },
    });

    expect(response.status).toBe(204);

    // response.headers.get('Set-Cookie')는 첫 번째 값만 가져오지만
    // 실제 환경에서는 getSetCookie()를 사용해야 여러 배열을 가져올 수 있음.
    // 여기서는 Node.js fetch 환경에서 흔히 쓰이는 .get('Set-Cookie')로
    // 첫 번째 쿠키를 검증하고 여러 개의 헤더가 네트워크상으로는 잘 전송되는지 확인
    const setCookieHeader = response.headers.get('Set-Cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('sid=new_session_id');
  });

  // ----------------------------------------------------
  // 실패 시나리오 (401 Unauthorized) 검증
  // ----------------------------------------------------
  it('[재발급 실패] 리프레시 토큰이 만료 또는 유효하지 않을 경우 401 에러 반환', async () => {
    server.use(
      http.get(REFRESH_URL, () =>
        HttpResponse.json(
          { message: 'Refresh token expired or invalid.' },
          { status: 401 }
        )
      )
    );

    const response = await fetch(REFRESH_URL, {
      method: 'GET',
      headers: {
        Cookie: 'refresh=expired_or_invalid_token',
      },
    });

    const jsonBody = await response.json();
    expect(response.status).toBe(401);
    expect(jsonBody.message).toBe('Refresh token expired or invalid.');
    expect(response.headers.get('Set-Cookie')).toBeNull();
  });
});
