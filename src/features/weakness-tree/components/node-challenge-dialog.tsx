'use client';

import Link from 'next/link';

import { type TreeNodeView } from '@/entities/tree';
import { Skeleton } from '@/shared/components/loading';
import { Dialog } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { AlertTriangle, ArrowRight, Inbox } from 'lucide-react';

import { useNodeChallengesQuery } from '../hooks/use-tree';

const DIFFICULTY_LABEL: Record<string, string> = {
  TOP: '최상',
  HIGH: '상',
  MID: '중',
  LOW: '하',
};

type NodeChallengeDialogProps = {
  node: TreeNodeView | null;
  onClose: () => void;
};

/* ─────────────────────────────────────────────────────
 * 단원 노드 탭 → 해당 단원 문제 목록 (이동 진입점)
 *  "약점" 단정 대신 "더 풀어볼까?" 톤.
 * ────────────────────────────────────────────────────*/
export const NodeChallengeDialog = ({
  node,
  onClose,
}: NodeChallengeDialogProps) => {
  const { data: challenges, isLoading } = useNodeChallengesQuery(
    node?.nodeId ?? '',
    { enabled: Boolean(node) }
  );

  return (
    <Dialog
      isOpen={Boolean(node)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className="max-w-[640px] gap-5 p-6 md:p-8">
        <Dialog.Header>
          <Dialog.Title className="font-headline2-heading text-pretty">
            {node?.displayName ?? '단원'}
          </Dialog.Title>
          <Dialog.Description className="font-body2-normal text-text-sub1">
            {node ? (
              <>
                지금 정복도{' '}
                <span className="text-key-color-primary font-body2-heading tabular-nums">
                  {node.masteryScore}%
                </span>
                . 한 문제 더 풀어볼까요?
              </>
            ) : null}
          </Dialog.Description>
        </Dialog.Header>

        {node?.stuck && (
          <div className="bg-orange-1 border-line-line1 flex items-start gap-2 rounded-[10px] border p-3">
            <AlertTriangle
              size={18}
              className="text-system-warning mt-0.5 shrink-0"
              aria-hidden
            />
            <p className="font-caption-normal text-text-sub1">
              여러 번 막힌 단원이에요. 코치와 한 걸음씩 같이 풀어보면 좋아요.
            </p>
          </div>
        )}

        <Dialog.Body className="gap-2">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton.Block className="h-[68px] w-full rounded-[10px]" />
              <Skeleton.Block className="h-[68px] w-full rounded-[10px]" />
              <Skeleton.Block className="h-[68px] w-full rounded-[10px]" />
            </div>
          ) : (challenges?.length ?? 0) === 0 ? (
            <div className="border-line-line1 flex flex-col items-center gap-2 rounded-[10px] border border-dashed bg-white py-10 text-center">
              <Inbox
                size={28}
                className="text-gray-6"
                aria-hidden
              />
              <p className="font-body2-heading text-text-main">
                이 단원엔 아직 문제가 없어요.
              </p>
              <p className="font-caption-normal text-text-sub2">
                새 문제가 등록되면 여기에서 풀 수 있어요.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {challenges?.map((challenge) => (
                <li key={challenge.challengeId}>
                  <Link
                    href={PUBLIC.OPEN_CHALLENGE.DETAIL(challenge.challengeId)}
                    className="border-line-line1 hover:border-key-color-primary flex min-h-[44px] items-center gap-3 rounded-[10px] border bg-white p-3 transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-caption-heading text-text-sub2">
                        {challenge.sourceText} · 난이도{' '}
                        {DIFFICULTY_LABEL[challenge.difficulty]}
                      </span>
                      <span className="font-body2-normal text-text-main line-clamp-1">
                        {challenge.questionText}
                      </span>
                      <span className="font-caption-normal text-text-sub2 tabular-nums">
                        {challenge.passRate !== null
                          ? `통과율 ${challenge.passRate}%`
                          : '아직 통과율 집계 전'}
                        {' · '}
                        {challenge.participantCount}명 도전
                      </span>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-gray-6 shrink-0"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Dialog.Body>

        <Dialog.Footer className="justify-end">
          <Dialog.Close className="font-label-heading text-text-sub1 hover:bg-background-gray flex h-11 cursor-pointer items-center rounded-[8px] px-4">
            닫기
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
