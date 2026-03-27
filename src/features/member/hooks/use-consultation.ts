import { consultationKeys, repository } from '@/entities/consultation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useConsultationList = (
  studyRoomId: number,
  studentId: number,
  enabled = true
) =>
  useQuery({
    queryKey: consultationKeys.list(studyRoomId, studentId),
    queryFn: () => repository.getList(studyRoomId, studentId),
    enabled,
  });

export const useConsultationDetail = (
  studyRoomId: number,
  studentId: number,
  sheetId: number,
  enabled = true
) =>
  useQuery({
    queryKey: [...consultationKeys.list(studyRoomId, studentId), sheetId],
    queryFn: () => repository.getDetail(studyRoomId, studentId, sheetId),
    enabled,
  });

export const useCreateConsultation = (
  studyRoomId: number,
  studentId: number
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { content: string }) =>
      repository.create(studyRoomId, studentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.list(studyRoomId, studentId),
      });
    },
  });
};

export const useUpdateConsultation = (
  studyRoomId: number,
  studentId: number,
  sheetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { content: string }) =>
      repository.update(studyRoomId, studentId, sheetId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.list(studyRoomId, studentId),
      });
    },
  });
};

export const useDeleteConsultation = (
  studyRoomId: number,
  studentId: number,
  sheetId: number
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => repository.delete(studyRoomId, studentId, sheetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consultationKeys.list(studyRoomId, studentId),
      });
    },
  });
};
