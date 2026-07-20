import { type TreeNodeView } from '@/entities/tree';

/* ─────────────────────────────────────────────────────
 * 정복 능선(ridge) 트리 빌더
 *  - entities/tree는 flat 노드 목록만 내려준다(parentId 기반).
 *  - v4 목업의 "봉우리(대단원) → 중단원 → 하위개념" 계층은
 *    화면 전용 파생 구조라 features 레이어에서 순수 함수로 구성한다.
 *  - entities 계약(TreeNodeView)은 건드리지 않는다.
 * ────────────────────────────────────────────────────*/
export type RidgeNode = TreeNodeView & { children: RidgeNode[] };

export const buildRidge = (nodes: TreeNodeView[]): RidgeNode[] => {
  const idSet = new Set(nodes.map((n) => n.nodeId));
  const byParent = new Map<string, TreeNodeView[]>();

  nodes.forEach((node) => {
    if (node.parentId === null) return;
    const list = byParent.get(node.parentId) ?? [];
    list.push(node);
    byParent.set(node.parentId, list);
  });

  const attach = (node: TreeNodeView): RidgeNode => ({
    ...node,
    children: (byParent.get(node.nodeId) ?? []).map(attach),
  });

  // 루트 = parentId가 없거나, parentId가 이 목록에 없는(잘린 계층) 노드
  const roots = nodes.filter(
    (n) => n.parentId === null || !idSet.has(n.parentId)
  );
  const seen = new Set<string>();

  return roots.filter((r) => {
    if (seen.has(r.nodeId)) return false;
    seen.add(r.nodeId);
    return true;
  }).map(attach);
};

/* ─────────────────────────────────────────────────────
 * 가장 깊은 협곡(=가장 약한 리프 노드) 탐색
 *  - 자식이 있으면 리프까지 내려가 실제 약점을 가리킨다.
 *  - 리프가 없는(자식 없는 대단원) 노드는 자기 자신이 리프.
 * ────────────────────────────────────────────────────*/
export const findValley = (peaks: RidgeNode[]): RidgeNode | null => {
  const flattenLeaves = (node: RidgeNode): RidgeNode[] =>
    node.children.length > 0
      ? node.children.flatMap(flattenLeaves)
      : [node];

  const leaves = peaks.flatMap(flattenLeaves);
  if (leaves.length === 0) return null;

  return leaves.reduce((worst, cur) =>
    cur.masteryScore < worst.masteryScore ? cur : worst
  );
};
