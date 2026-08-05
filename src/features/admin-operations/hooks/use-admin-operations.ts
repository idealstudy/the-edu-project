import {
  adminOperationsKeys,
  adminOperationsRepository,
} from '@/entities/admin-operations';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyAdminMemberError } from '@/shared/lib/errors/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminPublicHall = () =>
  useQuery({
    queryKey: adminOperationsKeys.publicHall(),
    queryFn: adminOperationsRepository.getPublicHall,
  });

export const useUnpostPublicExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminOperationsRepository.unpostPublicExam,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminOperationsKeys.publicHall(),
      }),
    onError: (error) => handleApiError(error, classifyAdminMemberError, {}),
  });
};

export const usePostPublicExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminOperationsRepository.postPublicExam,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminOperationsKeys.publicHall(),
      }),
    onError: (error) => handleApiError(error, classifyAdminMemberError, {}),
  });
};

export type StudyRoomListParams = {
  state?: 'ACTIVE' | 'RECRUITING' | 'ENDED';
  keyword?: string;
  page: number;
  size: number;
};

export const useAdminStudyRooms = (params: StudyRoomListParams) =>
  useQuery({
    queryKey: adminOperationsKeys.studyRooms(params),
    queryFn: () => adminOperationsRepository.getStudyRooms(params),
  });

export type ConsultationListParams = {
  status?: 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED';
  keyword?: string;
  page: number;
  size: number;
};

export const useAdminConsultations = (params: ConsultationListParams) =>
  useQuery({
    queryKey: adminOperationsKeys.consultations(params),
    queryFn: () => adminOperationsRepository.getConsultations(params),
  });

export const useUpdateAdminConsultation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      caseId,
      ...input
    }: {
      caseId: number;
      status: 'IN_PROGRESS' | 'ANSWERED';
      answer?: string;
    }) => adminOperationsRepository.updateConsultation(caseId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminOperationsKeys.all,
      }),
    onError: (error) => handleApiError(error, classifyAdminMemberError, {}),
  });
};

export const useAdminSummary = () =>
  useQuery({
    queryKey: adminOperationsKeys.summary(),
    queryFn: adminOperationsRepository.getSummary,
  });
