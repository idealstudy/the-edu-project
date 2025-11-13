import { dto } from '@/entities/member';
import { sharedSchema } from '@/types';

/* ─────────────────────────────────────────────────────
 * API 응답 데이터를 도메인 객체로 변환 및 검증
 * ────────────────────────────────────────────────────*/
const toDomainFromAPI = sharedSchema.response(dto.schema);

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const adapters = {
  fromApi: toDomainFromAPI,
};
