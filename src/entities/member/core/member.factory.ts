import { domain } from '../core';
import type { MemberDTO } from '../types';

/* ─────────────────────────────────────────────────────
 * 최소 필드만 보장되면 나머지는 스키마가 다 처리
 * ────────────────────────────────────────────────────*/
type CreateMemberInput = Partial<MemberDTO> &
  Pick<MemberDTO, 'id' | 'email' | 'role'>;

/* ─────────────────────────────────────────────────────
 * 도메인 Member - 프론트 전용 멤버(표시 필드 포함)
 * ────────────────────────────────────────────────────*/
const createFrontendMember = (raw: CreateMemberInput) => {
  return domain.member.parse(raw);
};

export const factory = {
  member: {
    create: createFrontendMember,
  },
};
