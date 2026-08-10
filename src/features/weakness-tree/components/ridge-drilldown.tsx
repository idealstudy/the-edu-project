'use client';

import { type TreeNodeView } from '@/entities/tree';
import { Accordion, Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { AlertTriangle, X } from 'lucide-react';

import { type RidgeNode } from '../lib/ridge';

const FLAT_FILL: Record<TreeNodeView['intensity'], string> = {
  untested: 'bg-tree-untested',
  weak: 'bg-tree-weak',
  progress: 'bg-tree-progress',
  mastered: 'bg-tree-mastered',
};

/* ─────────────────────────────────────────────────────
 * 하위개념 리프 행 — v4 .leaf 이식
 *  - API가 주는 실측값(masteryScore/attemptCount/correctCount)만 표기.
 *  - 액션 버튼은 문제 목록 다이얼로그(NodeChallengeDialog)를 연다.
 * ────────────────────────────────────────────────────*/
const LeafRow = ({
  node,
  onOpen,
}: {
  node: TreeNodeView;
  onOpen: (node: TreeNodeView) => void;
}) => {
  const untested = node.attemptCount === 0;
  const meta = untested
    ? '아직 안 풂'
    : `자력정답 ${node.masteryScore}% · 푼 문제 ${node.attemptCount}개`;
  const actionLabel =
    node.intensity === 'mastered'
      ? null
      : node.intensity === 'untested'
        ? '진단'
        : node.intensity === 'weak'
          ? '메우기'
          : '더 풀기';

  return (
    <div className="border-line-line1/70 flex items-center gap-3 border-t py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className="font-body2-heading text-text-main flex items-center gap-1.5">
          {node.displayName}
          {node.stuck && (
            <AlertTriangle
              size={14}
              className="text-system-warning shrink-0"
              aria-hidden
            />
          )}
        </div>
        <div className="font-caption-normal text-text-sub2 mt-0.5 tabular-nums">
          {meta}
        </div>
      </div>
      <div className="bg-tree-untested hidden h-1.75 w-22 shrink-0 overflow-hidden rounded-full sm:block">
        <div
          className={cn('h-full rounded-full', FLAT_FILL[node.intensity])}
          style={{ width: `${untested ? 2 : node.masteryScore}%` }}
        />
      </div>
      <span className="font-caption-heading text-text-sub1 w-10 shrink-0 text-right tabular-nums">
        {untested ? '-' : `${node.masteryScore}%`}
      </span>
      {actionLabel ? (
        <Button
          size="xsmall"
          variant={node.intensity === 'weak' ? 'primary' : 'outlined'}
          className="shrink-0 whitespace-nowrap"
          onClick={() => onOpen(node)}
        >
          {actionLabel}
        </Button>
      ) : (
        <span className="font-caption-heading bg-key-color-primary shrink-0 rounded-full px-3 py-1.5 text-white">
          🚩 정복
        </span>
      )}
    </div>
  );
};

type RidgeDrilldownProps = {
  peak: RidgeNode | null;
  onClose: () => void;
  onOpenNode: (node: TreeNodeView) => void;
};

/* ─────────────────────────────────────────────────────
 * 봉우리 클릭 시 열리는 세부 트리 (능선 카드 바깥, 화면 단일 위치)
 *  - 중단원 = 아코디언, 하위개념 = 리프 행.
 *  - 중단원 구조가 없는(자식이 리프뿐인) 봉우리는 리프를 바로 나열.
 * ────────────────────────────────────────────────────*/
export const RidgeDrilldown = ({
  peak,
  onClose,
  onOpenNode,
}: RidgeDrilldownProps) => {
  if (!peak) return null;

  const hasMidLayer = peak.children.some((c) => c.children.length > 0);
  const overviewText =
    peak.attemptCount === 0
      ? '미진단'
      : `정복도 ${peak.masteryScore}% · ${
          peak.intensity === 'mastered'
            ? '정복'
            : peak.intensity === 'progress'
              ? '진행'
              : peak.intensity === 'weak'
                ? '약점'
                : '미진단'
        }`;

  return (
    <div className="border-orange-3 animate-in fade-in slide-in-from-top-1 rounded-section mt-4 overflow-hidden border bg-white duration-200">
      <div className="bg-orange-1 border-orange-2 flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <p className="font-caption-heading text-orange-10">
            정복 능선 · 세부 트리
          </p>
          <h3 className="font-headline2-heading text-text-main mt-0.5 flex flex-wrap items-baseline gap-2">
            {peak.displayName}
            <span className="font-body2-heading text-key-color-primary tabular-nums">
              {overviewText}
            </span>
          </h3>
        </div>
        <Button
          size="xsmall"
          variant="outlined"
          aria-label="세부 트리 닫기"
          className="shrink-0 gap-1 rounded-full"
          onClick={onClose}
        >
          <X
            size={14}
            aria-hidden
          />
          닫기
        </Button>
      </div>

      <div className="px-4 py-2 md:px-5">
        {peak.children.length === 0 ? (
          <LeafRow
            node={peak}
            onOpen={onOpenNode}
          />
        ) : hasMidLayer ? (
          <Accordion
            type="single"
            collapsible
            defaultValue={peak.children[0]?.nodeId}
          >
            {peak.children.map((mid) => {
              const midUntested = mid.attemptCount === 0;
              return (
                <Accordion.Item
                  key={mid.nodeId}
                  value={mid.nodeId}
                  className="border-line-line1/70 rounded-row mb-1 border-0 border-b bg-transparent backdrop-blur-none last:border-b-0"
                >
                  <Accordion.Trigger className="text-text-main px-1 py-3 text-left font-normal hover:bg-transparent">
                    <span className="flex w-full items-center gap-3">
                      <span className="font-body2-heading flex-1">
                        {mid.displayName}
                      </span>
                      <span className="bg-tree-untested hidden h-2 w-27.5 shrink-0 overflow-hidden rounded-full sm:block">
                        <span
                          className={cn(
                            'block h-full rounded-full',
                            FLAT_FILL[mid.intensity]
                          )}
                          style={{
                            width: `${midUntested ? 2 : mid.masteryScore}%`,
                          }}
                        />
                      </span>
                      <span className="font-caption-heading text-text-sub1 w-10 shrink-0 text-right tabular-nums">
                        {midUntested ? '-' : `${mid.masteryScore}%`}
                      </span>
                    </span>
                  </Accordion.Trigger>
                  <Accordion.Content className="px-1 pt-0 pb-2 text-inherit">
                    <div className="pl-2">
                      {mid.children.length === 0 ? (
                        <LeafRow
                          node={mid}
                          onOpen={onOpenNode}
                        />
                      ) : (
                        mid.children.map((leaf) => (
                          <LeafRow
                            key={leaf.nodeId}
                            node={leaf}
                            onOpen={onOpenNode}
                          />
                        ))
                      )}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion>
        ) : (
          <div className="py-1">
            {peak.children.map((leaf) => (
              <LeafRow
                key={leaf.nodeId}
                node={leaf}
                onOpen={onOpenNode}
              />
            ))}
          </div>
        )}
      </div>
      <div className="h-3" />
    </div>
  );
};
