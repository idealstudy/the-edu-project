/* ─────────────────────────────────────────────────────
 * 약점 트리 Query Keys
 * ────────────────────────────────────────────────────*/
export const treeKeys = {
  all: ['tree'] as const,
  myTree: () => [...treeKeys.all, 'my-tree'] as const,
  nodeChallenges: (nodeId: string) =>
    [...treeKeys.all, 'node-challenges', nodeId] as const,
};
