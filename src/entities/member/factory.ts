import type { Member } from '@/entities';
import { FrontendMemberSchema } from '@/entities/member/types/front.schema';

// 최소 필드만 보장되면 나머지는 스키마가 다 처리
type CreateMemberInput = Partial<Member> &
  Pick<Member, 'id' | 'email' | 'role'>;

export const createMember = (raw: CreateMemberInput) => {
  return FrontendMemberSchema.parse(raw);
};