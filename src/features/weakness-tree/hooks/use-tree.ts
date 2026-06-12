'use client';

import { repository, treeKeys } from '@/entities/tree';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 내 약점 트리 조회 훅 (repository 래핑)
 * ────────────────────────────────────────────────────*/
export const useMyTreeQuery = () =>
  useQuery({
    queryKey: treeKeys.myTree(),
    queryFn: repository.getMyTree,
  });

/* ─────────────────────────────────────────────────────
 * 단원(노드) 챌린지 목록 조회 훅
 * ────────────────────────────────────────────────────*/
export const useNodeChallengesQuery = (
  nodeId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: treeKeys.nodeChallenges(nodeId),
    queryFn: () => repository.getNodeChallenges(nodeId),
    enabled: (options?.enabled ?? true) && nodeId.length > 0,
  });
