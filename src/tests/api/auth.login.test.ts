import { NextRequest } from 'next/server';

import { POST } from '@/app/api/v1/auth/login/route';
import { server } from '@/mocks/node';
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

process.env.NEXT_PUBLIC_SPRING_SERVER_BASE_URL = 'http://mock-spring-api';
const MOCK_BASE_URL = process.env.NEXT_PUBLIC_SPRING_SERVER_BASE_URL;
const LOGIN_URL = `${MOCK_BASE_URL}/auth/login`;
const MEMBER_URL = `${MOCK_BASE_URL}/members/info`;

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// mock
vi.mock('@/lib', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib')>();
  return {
    ...original,
    normalizeMember: vi.fn((payload) => payload.data),
    createSessionCookieHeader: vi.fn(
      (setCookies) => setCookies[0].split(';')[0]
    ),
    extractErrorMessage: original.extractErrorMessage,
    safeJson: original.safeJson,
    getSetCookies: original.getSetCookies,
  };
});

// tc
describe('로그인 BFF 핸들러 테스트 (POST /api/v1/auth/login)', () => {
  it('[로그인 성공] 로그인 및 회원 정보 조회 후 쿠키 전달 확인', async () => {
    const mockReqest = {
      json: async () => ({
        email: 'theedu1234@success.com',
        password: 'Validpassword1234',
      }),
    } as unknown as NextRequest;

    const response = await POST(mockReqest);
    const jsonBody = await response.json();

    // 응답, 응답 본문 검증
    expect(response.status).toBe(200);
    expect(jsonBody.member).toEqual({
      id: 100,
      name: '테스트유저',
      email: 'theedu1234@success.com',
    });

    // 쿠키 검증
    const setCookieHeader = response.headers.get('Set-Cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('session_id=mock-token-success');
  });

  it('[로그인 실패] 스프링 서버에서 401 Unauthorized 반환 시 에러 메시지 전달 확인', async () => {
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

  it('[예외 케이스] 로그인 성공 후 회원 정보 조회 API가 500 오류를 반환해도 로그인 성공으로 처리 (멤버 정보는 null)', async () => {
    server.use(
      http.get(MEMBER_URL, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const mockRequest = {
      json: async () => ({
        email: 'theedu1234@success.com',
        password: 'Validpassword1234',
      }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const jsonBody = await response.json();

    expect(response.status).toBe(200);
    expect(jsonBody.member).toBeNull();
    expect(response.headers.get('Set-Cookie')).toContain(
      'session_id=mock-token-success'
    );
  });
});
