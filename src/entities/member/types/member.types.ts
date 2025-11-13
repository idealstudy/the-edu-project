import { z } from 'zod';

import { domain } from '../core';
import { MemberDtoSchema, MemberRoleSchema } from '../infrastructure';

// 사용자 타입
export type MemberDTO = z.infer<typeof MemberDtoSchema>;
export type Role = z.infer<typeof MemberRoleSchema>;

// 사용자 타입(프론트 정규화)
// Member + { displayName: string }
export type FrontendMember = z.infer<typeof domain.member>;
