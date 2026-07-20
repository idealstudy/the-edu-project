'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { type TreeNodeView } from '@/entities/tree';
import { PUBLIC } from '@/shared/constants';
import { Sprout, TriangleAlert } from 'lucide-react';

import { useMyTreeQuery } from '../hooks/use-tree';
import { buildRidge, findValley, type RidgeNode } from '../lib/ridge';
import { NodeChallengeDialog } from './node-challenge-dialog';
import { RidgeDrilldown } from './ridge-drilldown';
import { RidgeMap } from './ridge-map';
import { ALL_TAB, SubjectTabs, type SubjectTabValue } from './subject-tabs';
import { TreeActionBand } from './tree-action-band';
import { TreeHero } from './tree-hero';
import { TreeLegend } from './tree-legend';
import { TreeSkeleton } from './tree-skeleton';
import { TreeSummary } from './tree-summary';

/* ─────────────────────────────────────────────────────
 * 약점 트리 페이지 클라이언트 — "정복 능선"(v4) 재구현
 *  prototypes/mvp-e-약점트리-재설계-v4.html 이 정본.
 *  로딩 / 에러 / 빈(신규=전부 회색) / 정상 4상태.
 * ────────────────────────────────────────────────────*/
export const WeaknessTreeClient = () => {
  const { data, isLoading, isError, refetch } = useMyTreeQuery();
  const [selectedNode, setSelectedNode] = useState<TreeNodeView | null>(null);
  const [selectedPeakId, setSelectedPeakId] = useState<string | null>(null);
  const [tab, setTab] = useState<SubjectTabValue>(ALL_TAB);

  const allNodes = useMemo(
    () => (data ? data.groups.flatMap((g) => g.nodes) : []),
    [data]
  );

  const peaks = useMemo(() => {
    if (tab === ALL_TAB) return buildRidge(allNodes);
    const group = data?.groups.find((g) => g.subject === tab);
    return buildRidge(group?.nodes ?? []);
  }, [tab, allNodes, data]);

  const valley = useMemo(() => findValley(peaks), [peaks]);

  const selectedPeak: RidgeNode | null = useMemo(
    () => peaks.find((p) => p.nodeId === selectedPeakId) ?? null,
    [peaks, selectedPeakId]
  );

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
          첫 문제를 제대로 풀면 능선이 솟아오르기 시작해요.
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
      <TreeHero
        mastery={data!.mastery}
        valley={valley}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-body1-heading text-text-main">정복 능선</h2>
          <span className="font-caption-normal text-text-sub2">
            봉우리를 누르면 세부 트리가 열려요
          </span>
        </div>

        <SubjectTabs
          groups={data!.groups}
          value={tab}
          onChange={(next) => {
            setTab(next);
            setSelectedPeakId(null);
          }}
        />

        <div className="border-line-line1 rounded-[16px] border bg-white px-4 pt-5 pb-4 md:px-5">
          <p className="font-caption-normal text-text-sub2 mb-1 px-1">
            봉우리 높이 = 해설 안 보고 맞힌 비율(자력, 실측) · 90%+는 정복
            그라데이션
          </p>
          <RidgeMap
            peaks={peaks}
            selectedPeakId={selectedPeakId}
            onSelectPeak={(peak) =>
              setSelectedPeakId((cur) =>
                cur === peak.nodeId ? null : peak.nodeId
              )
            }
          />
          <div className="mt-3">
            <TreeLegend />
          </div>
        </div>

        <RidgeDrilldown
          peak={selectedPeak}
          onClose={() => setSelectedPeakId(null)}
          onOpenNode={setSelectedNode}
        />
      </section>

      <TreeActionBand
        valley={valley}
        onAction={(node) => setSelectedNode(node)}
      />

      <TreeSummary mastery={data!.mastery} />

      <NodeChallengeDialog
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};
