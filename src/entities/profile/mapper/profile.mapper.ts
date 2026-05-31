import { domain } from '@/entities/profile/core';
import { ProfileDTO } from '@/entities/profile/types';

/* ─────────────────────────────────────────────────────
 * DTO -> Domain 변환
 * domain.schema가 자동으로 변환 수행:
 * - desc -> description(선생님) 또는 learningGoal(학생)
 * - '테스트' -> 기본 안내 문구로 변환
 * ────────────────────────────────────────────────────*/
export const profileMapper = {
  toDomain: (dto: ProfileDTO) => domain.schema.parse(dto),
};
