import {
  FrontendMemberSchema,
  Member,
  MemberAnyResponseSchema,
  MemberEnvelope,
} from '@/entities';
import {
  CheckEmailDuplicateBody,
  LoginBody,
  SignUpBody,
  VerifyCodeBody,
} from '@/features/auth/types';
import { authApi, authBffApi, publicApi } from '@/lib/http';

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
      const response = await authBffApi.get<Member | MemberEnvelope>(
        '/api/v1/member/info'
      );
      const domain = MemberAnyResponseSchema.parse(response);
      return FrontendMemberSchema.parse(domain);
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
