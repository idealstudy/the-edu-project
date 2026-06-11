'use client';

import { useState } from 'react';

import type { TreeNodeView, TreeView } from '@/entities/tree';
import { TreeLegend } from '@/features/weakness-tree/components/tree-legend';
import { TreeMap } from '@/features/weakness-tree/components/tree-map';
import { NodeChallengeDialog } from '@/features/weakness-tree/components/node-challenge-dialog';

import { QuestionHeader } from '../question-header';

/* ─────────────────────────────────────────────────────
 * 약점 트리 공개 — 입력·체험·진단을 합쳐 만든 트리.
 *  TreeMap / TreeLegend / NodeChallengeDialog 재사용.
 *  자기신고=옅게("모의" 태그), 직접 풀이=진하게, 막힘 ⚠.
 * ────────────────────────────────────────────────────*/
type RevealStepProps = {
  tree: TreeView;
};

export const RevealStep = ({ tree }: RevealStepProps) => {
  const [selectedNode, setSelectedNode] = useState<TreeNodeView | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <QuestionHeader
        className="text-center"
        title={
          <>
            제대로 풀면
            <br />
            여기가 <em>오렌지로</em> 채워져요
          </>
        }
        sub="진할수록 정복. 옅으면 더 풀 곳. 회색은 아직 미진단."
      />

      <TreeLegend />
      <TreeMap
        groups={tree.groups}
        onSelectNode={setSelectedNode}
      />

      <NodeChallengeDialog
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};
