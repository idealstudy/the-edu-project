'use client';

import { type TreeNodeView, type TreeSubjectGroup } from '@/entities/tree';
import { subjectLabel } from '@/shared/constants';

import { TreeNodeButton } from './tree-node-button';

type TreeMapProps = {
  groups: TreeSubjectGroup[];
  onSelectNode: (node: TreeNodeView) => void;
};

/* ─────────────────────────────────────────────────────
 * 약점 트리 맵 — 과목별 대단원 노드 그리드
 *  태블릿 퍼스트: 베이스 2열, 데스크톱 ≥1200 4열, 모바일 1열.
 * ────────────────────────────────────────────────────*/
export const TreeMap = ({ groups, onSelectNode }: TreeMapProps) => (
  <div className="flex flex-col gap-8">
    {groups.map((group) => (
      <section
        key={group.subject}
        className="flex flex-col gap-3"
      >
        <h2 className="font-body1-heading text-text-main flex items-baseline gap-2">
          {subjectLabel(group.subject)}
          <span className="font-caption-normal text-text-sub2 tabular-nums">
            {group.nodes.length}단원
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4">
          {group.nodes.map((node) => (
            <TreeNodeButton
              key={node.nodeId}
              node={node}
              onSelect={onSelectNode}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);
