import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './consultation-lead.dto';

/* ─────────────────────────────────────────────────────
 * [CREATE] 비회원 상담 리드 접수 (인증 없는 쓰기 — api-contract §4.2 R3)
 * ────────────────────────────────────────────────────*/
const createLead = async (
  payload: import('zod').infer<typeof dto.leadPayload>
) => {
  const validated = dto.leadPayload.parse(payload);
  const response = await api.public.post(
    '/public/consultation-leads',
    validated
  );
  return unwrapEnvelope(response, dto.leadResponse);
};

/* ─────────────────────────────────────────────────────
 * [READ] 공개 사례 목록 — PUBLISHED만. 0건이면 PREPARING(P) 렌더 —
 * 예시 데이터로 절대 폴백하지 않는다 (frd §3.4 — S 금지 화이트리스트 제외).
 * ────────────────────────────────────────────────────*/
const getCaseList = async (params: { page: number; size: number }) => {
  const response = await api.public.get('/public/consultation-cases', {
    params,
  });
  return unwrapEnvelope(response, dto.caseList);
};

const getCaseDetail = async (id: number) => {
  const response = await api.public.get(`/public/consultation-cases/${id}`);
  return unwrapEnvelope(response, dto.caseDetail);
};

export const repository = {
  createLead,
  getCaseList,
  getCaseDetail,
};
