'use client';

import { useMemo, useState } from 'react';

import type { TreeNodeView, TreeSubjectGroup } from '@/entities/tree';
import { cn } from '@/shared/lib';
import { Check } from 'lucide-react';

import { QuestionHeader } from '../question-header';

const SUBJECT_LABEL: Record<TreeSubjectGroup['subject'], string> = {
  MIDDLE_MATH: '중학 수학',
  COMMON_MATH_1: '공통수학Ⅰ',
  COMMON_MATH_2: '공통수학Ⅱ',
  MATH_1: '수학Ⅰ',
  MATH_2: '수학Ⅱ',
  CALCULUS: '미적분',
  PROBABILITY_STATISTICS: '확률과 통계',
  GEOMETRY: '기하',
  OTHER: '기타',
};

/* ─────────────────────────────────────────────────────
 * STEP 4 · 약점 대단원 — 복수 선택 칩카드
 *  과목(또는 단원묶음) 탭으로 범위 전환. 감으로 골라도 됨.
 *  노드 목록은 GET /common/tree 의 대단원 노드(루트 depth)에서.
 * ────────────────────────────────────────────────────*/
type WeakUnitsStepProps = {
  groups: TreeSubjectGroup[];
  selectedIds: string[];
  onToggle: (nodeId: string) => void;
};

export const WeakUnitsStep = ({
  groups,
  selectedIds,
  onToggle,
}: WeakUnitsStepProps) => {
  const [activeSubject, setActiveSubject] = useState<
    TreeSubjectGroup['subject'] | null
  >(groups[0]?.subject ?? null);

  const visibleNodes = useMemo<TreeNodeView[]>(() => {
    if (activeSubject === null) return groups.flatMap((g) => g.nodes);
    return groups.find((g) => g.subject === activeSubject)?.nodes ?? [];
  }, [groups, activeSubject]);

  const selectedSet = new Set(selectedIds);

  return (
    <div className="flex flex-col gap-4">
      <QuestionHeader
        title={
          <>
            어디가 <em>약한</em> 것 같아요?
          </>
        }
        sub="감으로 골라도 돼요. 푼 결과로 트리가 다시 잡혀요. (복수 선택)"
      />

      {/* 과목 탭 */}
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => {
            const on = activeSubject === g.subject;
            return (
              <button
                key={g.subject}
                type="button"
                onClick={() => setActiveSubject(g.subject)}
                className={cn(
                  'font-label-heading rounded-full border px-3.5 py-2 transition',
                  on
                    ? 'border-gray-scale-gray-90 bg-gray-scale-gray-90 text-white'
                    : 'border-line-line1 text-text-sub2 bg-white'
                )}
              >
                {SUBJECT_LABEL[g.subject]}
              </button>
            );
          })}
        </div>
      )}

      {/* 단원 칩 */}
      <div className="flex flex-wrap gap-2.5">
        {visibleNodes.map((node) => {
          const on = selectedSet.has(node.nodeId);
          return (
            <button
              key={node.nodeId}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(node.nodeId)}
              className={cn(
                'font-label-heading flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-2.5 transition',
                'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
                on
                  ? 'border-key-color-primary bg-background-orange text-orange-10'
                  : 'border-line-line1 text-text-main bg-white'
              )}
            >
              <span
                className={cn(
                  'flex size-[18px] items-center justify-center rounded-[5px] border-[1.5px]',
                  on
                    ? 'border-key-color-primary bg-key-color-primary text-white'
                    : 'border-line-line2 text-transparent'
                )}
                aria-hidden
              >
                <Check
                  size={11}
                  strokeWidth={3}
                />
              </span>
              {node.displayName}
            </button>
          );
        })}
      </div>

      <p className="font-caption-normal text-text-sub2">
        <b className="text-key-color-primary">{selectedIds.length}개</b> 선택됨
        · 모르겠으면 비워두고 진단부터 받아도 돼요
      </p>
    </div>
  );
};
