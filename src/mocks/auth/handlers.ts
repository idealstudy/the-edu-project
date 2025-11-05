import { VerifyCodeBody } from '@/features/auth/types';
import type { Session } from '@/features/auth/types';
import { BASE_URL } from '@/lib/http';
import { HttpResponse, http } from 'msw';

export const DUPLICATE_EMAIL = 'test@gmail.com';
export const VALID_VERIFICATION_CODE = '123456';

export const authHandlers = [
  http.post(BASE_URL + '/auth/login', () => {
    return HttpResponse.json({ status: 200, message: 'OK' });
  }),
  http.get(BASE_URL + '/members/me', () => {
    return HttpResponse.json<{
      status: number;
      message: string;
      data: Session;
    }>({
      status: 200,
      message: 'OK',
      data: {
        auth: 'ROLE_TEACHER',
        nickname: '디에듀',
        email: 'teacher@example.com',
        memberId: 1,
        name: '디에듀',
      },
    });
  }),
  http.post<never, VerifyCodeBody>(
    BASE_URL + '/public/email-verifications/verify-code',
    async ({ request }) => {
      const body = await request.json();

      if (body.code !== VALID_VERIFICATION_CODE) {
        return new HttpResponse(null, { status: 400 });
      }

      return HttpResponse.json();
    }
  ),
  http.post(BASE_URL + '/auth/sign-up', () => {
    return HttpResponse.json();
  }),
];
