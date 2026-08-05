'use client';

import { useState } from 'react';

import Image from 'next/image';

import { type ChallengeReviewSort } from '@/entities/open-challenge';
import { TextViewer, parseEditorContent } from '@/shared/components/editor';
import { Button, Dialog, Select } from '@/shared/components/ui';
import { cn, extractText } from '@/shared/lib';
import { Lock, MoreVertical, PencilLine, ThumbsUp, User } from 'lucide-react';

export type SolutionItem = {
  id: string;
  nickname: string;
  subject: string;
  content: string;
  solutionType: 'TEXT' | 'DRAWING';
  drawingImageUrl: string | null;
  recommendCount: number;
  isBest: boolean;
  isRecommendedByMe: boolean;
  isCorrect: boolean | null;
  authorNickname: string;
  isMine: boolean;
};

type SolutionListProps = {
  solutions: SolutionItem[];
  totalCount: number;
  sort: ChallengeReviewSort;
  isRecommendPending?: boolean;
  isWithdrawPending?: boolean;
  /**
   * 컨닝가드: 본인이 아직 이 문제를 완료(COMPLETED)하지 않았으면 true.
   * true면 풀이 목록 대신 잠금 안내를 노출한다.
   */
  isLocked?: boolean;
  onSortChange: (sort: ChallengeReviewSort) => void;
  onRecommendToggle: (solution: SolutionItem) => void;
  onWithdraw: (solution: SolutionItem) => void;
};

const CONTENT_EXPAND_THRESHOLD = 150;
const CONTENT_LINE_THRESHOLD = 4;

const countContentLines = (jsonString: string): number => {
  try {
    const doc = JSON.parse(jsonString);
    let count = 0;
    const traverse = (node: { type?: string; content?: unknown[] }) => {
      if (node.type === 'hardBreak') count++;
      if (node.type === 'paragraph') count++;
      node.content?.forEach((child) => traverse(child as typeof node));
    };
    doc.content?.forEach((node: unknown) =>
      traverse(node as { type?: string; content?: unknown[] })
    );
    return count;
  } catch {
    return 0;
  }
};

