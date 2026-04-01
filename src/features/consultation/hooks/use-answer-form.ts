import {
  ConsultationAnswerPayload,
  consultationKeys,
  repository,
} from '@/entities/consultation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * [POST] 문의 답변 등록
 */
export function useCreateConsultationAnswer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ConsultationAnswerPayload) =>
      repository.createConsultationAnswer(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
    },
  });
}

/**
 * [PUT] 문의 답변 수정
 */
export function useUpdateConsultationAnswer(
  id: number,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ConsultationAnswerPayload) =>
      repository.updateConsultationAnswer(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
      onSuccess?.();
    },
  });
}
