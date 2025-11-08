import { FrontendMemberSchema } from '@/entities/member/types/front.schema';
import { MemberSchema } from '@/entities/member/types/schema';
import { z } from 'zod';

// 사용자 타입
export type Member = z.infer<typeof MemberSchema>;
export type Role = Member['role'];

// 사용자 타입(프론트 정규화)
// Member + { displayName: string }
export type FrontendMember = z.infer<typeof FrontendMemberSchema>;
