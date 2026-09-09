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
 * 관리자 전용 약점 트리 조회 훅 (repository 래핑)
 *  v2.0 역할경계 분리(옵션 A): 관리자 화면은 공용 /common/tree 가 아니라
 *  admin 전용 GET /api/admin/tree 를 쓴다. 응답 구조는 공용과 동일.
 * ────────────────────────────────────────────────────*/
export const useAdminTreeQuery = () =>
  useQuery({
    queryKey: treeKeys.adminTree(),
    queryFn: repository.getAdminTree,
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
