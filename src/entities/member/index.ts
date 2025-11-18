// TODO: 스키마 수정 예정
/* ─────────────────────────────────────────────────────
 * 모듈 임포트
 * ────────────────────────────────────────────────────*/
import { base } from '@/entities/member/schema';

import { domain } from './core/member.domain.schema';
import { dto } from './infrastructure/member.dto.schema';

/* ─────────────────────────────────────────────────────
 * API
 * ────────────────────────────────────────────────────*/
export { repository, memberKeys } from './infrastructure';

// hook, query
export {
  useCoreCurrentMember,
  useCoreCurrentMemberActions,
  getCurrentMemberOptions,
} from './hooks/use-member-query';

export * from './core';
export * from './infrastructure';

// 권한
export * from '@/entities/member/policy/rules';
export type * from '@/entities/member/policy/rules';
export * from '@/entities/member/policy/ability';
export type * from '@/entities/member/policy/ability';

// 매퍼
export * from '@/entities/member/mapper/member.mapper';

/* ─────────────────────────────────────────────────────
 * 스키마
 * ────────────────────────────────────────────────────*/

export const member = {
  dto,
  domain,
  role: base.role,
};

/* ─────────────────────────────────────────────────────
 * 타입
 * ────────────────────────────────────────────────────*/
export type { MemberDTO, Role, FrontendMember } from './types';
