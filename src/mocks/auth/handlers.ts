import { CheckEmailDuplicateBody, VerifyCodeBody } from '@/features/auth/types';
import { HttpResponse, http } from 'msw';

// TODO: BASE_URL -> 환경변수로 분리 및 삭제 예정
// const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
const API_URL = 'http://mock-spring-api';
export const DUPLICATE_EMAIL = 'test@gmail.com';
export const VALID_VERIFICATION_CODE = '123456';

export const authHandlers = [
  http.post(API_URL + '/auth/login', () => {
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

  http.get(API_URL + '/members/info', ({ request }) => {
    const cookieHeader = request.headers.get('Cookie');

    if (cookieHeader?.includes('session_id=mock-token-success')) {
      return HttpResponse.json(
        {
          data: {
            id: 100,
            name: '테스트유저',
            email: 'theedu1234@success.com',
          },
        },
        { status: 200 }
      );
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post<never, CheckEmailDuplicateBody>(
    API_URL + '/public/email-verifications/check-duplicate',
    async ({ request }) => {
      const body = await request.json();

      if (body.email === DUPLICATE_EMAIL) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),

  http.post<never, VerifyCodeBody>(
    API_URL + '/public/email-verifications/verify-code',
    async ({ request }) => {
      const body = await request.json();

      if (body.code !== VALID_VERIFICATION_CODE) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),

  http.post(API_URL + '/auth/sign-up', () => {
    return HttpResponse.json();
  }),
];
