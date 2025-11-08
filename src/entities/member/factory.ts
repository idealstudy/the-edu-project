import { MemberSchema, getDisplayName } from '@/entities';
import type { Member, SafeMember } from '@/entities';

type CreateMemberInput = Partial<Member> &
  Pick<Member, 'id' | 'email' | 'role'>;

export const createMember = (raw: CreateMemberInput): SafeMember => {
  const parsed = MemberSchema.partial().parse(raw);

  const normalized: Member = {
    id: parsed.id!,
    email: parsed.email!,
    role: parsed.role!,
    name: parsed.name ?? '',
    nickname: parsed.nickname ?? '',
    phoneNumber: parsed.phoneNumber ?? '',
    birthDate: parsed.birthDate ?? '',
    acceptRequiredTerm: parsed.acceptRequiredTerm ?? false,
    acceptOptionalTerm: parsed.acceptOptionalTerm ?? false,
    regDate: parsed.regDate ?? '',
    modDate: parsed.modDate ?? '',
  };

  const displayName = getDisplayName(normalized);
  return { ...normalized, displayName };
};
