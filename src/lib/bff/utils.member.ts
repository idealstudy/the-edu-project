import {
  MemberEnvelopeSchema,
  MemberSchema,
} from '@/features/member/model/schema';
import { Member } from '@/features/member/model/types';

export const normalizeMember = (payload: unknown): Member => {
  const envelope = MemberEnvelopeSchema.safeParse(payload);
  if (envelope.success) {
    return MemberSchema.parse(envelope.data.data);
  }

  return MemberSchema.parse(payload);
};
