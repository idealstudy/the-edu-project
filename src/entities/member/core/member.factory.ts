import { FrontendMemberSchema } from '../core';
import { MemberAnyResponseSchema, MemberDtoSchema } from '../infrastructure';
import type { MemberDTO } from '../types';

// 최소 필드만 보장되면 나머지는 스키마가 다 처리
type CreateMemberInput = Partial<MemberDTO> &
  Pick<MemberDTO, 'id' | 'email' | 'role'>;

export const MemberFactory = {
  // 서버 응답 - 도메인(envelope 유무 상관없음)
  createFromAPI: (raw: unknown): MemberDTO | null => {
    const parsed = MemberAnyResponseSchema.safeParse(raw);
    if (!parsed.success) {
      // eslint-disable-next-line no-console
      console.warn('API response validation failed:', parsed.error);
      return null;
    }
    return parsed.data;
  },

  // 회원가입 폼 입력 - 서버로 보낼 데이터(클라이언트 검증용)
  createFromSignup: (raw: unknown): MemberDTO => {
    return MemberDtoSchema.parse(raw);
  },

  // 도메인 Member - 프론트 전용 멤버(표시 필드 포함)
  createFrontendMember: (raw: CreateMemberInput) => {
    return FrontendMemberSchema.parse(raw);
  },
};
