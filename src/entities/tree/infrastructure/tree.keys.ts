/* ─────────────────────────────────────────────────────
 * 약점 트리 Query Keys
 * ────────────────────────────────────────────────────*/
export const treeKeys = {
  all: ['tree'] as const,
  myTree: () => [...treeKeys.all, 'my-tree'] as const,
  // 관리자 전용 트리 조회는 별도 endpoint(/api/admin/tree)를 쓰므로 캐시도 분리한다.
  adminTree: () => [...treeKeys.all, 'admin-tree'] as const,
  nodeChallenges: (nodeId: string) =>
    [...treeKeys.all, 'node-challenges', nodeId] as const,
};
