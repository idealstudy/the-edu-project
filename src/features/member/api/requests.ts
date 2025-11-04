import { authApi } from '@/lib/http/api';
import type { z } from 'zod';

import {
  MemberAnyResponseSchema,
  MemberEnvelopeSchema,
  MemberSchema,
} from '../model/schema';

type MemberEnvelope = z.infer<typeof MemberEnvelopeSchema>;
type Member = z.infer<typeof MemberSchema>;

export const fetchMemberInfo = async (): Promise<Member> => {
  const response = await authApi.get<MemberEnvelope | Member>('/members/info');
  const env = MemberAnyResponseSchema.safeParse(response);
  const payload = env.success ? env.data : MemberSchema.parse(response);
  return MemberSchema.parse(payload);
};
