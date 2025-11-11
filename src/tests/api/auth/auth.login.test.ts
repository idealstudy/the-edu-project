import { NextRequest } from 'next/server';

import { POST } from '@/app/api/v1/auth/login/route';
import { server } from '@/mocks/node';
import { env } from '@/shared/lib';
import { HttpResponse, http } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const LOGIN_URL = `${env.backendApiUrl}/auth/login`;

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// mock
vi.mock('@/shared/lib', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/lib')>();
  return {
    ...original,
    normalizeMember: vi.fn((payload) => payload.data),
    createSessionCookieHeader: vi.fn(
      (setCookies) => setCookies[0].split(';')[0]
    ),
    extractErrorMessage: original.extractErrorMessage,
    safeJson: original.safeJson,
    collectSetCookies: original.collectSetCookies,
  };
});

// tc
describe('로그인 BFF 핸들러 테스트 (POST /api/v1/auth/login)', () => {
  it('[로그인 성공]로그인 및 회원 정보 조회 후 쿠키 전달 확인', async () => {
    const mockRequest = {
      json: async () => ({
        email: 'theedu1234@success.com',
        password: 'Validpassword1234',
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const jsonBody = await response.json();

    // 응답, 응답 본문 검증
    expect(response.status).toBe(200);
    /*expect(jsonBody).toEqual({
      ok: true,
    });*/
    expect(jsonBody).toEqual({
      member: {
        id: 1,
        email: 'theedu1234@success.com',
        name: 'Mock User',
      },
    });

    // 쿠키 검증
    const setCookieHeader = response.headers.get('Set-Cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('session_id=mock-token-success');
  });

  it('[로그인 실패]스프링 서버에서 401 Unauthorized 반환 시 에러 메시지 전달 확인', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json(
          { message: '비밀번호가 일치하지 않습니다.' },
          { status: 401 }
        )
      )
    );

    const mockRequest = {
      json: async () => ({ email: 'theedu1234@bad.com', password: 'bad' }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const jsonBody = await response.json();

    expect(response.status).toBe(401);
    expect(jsonBody.message).toBe('비밀번호가 일치하지 않습니다.');
    expect(jsonBody.member).toBeUndefined();
  });

  it('[로그인 실패]스프링 서버에서 500 Internal Server Error 반환 시 에러 처리 확인', async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json(
          { message: '데이터베이스 연결 실패' },
          { status: 500 }
        )
      )
    );

    const mockRequest = {
      json: async () => ({ email: 'theedu1234@fail.com', password: 'fail' }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const jsonBody = await response.json();

    expect(response.status).toBe(500);
    expect(jsonBody.message).toBe('데이터베이스 연결 실패');
  });

  it('[로그인 실패]에러 응답 본문에 메시지가 없을 경우 기본 메시지 전달 확인 (400 Bad Request)', async () => {
    server.use(
      http.post(LOGIN_URL, () => new HttpResponse(null, { status: 400 }))
    );

    const mockRequest = {
      json: async () => ({ email: 'theedu1234@empty.com', password: 'empty' }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const jsonBody = await response.json();

    expect(response.status).toBe(400);
    expect(jsonBody.message).toBe('로그인에 실패했습니다.');
  });
});