export const SolutionList = ({
  solutions,
  totalCount,
  sort,
  isRecommendPending = false,
  isWithdrawPending = false,
  isLocked = false,
  onSortChange,
  onRecommendToggle,
  onWithdraw,
}: SolutionListProps) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [withdrawTarget, setWithdrawTarget] = useState<SolutionItem | null>(
    null
  );

  const visibleSolutions = expanded ? solutions : solutions.slice(0, 3);

  // ── 컨닝가드: 미완료 시 잠금 ──────────────────────────────
  if (isLocked) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-body1-heading text-text-main">다른 사람 풀이</h2>
        <div className="border-line-line1 flex flex-col items-center gap-3 rounded-xl border bg-white px-6 py-12 text-center">
          <div className="bg-orange-1 flex size-14 items-center justify-center rounded-full">
            <Lock
              size={24}
              className="text-orange-7"
            />
          </div>
          <p className="font-body1-heading text-text-main">
            먼저 문제를 풀어야 볼 수 있어요
          </p>
          <p className="font-body2-normal text-gray-8 max-w-[320px] text-sm leading-relaxed text-balance">
            풀고 나면 다른 학생들의 손글씨 풀이와 베스트 풀이를 확인할 수
            있어요.
          </p>
        </div>
      </div>
    );
  }

  // ── 빈 상태 ──────────────────────────────────────────────
  if (solutions.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-body1-heading text-text-main">
          다른 사람 풀이 0개
        </h2>
        <div className="border-line-line1 flex flex-col items-center gap-3 rounded-xl border bg-white px-6 py-12 text-center">
          <div className="bg-gray-1 flex size-14 items-center justify-center rounded-full">
            <PencilLine
              size={24}
              className="text-gray-6"
            />
          </div>
          <p className="font-body2-heading text-text-main">
            아직 공유된 풀이가 없어요
          </p>
          <p className="font-caption-normal text-gray-8 text-sm">
            첫 번째 풀이를 남겨보세요.
          </p>
        </div>
      </div>
    );
  }

  const toggleContentExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-body1-heading text-text-main">
          다른 사람 풀이 {totalCount}개
        </h2>
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as ChallengeReviewSort)}
        >
          <Select.Trigger
            className="border-line-line2 font-label-normal h-[36px] w-auto min-w-[90px] rounded-[8px] px-3 pr-8 text-sm whitespace-nowrap focus:ring-0 focus:outline-none"
            placeholder="추천순"
          />
          <Select.Content>
            <Select.Option
              value="recommend"
              className="font-body2-normal flex h-[32px] w-full items-center justify-center border-b-0 text-center"
            >
              추천순
            </Select.Option>
            <Select.Option
              value="latest"
              className="font-body2-normal flex h-[32px] w-full items-center justify-center border-b-0 text-center"
            >
              최신순
            </Select.Option>
          </Select.Content>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {visibleSolutions.map((solution) => {
          const isDrawing = solution.solutionType === 'DRAWING';
          const hasContent = solution.content.trim().length > 0;
          const parsedContent = parseEditorContent(solution.content);
          const plainText = extractText(solution.content);
          const isLong =
            plainText.length > CONTENT_EXPAND_THRESHOLD ||
            countContentLines(solution.content) > CONTENT_LINE_THRESHOLD;
          const isContentExpanded = expandedIds.has(solution.id);

          return (
            <div
              key={solution.id}
              className={cn(
                'rounded-xl border bg-white p-5',
                solution.isCorrect === true
                  ? 'border-system-success/40'
                  : solution.isCorrect === false
                    ? 'border-orange-3 bg-orange-1/30'
                    : solution.isBest
                      ? 'border-orange-7'
                      : 'border-line-line1'
              )}
            >
              {solution.isBest && (
                <span className="bg-orange-7 mb-3 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-white">
                  ★ 베스트 풀이
                </span>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="bg-gray-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <User
                      size={16}
                      className="text-gray-7"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-body2-heading text-text-main text-sm">
                        {solution.authorNickname}
                      </p>
                      {solution.isCorrect !== null && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-bold',
                            solution.isCorrect
                              ? 'bg-system-success/10 text-system-success'
                              : 'bg-orange-1 text-orange-10'
                          )}
                        >
                          {solution.isCorrect ? '맞은 풀이' : '틀린 풀이'}
                        </span>
                      )}
                      {isDrawing && (
                        <span className="bg-orange-1 text-orange-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          <PencilLine size={11} />
                          손글씨
                        </span>
                      )}
                    </div>
                    <p className="text-gray-8 text-xs">{solution.subject}</p>

                    {isDrawing && solution.drawingImageUrl && (
                      <div className="border-line-line2 bg-gray-1 mt-3 overflow-hidden rounded-lg border">
                        <Image
                          src={solution.drawingImageUrl}
                          alt={`${solution.nickname}님의 손글씨 풀이`}
                          width={760}
                          height={440}
                          unoptimized
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    )}

                    {hasContent && (
                      <>
                        <div
                          className={cn(
                            'mt-3',
                            !isContentExpanded && isLong && 'line-clamp-4'
                          )}
                        >
                          <TextViewer value={parsedContent} />
                        </div>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleContentExpand(solution.id)}
                            className="text-gray-7 hover:text-text-main mt-2 cursor-pointer text-xs font-semibold"
                          >
                            {isContentExpanded ? '접기' : '더보기'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  {solution.isMine && (
                    <button
                      type="button"
                      onClick={() => setWithdrawTarget(solution)}
                      className="text-text-sub2 hover:text-text-main flex size-7 items-center justify-center rounded-lg"
                      aria-label="내 풀이 메뉴"
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRecommendToggle(solution)}
                    disabled={isRecommendPending}
                    className={cn(
                      'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                      solution.isRecommendedByMe
                        ? 'text-orange-7'
                        : 'text-gray-6 hover:text-orange-7'
                    )}
                    aria-label={
                      solution.isRecommendedByMe ? '추천 취소' : '풀이 추천'
                    }
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <span className="font-body2-heading text-text-main text-sm">
                    {solution.recommendCount}
                  </span>
                  <span className="text-gray-6 text-xs">추천</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {solutions.length > 3 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="border-line-line1 text-text-main hover:bg-gray-1 w-full cursor-pointer rounded-xl border bg-white py-4 text-sm font-semibold"
        >
          {expanded ? '접기' : '더 많은 풀이 보기'}
        </button>
      )}

      <Dialog
        isOpen={withdrawTarget !== null}
        onOpenChange={(open) =>
          !open && !isWithdrawPending && setWithdrawTarget(null)
        }
      >
        <Dialog.Content className="w-full max-w-[400px] gap-5 p-6 text-center">
          <Dialog.Header>
            <Dialog.Title className="text-text-main text-lg font-bold">
              이 풀이를 내릴까요?
            </Dialog.Title>
            <Dialog.Description className="text-text-sub1 text-sm leading-relaxed">
              공개 풀이 목록과 대결 화면에서만 사라져요. 정오 기록, 걸린 시간,
              정복 지도 점수는 그대로 남습니다.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              variant="outlined"
              className="flex-1"
              disabled={isWithdrawPending}
              onClick={() => setWithdrawTarget(null)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              disabled={isWithdrawPending || !withdrawTarget}
              onClick={() => {
                if (!withdrawTarget) return;
                onWithdraw(withdrawTarget);
                setWithdrawTarget(null);
              }}
            >
              {isWithdrawPending ? '내리는 중…' : '내리기'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
