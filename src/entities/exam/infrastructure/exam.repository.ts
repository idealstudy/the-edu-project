import type {
  AssignExamPayload,
  CreateExamPayload,
  GradeCutoffPayload,
  QuestionBankParams,
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
  // 시험 열기 화면은 실패 시 인라인 보존 카드로 안내한다(exam-create.tsx).
  // 전역 토스트까지 함께 뜨면 같은 오류가 두 번 겹쳐 보인다.
  const response = await api.private.post('/teacher/exams', validated, {
    suppressGlobalErrorToast: true,
  });
  return unwrapEnvelope(response, dto.created);
};

const assignExam = async (examId: number, input: AssignExamPayload) => {
  const validated = payload.assign.parse(input);
  const response = await api.private.post(
    `/teacher/exams/${examId}/assignments`,
    validated,
    { suppressGlobalErrorToast: true }
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

const getQuestionBank = async (input: QuestionBankParams) => {
  const params = payload.questionBankParams.parse(input);
  const response = await api.private.get('/teacher/question-bank', {
    params: {
      ...params,
      treeNodeIds: params.treeNodeIds.length ? params.treeNodeIds : undefined,
      excludeChallengeIds: params.excludeChallengeIds.length
        ? params.excludeChallengeIds
        : undefined,
    },
  });
  return unwrapEnvelope(response, dto.questionBank);
};

const getAdminQuestionBank = async (input: QuestionBankParams) => {
  const params = payload.questionBankParams.parse(input);
  const response = await api.private.get('/admin/question-bank', {
    params: {
      ...params,
      treeNodeIds: params.treeNodeIds.length ? params.treeNodeIds : undefined,
      excludeChallengeIds: params.excludeChallengeIds.length
        ? params.excludeChallengeIds
        : undefined,
    },
  });
  return unwrapEnvelope(response, dto.questionBank);
};

const getAdminExams = async () => {
  const response = await api.private.get('/admin/exams');
  return unwrapEnvelope(response, dto.teacherExamList);
};

const getExamHall = async () => {
  const response = await api.private.get('/student/exam-hall');
  return unwrapEnvelope(response, dto.examHall);
};

/**
 * 공개 시험 응시 시작.
 * 공개 시험은 attemptId 가 미리 없으므로 서버가 배정과 응시를 만들어 돌려준다.
 */
const startPublicExamAttempt = async (examId: number) => {
  const response = await api.private.post(
    `/student/exam-hall/${examId}/attempts`
  );
  return unwrapEnvelope(response, dto.publicExamAttempt);
};

const upsertGradeCutoff = async (examId: number, input: GradeCutoffPayload) => {
  const validated = payload.gradeCutoff.parse(input);
  const response = await api.private.put(
    `/admin/exams/${examId}/grade-cutoff`,
    validated
  );
  return unwrapEnvelope(response, dto.gradeCutoff);
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
  getQuestionBank,
  getAdminQuestionBank,
  getAdminExams,
  getExamHall,
  startPublicExamAttempt,
  upsertGradeCutoff,
};
