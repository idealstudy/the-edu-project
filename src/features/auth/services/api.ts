import { MemberDTO } from '@/entities/member';
import { factory } from '@/entities/member/core';
import { adapters } from '@/entities/member/infrastructure/member.adapters';
import {
  CheckEmailDuplicateBody,
  LoginBody,
  SignUpBody,
  VerifyCodeBody,
} from '@/features/auth/types';
import { api } from '@/shared/api';
import { CommonResponse } from '@/types';

export const authService = {
  login: async (body: LoginBody) => {
    return await api.authenticated.post('/auth/login', body, {
      withCredentials: true,
    });
  },
  logout: async () => {
    return api.authenticated.post('/auth/logout', undefined, {
      withCredentials: true,
    });
  },
  getSession: async () => {
    try {
      const response =
        await api.private.get<CommonResponse<MemberDTO>>('/members/info');
      const validatedResponse = adapters.fromApi.parse(response);
      return factory.member.create(validatedResponse.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      // console.error('Session Data Parsing Error:', e);
      return null;
    }
  },
  checkEmailDuplicate: async (body: CheckEmailDuplicateBody) => {
    return api.public.post('/public/email-verifications/check-duplicate', body);
  },
  verifyCode: async (body: VerifyCodeBody) => {
    return api.public.post('/public/email-verifications/verify-code', body);
  },
  signUp: async (body: SignUpBody) => {
    return api.public.post('/auth/sign-up', body);
  },
};
