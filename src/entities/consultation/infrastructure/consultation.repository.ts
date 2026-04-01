import {
  ConsultationAnswerPayload,
  ConsultationPayload,
} from '@/entities/consultation/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto, payload } from './consultation.dto';

/* ─────────────────────────────────────────────────────
 * [CREATE] 수업 문의 등록
 * ────────────────────────────────────────────────────*/
const createConsultation = async (params: ConsultationPayload) => {
  const validated = payload.create.parse(params);
  const response = await api.private.post('/common/inquiries', validated);
  return unwrapEnvelope(response, dto.detail);
};

/* ─────────────────────────────────────────────────────
 * [READ] 문의 내용 상세 조회 (작성자 / 선생님)
 * ────────────────────────────────────────────────────*/
const getConsultation = async (id: number) => {
  const response = await api.private.get(`/common/inquiries/${id}`);
  return unwrapEnvelope(response, dto.detail);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 문의 답변 작성 (선생님)
 * ────────────────────────────────────────────────────*/
const createConsultationAnswer = async (
  id: number,
  params: ConsultationAnswerPayload
) => {
  const validated = payload.createAnswer.parse(params);
  const response = await api.private.post(
    `/teacher/inquiries/${id}/answer`,
    validated
  );
  return unwrapEnvelope(response, dto.detail);
};

/* ─────────────────────────────────────────────────────
 * [UPDATE] 문의 답변 수정 (선생님)
 * ────────────────────────────────────────────────────*/
const updateConsultationAnswer = async (
  id: number,
  params: ConsultationAnswerPayload
) => {
  const validated = payload.updateAnswer.parse(params);
  const response = await api.private.put(
    `/teacher/inquiries/${id}/answer`,
    validated
  );
  return unwrapEnvelope(response, dto.detail);
};

/* ─────────────────────────────────────────────────────
 * [DELETE] 문의 답변 삭제 (선생님)
 * ────────────────────────────────────────────────────*/
const deleteConsultationAnswer = async (id: number) => {
  await api.private.delete(`/teacher/inquiries/${id}/answer`);
};

/* ─────────────────────────────────────────────────────
 * [READ] 마이페이지 내가 작성한 문의 목록 조회
 * ────────────────────────────────────────────────────*/
const getMyConsultations = async (params: { page: number; size: number }) => {
  const response = await api.private.get('/common/inquiries', { params });
  return unwrapEnvelope(response, dto.list);
};

/* ─────────────────────────────────────────────────────
 * [READ] 받은 문의 목록 조회 (선생님)
 * ────────────────────────────────────────────────────*/
const getReceivedConsultations = async (params: {
  page: number;
  size: number;
  status?: 'PENDING' | 'ANSWERED';
}) => {
  const response = await api.private.get('/teacher/inquiries', { params });
  return unwrapEnvelope(response, dto.list);
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  createConsultation,
  getConsultation,
  createConsultationAnswer,
  updateConsultationAnswer,
  deleteConsultationAnswer,
  getMyConsultations,
  getReceivedConsultations,
};
