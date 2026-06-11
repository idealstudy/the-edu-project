import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import type { DiagnosisItem, DiagnosisResult } from '../types';
import { diagnosisDto } from './onboarding.diagnosis.dto';

/* ─────────────────────────────────────────────────────
 * [Create] 모의고사 한방진단 — 약점 트리 일괄 채움
 *  POST /api/common/onboarding/diagnosis
 *  body { items: [{ treeNodeId, weak }] } → diagnosed_score(옅게+"모의")
 *  성공 후 약점 트리는 GET /common/tree 로 다시 읽는다.
 * ────────────────────────────────────────────────────*/
const postDiagnosis = async (
  items: DiagnosisItem[]
): Promise<DiagnosisResult> => {
  const body = diagnosisDto.request.parse({ items });
  const response = await api.private.post('/common/onboarding/diagnosis', body);
  return unwrapEnvelope(response, diagnosisDto.result);
};

export const diagnosisRepository = {
  postDiagnosis,
};
