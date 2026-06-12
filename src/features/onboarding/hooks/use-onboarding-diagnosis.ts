'use client';

import {
  type DiagnosisItem,
  diagnosisRepository,
  onboardingKeys,
} from '@/entities/onboarding';
import { treeKeys } from '@/entities/tree';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 모의고사 한방진단 mutation
 *  POST /api/common/onboarding/diagnosis → 약점 트리 일괄 채움.
 *  성공 시 트리 캐시 무효화 → 공개 화면이 최신 트리를 다시 읽는다.
 * ────────────────────────────────────────────────────*/
export const useOnboardingDiagnosisMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: onboardingKeys.diagnosis(),
    mutationFn: (items: DiagnosisItem[]) =>
      diagnosisRepository.postDiagnosis(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treeKeys.myTree() });
    },
  });
};
