// import { authBffApi } from '@/lib';
import {
  // MemberAnyResponseSchema,
  // MemberEnvelopeSchema,
  MemberSchema,
} from '@/entities';
import { authService } from '@/features/auth/services/api';
import type { z } from 'zod';

// type MemberEnvelope = z.infer<typeof MemberEnvelopeSchema>;
type Member = z.infer<typeof MemberSchema>;

export const fetchMemberInfo = async (): Promise<Member> => {
  /*const response = await authBffApi.get<MemberEnvelope | Member>(
    '/api/v1/member/info'
  );
  const env = MemberAnyResponseSchema.safeParse(response);
  const payload = env.success ? env.data : MemberSchema.parse(response);
  return MemberSchema.parse(payload);*/
  const response = await authService.getSession();
  return response.data;
};
