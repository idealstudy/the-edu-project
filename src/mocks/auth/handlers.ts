import { CheckEmailDuplicateBody, VerifyCodeBody } from '@/features/auth/types';
import { env } from '@/shared/constants/api';
import { HttpResponse, http } from 'msw';

// const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
export const DUPLICATE_EMAIL = 'test@gmail.com';
export const VALID_VERIFICATION_CODE = '123456';

export const authHandlers = [
  http.post(env.backendApiUrl + '/auth/login', () => {
    return HttpResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'session_id=mock-token-success; Path=/; HttpOnly',
        },
      }
    );
  }),

  http.get(env.backendApiUrl + '/members/info', ({ request }) => {
    const cookieHeader = request.headers.get('Cookie');
    if (
      !cookieHeader ||
      !cookieHeader.includes('session_id=mock-token-success')
    ) {
      return HttpResponse.json(
        { message: '인증 정보가 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        id: 1,
        email: 'theedu1234@success.com',
        name: 'Mock User',
      },
      { status: 200 }
    );
  }),

  // 결함1 수정(2026-08-12)으로 공개(publicHttp) 요청이 브라우저에서는
  // 절대경로(env.backendApiUrl)가 아니라 앱 자신의 상대경로(/api/v1)를
  // 탄다. jsdom 테스트 환경도 window가 있어 상대경로를 탄다 — 두 형태를
  // 다 잡도록 origin 무관 와일드카드(`*`)로 매칭한다.
  http.post<never, CheckEmailDuplicateBody>(
    '*/public/email-verifications/check-duplicate',
    async ({ request }) => {
      const body = await request.json();

      if (body.email === DUPLICATE_EMAIL) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),

  http.post<never, VerifyCodeBody>(
    '*/public/email-verifications/verify-code',
    async ({ request }) => {
      const body = await request.json();

      if (body.code !== VALID_VERIFICATION_CODE) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),

  http.post(env.backendApiUrl + '/auth/sign-up', () => {
    return HttpResponse.json();
  }),
];
