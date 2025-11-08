import { FrontendMemberSchema } from '@/entities/member/types/front.schema';
import { MemberSchema } from '@/entities/member/types/schema';
import { z } from 'zod';

// 사용자 타입
export type Member = z.infer<typeof MemberSchema>;
export type Role = Member['role'];

// 사용자 타입(프론트 정규화)
// Member + { displayName: string }
export type FrontendMember = z.infer<typeof FrontendMemberSchema>;

// TODO: 삭제 예정
export type SessionLike = {
  auth: Member['role'];
  memberId: Member['id'];
  email: Member['email'];
  name?: Member['name'];
  nickname?: Member['nickname'];
};

export const toSessionLike = (member: Member): SessionLike => ({
  auth: member.role,
  memberId: member.id,
  email: member.email,
  name: member.name,
  nickname: member.nickname ?? member.name,
});