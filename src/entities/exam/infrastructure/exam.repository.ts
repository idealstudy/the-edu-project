import type {
  AssignExamPayload,
  CreateExamPayload,
  SubmitExamPayload,
} from '@/entities/exam/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto, payload } from './exam.dto';

type PresignBatchResponse = {
  status: number;
  message: string;
  data: {
    mediaAssetList: Array<{
      mediaId: string;
      uploadUrl: string;
      headers: Record<string, string>;
    }>;
  };
};

const getAssignedExams = async () => {
  const response = await api.private.get('/student/exams');
  return unwrapEnvelope(response, dto.assignedExamList);
};

const getAttempt = async (attemptId: number) => {
  const response = await api.private.get(`/student/exams/${attemptId}`);
  return unwrapEnvelope(response, dto.attemptSheet);
};

const getAnalysis = async (attemptId: number) => {
  const response = await api.private.get(
    `/student/exams/${attemptId}/analysis`
  );
  return unwrapEnvelope(response, dto.analysis);
};

const submitAttempt = async (attemptId: number, input: SubmitExamPayload) => {
  const validated = payload.submit.parse(input);
  const response = await api.private.post(
    `/student/exams/${attemptId}/submit`,
    validated
  );
  return unwrapEnvelope(response, dto.analysis);
};

const getTeacherExams = async () => {
  const response = await api.private.get('/teacher/exams');
  return unwrapEnvelope(response, dto.teacherExamList);
};

const createExam = async (input: CreateExamPayload) => {
  const validated = payload.create.parse(input);
  const response = await api.private.post('/teacher/exams', validated);
  return unwrapEnvelope(response, dto.created);
};

const assignExam = async (examId: number, input: AssignExamPayload) => {
  const validated = payload.assign.parse(input);
  const response = await api.private.post(
    `/teacher/exams/${examId}/assignments`,
    validated
  );
  return unwrapEnvelope(response, dto.assigned);
};

const uploadExamPdf = async (file: File) => {
  const response = await api.private.post<PresignBatchResponse>(
    '/common/media/presign-batch',
    {
      mediaAssetList: [
        {
          targetType: 'EXAM_PDF',
          fileName: file.name,
          contentType: file.type || 'application/pdf',
          sizeBytes: file.size,
        },
      ],
    }
  );
  const mediaAsset = response.data.mediaAssetList[0];
  if (!mediaAsset) throw new Error('시험지 업로드 정보를 받지 못했습니다.');
  const uploadResponse = await fetch(mediaAsset.uploadUrl, {
    method: 'PUT',
    headers: mediaAsset.headers,
    body: file,
  });
  if (!uploadResponse.ok) throw new Error('시험지 PDF 업로드에 실패했습니다.');
  return { mediaId: mediaAsset.mediaId };
};

const getParentSummary = async (childId: number) => {
  const response = await api.private.get(`/parent/children/${childId}/summary`);
  return unwrapEnvelope(response, dto.parentSummary);
};

const acknowledgePin = async (attemptId: number, pinId: number) => {
  const response = await api.private.patch(
    `/student/exams/${attemptId}/pins/${pinId}/ack`
  );
  return unwrapEnvelope(response, dto.teacherPin);
};

const getTeacherPins = async () => {
  const response = await api.private.get('/teacher/exams/pins');
  return unwrapEnvelope(response, dto.teacherPins);
};

const createPin = async (
  attemptId: number,
  input: { treeNodeId?: number | null; comment: string }
) => {
  const validated = payload.createPin.parse(input);
  const response = await api.private.post(
    `/teacher/exams/attempts/${attemptId}/pins`,
    validated
  );
  return unwrapEnvelope(response, dto.teacherPin);
};

export const repository = {
  getAssignedExams,
  getAttempt,
  getAnalysis,
  submitAttempt,
  getTeacherExams,
  createExam,
  assignExam,
  uploadExamPdf,
  getParentSummary,
  acknowledgePin,
  getTeacherPins,
  createPin,
};
