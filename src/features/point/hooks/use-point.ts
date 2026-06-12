'use client';

import { pointKeys, repository } from '@/entities/point';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 내 포인트 지갑 조회 훅 (repository 래핑)
 * ────────────────────────────────────────────────────*/
export const useMyPointWalletQuery = () =>
  useQuery({
    queryKey: pointKeys.wallet(),
    queryFn: repository.getMyWallet,
  });
