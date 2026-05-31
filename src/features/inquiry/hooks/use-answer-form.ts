import {
  InquiryAnswerPayload,
  inquiryKeys,
  repository,
} from '@/entities/inquiry';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * [POST] 문의 답변 등록
 */
export function useCreateInquiryAnswer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: InquiryAnswerPayload) =>
      repository.createInquiryAnswer(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(id) });
    },
  });
}

/**
 * [PUT] 문의 답변 수정
 */
export function useUpdateInquiryAnswer(id: number, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: InquiryAnswerPayload) =>
      repository.updateInquiryAnswer(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(id) });
      onSuccess?.();
    },
  });
}

/**
 * [DELETE] 문의 답변 삭제
 */
export function useDeleteInquiryAnswer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.deleteInquiryAnswer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(id) });
    },
  });
}
