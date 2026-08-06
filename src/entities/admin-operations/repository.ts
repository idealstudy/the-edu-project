import { api } from '@/shared/api';
import { z } from 'zod';

import {
  type AdminConsultationCase,
  type AdminConsultationList,
  type AdminPublicHall,
  type AdminStudyRoomList,
  type AdminSummary,
  adminOperationsSchema,
} from './schema';

const getPublicHall = async (): Promise<AdminPublicHall> => {
  const response = await api.private.get('/admin/public-exams');
  return adminOperationsSchema.publicHallResponse.parse(response).data;
};

const unpostPublicExam = async (postingId: number): Promise<void> => {
  const id = z.number().int().positive().parse(postingId);
  await api.private.delete(`/admin/public-exams/${id}`);
};

const postPublicExam = async (input: {
  examId: number;
  audience: 'ALL' | 'NO_STUDY_ROOM';
  openAt: string;
  closeAt: string | null;
}): Promise<void> => {
  const payload = adminOperationsSchema.publicPost.parse(input);
  const response = await api.private.post('/admin/public-exams', payload);
  adminOperationsSchema.publicPostingResponse.parse(response);
};

const getStudyRooms = async (params: {
  state?: 'ACTIVE' | 'RECRUITING' | 'ENDED';
  keyword?: string;
  page: number;
  size: number;
}): Promise<AdminStudyRoomList> => {
  const response = await api.private.get('/admin/study-rooms', { params });
  return adminOperationsSchema.studyRoomsResponse.parse(response).data;
};

const getConsultations = async (params: {
  status?: 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED';
  keyword?: string;
  page: number;
  size: number;
}): Promise<AdminConsultationList> => {
  const response = await api.private.get('/admin/consultation-cases', {
    params,
  });
  return adminOperationsSchema.consultationCasesResponse.parse(response).data;
};

const updateConsultation = async (
  caseId: number,
  input: { status: 'IN_PROGRESS' | 'ANSWERED'; answer?: string }
): Promise<AdminConsultationCase> => {
  const id = z.number().int().positive().parse(caseId);
  const payload = adminOperationsSchema.consultationUpdate.parse(input);
  const response = await api.private.patch(
    `/admin/consultation-cases/${id}`,
    payload
  );
  return adminOperationsSchema.consultationCaseResponse.parse(response).data;
};

const getSummary = async (): Promise<AdminSummary> => {
  const response = await api.private.get('/admin/summary');
  return adminOperationsSchema.summaryResponse.parse(response).data;
};

export const adminOperationsRepository = {
  getPublicHall,
  postPublicExam,
  unpostPublicExam,
  getStudyRooms,
  getConsultations,
  updateConsultation,
  getSummary,
};
