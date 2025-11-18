/* ─────────────────────────────────────────────────────
 * 스터디룸 도메인 & DTO 스키마(외부에서 사용할거)
 * ────────────────────────────────────────────────────*/
import { domain } from './core/room.domain.schema';
import { factory } from './core/room.factory';
import { adapters } from './infrastructure/room.adapters';
import { base } from './infrastructure/room.base.schema';
import { dto } from './infrastructure/room.dto.schema';

export const room = { domain, dto, base, adapters, factory };

export * from './infrastructure';
export * from './types';
