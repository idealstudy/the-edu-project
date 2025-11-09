import {
  FrontendMemberSchema,
  Member,
  MemberAnyResponseSchema,
  MemberSchema,
} from '@/entities';

// 최소 필드만 보장되면 나머지는 스키마가 다 처리
type CreateMemberInput = Partial<Member> &
  Pick<Member, 'id' | 'email' | 'role'>;

// 서버 응답 - 도메인(envelope 유무 상관없음)
export const createDomainMemberFromAPI = (raw: unknown): Member | null => {
  return MemberAnyResponseSchema.parse(raw);
};

// 회원가입 폼 입력 - 서버로 보낼 데이터(클라이언트 검증용)
export const createDomainMemberFromSignup = (raw: unknown): Member => {
  return MemberSchema.parse(raw);
};

// 도메인 Member - 프론트 전용 멤버(표시 필드 포함)
export const createFrontendMember = (raw: CreateMemberInput) => {
  return FrontendMemberSchema.parse(raw);
};
