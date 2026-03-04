import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import {
  DashboardHomeworkSortKey,
  DashboardMemberSortKey,
  DashboardQnASortKey,
  DashboardTeachingNotesSortKey,
} from '../types';
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

/* ─────────────────────────────────────────────────────
 * 선생님 대시보드 활동 통계 조회 DTO
 * ────────────────────────────────────────────────────*/
const getTeacherDashboardReport = async () => {
  const response = await api.private.get(`/teacher/dashboard/report`);
  return unwrapEnvelope(response, dto.dashboard.report);
};

/* ─────────────────────────────────────────────────────
 * 선생님 대시보드 수업 노트 전체 목록 조회 DTO
 * ────────────────────────────────────────────────────*/
const getTeacherDashboardNoteList = async ({
  studyRoomId,
  page,
  size,
  sortKey,
}: {
  studyRoomId?: number;
  page: number;
  size: number;
  sortKey: DashboardTeachingNotesSortKey;
}) => {
  const params = studyRoomId
    ? { studyRoomId, page, size, sortKey }
    : { page, size, sortKey };
  const response = await api.private.get(`/teacher/dashboard/teaching-notes`, {
    params,
  });
  return unwrapEnvelope(response, dto.dashboard.noteList);
};

/* ─────────────────────────────────────────────────────
 * 선생님 대시보드 스터디룸 목록 조회
 * ────────────────────────────────────────────────────*/
const getTeacherDashboardStudyRoomList = async () => {
  const response = await api.private.get(`/teacher/dashboard/study-rooms`);
  return unwrapEnvelope(response, dto.dashboard.studyRoomList);
};

/* ─────────────────────────────────────────────────────
 * 선생님 대시보드 답변 하지 않은 질문 목록 조회
 * ────────────────────────────────────────────────────*/
const getTeacherDashboardQnaList = async ({
  page,
  size,
  sortKey,
}: {
  page: number;
  size: number;
  sortKey: DashboardQnASortKey;
}) => {
  const params = { page, size, sortKey };
  const response = await api.private.get(`/teacher/dashboard/qna`, {
    params,
  });
  return unwrapEnvelope(response, dto.dashboard.QnaList);
};

/* ─────────────────────────────────────────────────────
 * 선생님 대시보드 멤버 목록 조회
 * ────────────────────────────────────────────────────*/
const getTeacherDashboardMemberList = async ({
  studyRoomId,
  page,
  size,
  sortKey,
}: {
  studyRoomId: number;
  page: number;
  size: number;
  sortKey: DashboardMemberSortKey;
}) => {
  const params = { studyRoomId, page, size, sortKey };
  const response = await api.private.get(`/teacher/dashboard/members`, {
    params,
  });
  return unwrapEnvelope(response, dto.dashboard.memberList);
};

/* ─────────────────────────────────────────────────────
 * 선생님 대시보드 과제 목록 조회
 * ────────────────────────────────────────────────────*/
const getTeacherDashboardHomeworkList = async ({
  studyRoomId,
  page,
  size,
  sortKey,
}: {
  studyRoomId?: number;
  page: number;
  size: number;
  sortKey: DashboardHomeworkSortKey;
}) => {
  const params = studyRoomId
    ? { studyRoomId, page, size, sortKey }
    : { page, size, sortKey };
  const response = await api.private.get(`/teacher/dashboard/homeworks`, {
    params,
  });
  return unwrapEnvelope(response, dto.dashboard.homeworkList);
};

export const teacherRepository = {
  getTeacherNoteList,
  getTeacherStudyRoomList,
  getTeacherReport,
  dashboard: {
    getReport: getTeacherDashboardReport,
    getNoteList: getTeacherDashboardNoteList,
    getStudyRoomList: getTeacherDashboardStudyRoomList,
    getQnaList: getTeacherDashboardQnaList,
    getMemberList: getTeacherDashboardMemberList,
    getHomeworkList: getTeacherDashboardHomeworkList,
  },
};
