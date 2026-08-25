'use client';

import { pointKeys, repository } from '@/entities/point';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 내 포인트 지갑 조회 훅 (repository 래핑)
 * ────────────────────────────────────────────────────*/
export const useMyPointWalletQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: pointKeys.wallet(),
    queryFn: repository.getMyWallet,
    enabled: options?.enabled ?? true,
  });

/* 다음 해설 보기 비용/무료 여부 (버튼·다이얼로그 카피용) */
export const useSolutionViewCostQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: pointKeys.solutionViewCost(),
    queryFn: repository.getSolutionViewCost,
    enabled: options?.enabled ?? true,
  });
