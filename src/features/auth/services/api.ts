import {
  CheckEmailDuplicateBody,
  LoginBody,
  SignUpBody,
  VerifyCodeBody,
} from '@/features/auth/types';
import type { Member } from '@/features/member/model/types';
import { authApi, authBffHttp, publicApi } from '@/lib/http';

export const authService = {
  login: async (body: LoginBody) => {
    await authBffHttp.post('/api/v1/auth/login', body, {
      withCredentials: true,
    });
  },
  logout: async () => {
    return authApi.post('/auth/logout');
  },
  getSession: async () => {
    return authBffHttp.get<Member>('/api/v1/member/info');
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
