import { API_BASE_URL } from '@/constants';
import { CheckEmailDuplicateBody, VerifyCodeBody } from '@/features/auth/types';
import { HttpResponse, http } from 'msw';

// const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
export const DUPLICATE_EMAIL = 'test@gmail.com';
export const VALID_VERIFICATION_CODE = '123456';

export const authHandlers = [
  http.post(API_BASE_URL + '/auth/login', () => {
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

  http.post<never, CheckEmailDuplicateBody>(
    API_BASE_URL + '/public/email-verifications/check-duplicate',
    async ({ request }) => {
      const body = await request.json();

      if (body.email === DUPLICATE_EMAIL) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),

  http.post<never, VerifyCodeBody>(
    API_BASE_URL + '/public/email-verifications/verify-code',
    async ({ request }) => {
      const body = await request.json();

      if (body.code !== VALID_VERIFICATION_CODE) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),

  http.post(API_BASE_URL + '/auth/sign-up', () => {
    return HttpResponse.json();
  }),
];
