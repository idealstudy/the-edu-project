import { ConsultationLeadPayload, repository } from '@/entities/consultation-lead';
import { useMutation } from '@tanstack/react-query';

/**
 * [POST] 비회원 상담 리드 접수 (/consult) — api-contract §4.2
 */
export function useCreateConsultationLead() {
  return useMutation({
    mutationFn: (payload: ConsultationLeadPayload) =>
      repository.createLead(payload),
  });
}
