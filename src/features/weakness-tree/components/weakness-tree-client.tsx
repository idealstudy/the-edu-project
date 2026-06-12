'use client';

import { useState } from 'react';

import Link from 'next/link';

import { type TreeNodeView } from '@/entities/tree';
import { PUBLIC } from '@/shared/constants';
import { Sprout, TriangleAlert } from 'lucide-react';

import { useMyTreeQuery } from '../hooks/use-tree';
import { NodeChallengeDialog } from './node-challenge-dialog';
import { TreeLegend } from './tree-legend';
import { TreeMap } from './tree-map';
import { TreeSkeleton } from './tree-skeleton';
import { TreeSummary } from './tree-summary';

/* ─────────────────────────────────────────────────────
 * 약점 트리 페이지 클라이언트
 *  로딩 / 에러 / 빈(신규=전부 회색) / 정상 4상태.
 *  "약점" 단정 대신 "더 풀어볼까?" 톤.
 * ────────────────────────────────────────────────────*/
export const WeaknessTreeClient = () => {
  const { data, isLoading, isError, refetch } = useMyTreeQuery();
  const [selectedNode, setSelectedNode] = useState<TreeNodeView | null>(null);

  if (isLoading) {
    return <TreeSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-line-line1 flex flex-col items-center gap-3 rounded-[14px] border bg-white py-16 text-center">
        <TriangleAlert
          size={32}
          className="text-system-warning"
          aria-hidden
        />
        <p className="font-body1-heading text-text-main">
          트리를 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="bg-key-color-primary font-label-heading mt-1 flex h-11 items-center rounded-[8px] px-5 text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const hasNodes = (data?.groups.length ?? 0) > 0;

  if (!hasNodes) {
    return (
      <div className="border-line-line1 flex flex-col items-center gap-3 rounded-[14px] border border-dashed bg-white py-16 text-center">
        <Sprout
          size={32}
          className="text-key-color-primary"
          aria-hidden
        />
        <p className="font-body1-heading text-text-main text-balance">
          아직 채워진 지도가 없어요.
        </p>
        <p className="font-body2-normal text-text-sub1 max-w-[320px] text-balance">
          첫 문제를 제대로 풀면 단원이 오렌지로 채워지기 시작해요.
        </p>
        <Link
          href={PUBLIC.OPEN_CHALLENGE.LIST}
          className="bg-key-color-primary font-label-heading mt-2 flex h-12 items-center rounded-[8px] px-6 text-white"
        >
          오늘의 문제 시작
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TreeSummary mastery={data!.mastery} />
      <TreeLegend />
      <TreeMap
        groups={data!.groups}
        onSelectNode={setSelectedNode}
      />

      <NodeChallengeDialog
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};
