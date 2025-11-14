import { sharedSchema } from '@/types';

import { dto } from './member.dto.schema';

/* ─────────────────────────────────────────────────────
 * API 응답 데이터를 도메인 객체로 변환 및 검증
 * ────────────────────────────────────────────────────*/
const toDomainFromAPI = sharedSchema.response(dto.member.schema);

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const adapters = {
  fromApi: toDomainFromAPI,
};
