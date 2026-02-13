import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './teacher.dto';

/* ─────────────────────────────────────────────────────
 * 선생님 통계 조회
 * ────────────────────────────────────────────────────*/
const getTeacherReport = async () => {
  const response = await api.private.get(`/teacher/me/report`);
  return unwrapEnvelope(response, dto.teacherReport);
};

/* ─────────────────────────────────────────────────────
 * 선생님 수업 노트 전체 목록 조회
 * ────────────────────────────────────────────────────*/
const getTeacherNoteList = async () => {
  const response = await api.private.get(`/teacher/me/teaching-notes`);
  return unwrapEnvelope(response, dto.teacherNoteList);
};

/* ─────────────────────────────────────────────────────
 * 선생님 스터디룸 전체 목록 조회
 * ────────────────────────────────────────────────────*/
const getTeacherStudyRoomList = async () => {
  const response = await api.private.get(`/teacher/me/study-rooms`);
  return unwrapEnvelope(response, dto.teacherStudyRoomList);
};

export const teacherRepository = {
  getTeacherNoteList,
  getTeacherStudyRoomList,
  getTeacherReport,
};
