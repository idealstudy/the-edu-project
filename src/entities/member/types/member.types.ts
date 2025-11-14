import { z } from 'zod';

import { domain } from '../core';
import { dto } from '../infrastructure';

// 사용자 타입
export type MemberDTO = z.infer<typeof dto.member.schema>;
export type Role = z.infer<typeof dto.member.role>;

// 사용자 타입(프론트 정규화)
// Member + { displayName: string }
export type FrontendMember = z.infer<typeof domain.member>;
