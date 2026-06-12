'use client';

import type { TreeNodeView, TreeSubjectGroup } from '@/entities/tree';
import { cn } from '@/shared/lib';

import { QuestionHeader } from '../question-header';

/* ─────────────────────────────────────────────────────
 * 선택 스텝 · 모의고사 한방진단
 *  단원별 강/약을 일괄 입력 → POST /common/onboarding/diagnosis.
 *  자기신고라 트리에 "옅게 + 모의" 표시(정복 무결성). skip 가능.
 *
 *  diagnosis[nodeId] === true  → weak(약함/틀림)
 *  diagnosis[nodeId] === false → strong(강함/맞힘)
 *  미정(undefined)              → 진단 항목에서 제외
 * ────────────────────────────────────────────────────*/
type DiagnosisStepProps = {
  groups: TreeSubjectGroup[];
  /** nodeId → weak(true) | strong(false). 미정이면 키 없음 */
  marks: Record<string, boolean>;
  onMark: (nodeId: string, weak: boolean) => void;
};

const nodesOf = (groups: TreeSubjectGroup[]): TreeNodeView[] =>
  groups.flatMap((g) => g.nodes);

export const DiagnosisStep = ({
  groups,
  marks,
  onMark,
}: DiagnosisStepProps) => {
  const nodes = nodesOf(groups);
  const markedCount = nodes.filter((n) => n.nodeId in marks).length;

  return (
    <div className="flex flex-col gap-4">
      <QuestionHeader
        title={
          <>
            최근 모의고사
            <br />
            결과를 넣어볼까요?
          </>
        }
        sub={
          <>
            단원별로 <b>강했는지/약했는지</b> 넣으면 트리를 미리 채워 진단해요.
            직접 푼 게 아니라 옅게 표시돼요.
          </>
        }
      />

      <div className="flex items-center gap-2">
        <span className="font-label-heading text-text-main">단원별 자기신고</span>
        <span className="font-caption-heading rounded-full border border-orange-1 bg-background-orange px-2 py-0.5 text-orange-10">
          선택 입력
        </span>
      </div>

      <ul className="border-line-line1 divide-line-line1 divide-y rounded-[12px] border bg-white">
        {nodes.map((node) => {
          const mark = marks[node.nodeId];
          return (
            <li
              key={node.nodeId}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="font-label-normal text-text-main line-clamp-1">
                {node.displayName}
              </span>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  aria-pressed={mark === false}
                  onClick={() => onMark(node.nodeId, false)}
                  className={cn(
                    'font-caption-heading min-h-[36px] rounded-full border px-3 transition',
                    mark === false
                      ? 'border-key-color-primary bg-key-color-primary text-white'
                      : 'border-line-line1 text-text-sub2 bg-white'
                  )}
                >
                  강함
                </button>
                <button
                  type="button"
                  aria-pressed={mark === true}
                  onClick={() => onMark(node.nodeId, true)}
                  className={cn(
                    'font-caption-heading min-h-[36px] rounded-full border px-3 transition',
                    mark === true
                      ? 'border-system-warning bg-system-warning text-white'
                      : 'border-line-line1 text-text-sub2 bg-white'
                  )}
                >
                  약함
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="font-caption-normal text-text-sub2 tabular-nums">
        <b className="text-key-color-primary">{markedCount}개</b> 단원 입력됨 ·
        나머지는 미진단으로 남아요
      </p>
    </div>
  );
};
