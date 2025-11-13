import { MemberDTO } from '@/entities/member';
import { factory } from '@/entities/member/core';
import { adapters } from '@/entities/member/infrastructure/member.adapters';
import {
  CheckEmailDuplicateBody,
  LoginBody,
  SignUpBody,
  VerifyCodeBody,
} from '@/features/auth/types';
import { authApi, authBffApi, publicApi } from '@/shared/api';
import { CommonResponse } from '@/types';

export const authService = {
  login: async (body: LoginBody) => {
    await authBffApi.post('/api/v1/auth/login', body, {
      withCredentials: true,
    });
  },
  logout: async () => {
    return authApi.post('/auth/logout');
  },
  getSession: async () => {
    try {
      const response = await authBffApi.get<CommonResponse<MemberDTO>>(
        '/api/v1/member/info'
      );
      const validatedResponse = adapters.fromApi.parse(response);
      return factory.member.create(validatedResponse.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      // console.error('Session Data Parsing Error:', e);
      return null;
    }
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
