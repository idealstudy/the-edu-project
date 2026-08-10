'use client';

import { useState } from 'react';

import { type ChallengeSolution } from '@/entities/open-challenge';
import { MathMarkdown } from '@/shared/components/markdown';
import { Button, Dialog } from '@/shared/components/ui';
import { BookOpenCheck, TriangleAlert } from 'lucide-react';

import { useChallengeSolutionMutation } from '../../hooks/use-open-challenge';

type SolutionPanelProps = {
  /** 현재 풀이 attempt id. 없으면(풀이 시작 전) 해설을 열 수 없다. */
  attemptId: string | null;
  isLoggedIn: boolean;
};

const SOLUTION_COST = 30;

/* ─────────────────────────────────────────────────────
 * 정답 해설 버튼 + 차감 경고 Dialog
 *  - 버튼은 코치보다 시각적으로 조용히(secondary, 작게) — 코치 사용 유도.
 *  - 클릭 시 −30P 차감 + 약점 지도 제외 경고 → 확인해야 해설 조회.
 *  - 해설 본문은 KaTeX 마크다운으로 렌더.
 * ────────────────────────────────────────────────────*/
export const SolutionPanel = ({
  attemptId,
  isLoggedIn,
}: SolutionPanelProps) => {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [solution, setSolution] = useState<ChallengeSolution | null>(null);
  const solutionMutation = useChallengeSolutionMutation();

  // 풀이를 시작(attempt 생성)하고 로그인된 상태에서만 해설을 열 수 있다.
  const canViewSolution = isLoggedIn && !!attemptId;

  const handleConfirmView = () => {
    if (!attemptId) return;

    solutionMutation.mutate(attemptId, {
      onSuccess: (data) => {
        setSolution(data);
        setIsWarningOpen(false);
      },
    });
  };

  // 이미 본 해설이 있으면 버튼 대신 본문을 노출한다.
  if (solution) {
    return (
      <section
        className="border-line-line1 flex flex-col gap-3 rounded-xl border bg-white px-5 py-4"
        aria-label="정답 해설"
      >
        <div className="flex items-center gap-2">
          <BookOpenCheck
            size={18}
            className="text-gray-7"
            aria-hidden
          />
          <h2 className="font-body1-heading text-text-main">정답 해설</h2>
        </div>
        {solution.correctAnswer && (
          <p className="font-body2-heading text-text-main">
            정답:{' '}
            <span className="text-orange-7 tabular-nums">
              {solution.correctAnswer}
            </span>
          </p>
        )}
        <MathMarkdown
          content={solution.content || '해설 본문이 준비되지 않았어요.'}
          className="text-text-main text-sm leading-relaxed"
        />
      </section>
    );
  }

  return (
    <>
      <div className="flex flex-col items-start gap-1.5">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsWarningOpen(true)}
          disabled={!canViewSolution}
          className="h-9 px-3 text-sm"
        >
          <BookOpenCheck
            size={16}
            className="mr-1.5"
          />
          정답 해설
        </Button>
        {!canViewSolution && (
          <p className="font-caption-normal text-text-sub2">
            문제를 풀기 시작하면 해설을 열 수 있어요.
          </p>
        )}
      </div>

      <Dialog
        isOpen={isWarningOpen}
        onOpenChange={setIsWarningOpen}
      >
        <Dialog.Content className="w-full max-w-95 gap-5 p-6 text-center">
          <Dialog.Header className="items-center">
            <div className="bg-orange-1 flex h-14 w-14 items-center justify-center rounded-full">
              <TriangleAlert
                size={26}
                className="text-orange-7"
                aria-hidden
              />
            </div>
            <Dialog.Title className="text-text-main text-lg font-bold">
              해설을 볼까요?
            </Dialog.Title>
            <Dialog.Description className="text-gray-8 text-sm leading-relaxed">
              해설을 보면{' '}
              <span className="text-orange-7 font-semibold tabular-nums">
                −{SOLUTION_COST}P
              </span>{' '}
              차감되고, 이 문제는 약점 지도에 채워지지 않아요. 그래도 볼까요?
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer className="flex-col">
            <Button
              type="button"
              onClick={handleConfirmView}
              disabled={solutionMutation.isPending}
              className="w-full"
            >
              {solutionMutation.isPending
                ? '해설 불러오는 중...'
                : `해설 보기 (−${SOLUTION_COST}P)`}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsWarningOpen(false)}
              disabled={solutionMutation.isPending}
              className="w-full"
            >
              조금 더 풀어볼게요
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
