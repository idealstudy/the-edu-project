'use client';

import { type TreeNodeView, type TreeSubjectGroup } from '@/entities/tree';

import { TreeNodeButton } from './tree-node-button';

const SUBJECT_LABEL: Partial<Record<TreeSubjectGroup['subject'], string>> = {
  MIDDLE_MATH: '중학',
  COMMON_MATH_1: '공통수학1',
  COMMON_MATH_2: '공통수학2',
  ALGEBRA: '대수',
  CALCULUS_1: '미적분Ⅰ',
  CALCULUS_2: '미적분Ⅱ',
  MATH_1: '대수',
  MATH_2: '미적분Ⅰ',
  CALCULUS: '미적분Ⅱ',
  PROBABILITY_STATISTICS: '확률과 통계',
  GEOMETRY: '기하',
  OTHER: '기타',
};

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
          {SUBJECT_LABEL[group.subject] ?? group.subject}
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
