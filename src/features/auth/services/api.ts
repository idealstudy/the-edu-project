import {
  CheckEmailDuplicateBody,
  LoginBody,
  SignUpBody,
  VerifyCodeBody,
} from '@/features/auth/type';
import type { Member } from '@/features/member/model/types';
import { authApi, publicApi } from '@/lib/http/api';

export const authService = {
  login: async (body: LoginBody) => {
    await publicApi.post('/auth/login', body, { withCredentials: true });
  },
  logout: async () => {
    return authApi.post('/auth/logout');
  },
  getSession: async () => {
    return authApi.get<Member>('/members/info');
  },
  checkEmailDuplicate: async (body: CheckEmailDuplicateBody) => {
    return publicApi.post('/public/email-verifications/check-duplicate', body);
  },
  verifyCode: async (body: VerifyCodeBody) => {
    return publicApi.post('/public/email-verifications/verify-code', body);
  },
  signUp: async (body: SignUpBody) => {
    return publicApi.post('/auth/sign-up', body);
  },
};
