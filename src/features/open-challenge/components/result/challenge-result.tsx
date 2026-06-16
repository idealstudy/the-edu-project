'use client';

import { useEffect, useState } from 'react';

import { type ChallengeReviewSort } from '@/entities/open-challenge';
import { ChallengeShareButton } from '@/features/social';
import { BackButton } from '@/shared/components/ui';

import {
  useCancelChallengeReviewRecommendMutation,
  useChallengeReviewsQuery,
  useMyOpenChallengeDetailQuery,
  useNextChallengeQuery,
  useRecommendChallengeReviewMutation,
} from '../../hooks/use-open-challenge';
import { AiFeedbackForm } from './ai-feedback-form';
import { ChallengeResultSkeleton } from './challenge-result-skeleton';
import { NextChallengeCard } from './next-challenge-card';
import { ResultStats } from './result-stats';
import { type SolutionItem, SolutionList } from './solution-list';

type SubmittedResult = {
  isCorrect: boolean;
  correctAnswer: string;
  passRate: number | null;
  participantCount: number;
  attemptId?: string;
  // 방금 푼 내 손글씨 풀이 스냅샷(PNG dataURL). strokes 가 있을 때만 채워진다.
  myDrawingDataUrl?: string;
};

type ChallengeResultProps = {
  challengeId: string;
};

const RESULT_STORAGE_KEY_PREFIX = 'open-challenge-result';

export const ChallengeResult = ({ challengeId }: ChallengeResultProps) => {
  const [isResultLoaded, setIsResultLoaded] = useState(false);
  const [submittedResult, setSubmittedResult] =
    useState<SubmittedResult | null>(null);
  const [reviewSort, setReviewSort] =
    useState<ChallengeReviewSort>('recommend');

  // 컨닝가드: 본인이 이 문제를 COMPLETED 한 경우에만 다른 풀이 열람.
  const { data: myChallengeDetail, isLoading: isMyDetailLoading } =
    useMyOpenChallengeDetailQuery(challengeId);
  const hasCompletedAttempt =
    myChallengeDetail?.attempts.some(
      (attempt) => attempt.status === 'COMPLETED'
    ) ?? false;
  // 방금 제출하고 결과 페이지에 도달한 경우도 완료로 간주(데이터 동기화 지연 대비).
  const isUnlocked = hasCompletedAttempt || submittedResult !== null;

  const { data: solutions, isLoading: isSolutionsLoading } =
    useChallengeReviewsQuery(challengeId, reviewSort, { enabled: isUnlocked });
  const { data: nextChallenge, isLoading: isNextChallengeLoading } =
    useNextChallengeQuery(challengeId);
  const recommendMutation = useRecommendChallengeReviewMutation(challengeId);
  const cancelRecommendMutation =
    useCancelChallengeReviewRecommendMutation(challengeId);

  useEffect(() => {
    const rawResult = window.sessionStorage.getItem(
      `${RESULT_STORAGE_KEY_PREFIX}:${challengeId}`
    );
    if (rawResult) setSubmittedResult(JSON.parse(rawResult));
    setIsResultLoaded(true);
  }, [challengeId]);

  if (
    !isResultLoaded ||
    isMyDetailLoading ||
    (isUnlocked && isSolutionsLoading) ||
    isNextChallengeLoading
  ) {
    return <ChallengeResultSkeleton />;
  }

  const handleRecommendToggle = (solution: SolutionItem) => {
    if (solution.isRecommendedByMe) {
      cancelRecommendMutation.mutate(solution.id);
      return;
    }

    recommendMutation.mutate(solution.id);
  };

  return (
    <main className="tablet:px-8 mx-auto w-full max-w-[1200px] px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {submittedResult && (
            <ResultStats
              isCorrect={submittedResult.isCorrect}
              correctAnswer={submittedResult.correctAnswer}
              passRate={submittedResult.passRate}
              participantCount={submittedResult.participantCount}
            />
          )}
          {submittedResult?.myDrawingDataUrl && (
            <section className="border-line-line2 flex flex-col gap-3 rounded-[12px] border bg-white p-5">
              <h2 className="font-body1-heading text-text-main">내 풀이</h2>
              <div className="border-line-line2 bg-gray-1 overflow-hidden rounded-lg border">
                {/* dataURL 스냅샷 — next/image 최적화 대상 아님 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={submittedResult.myDrawingDataUrl}
                  alt="내가 작성한 손글씨 풀이"
                  className="h-auto w-full object-contain"
                />
              </div>
            </section>
          )}
          <SolutionList
            solutions={solutions ?? ([] as SolutionItem[])}
            totalCount={solutions?.length ?? 0}
            sort={reviewSort}
            isLocked={!isUnlocked}
            isRecommendPending={
              recommendMutation.isPending || cancelRecommendMutation.isPending
            }
            onSortChange={setReviewSort}
            onRecommendToggle={handleRecommendToggle}
          />
        </div>

        <aside className="flex w-full flex-col gap-4 lg:w-[340px] lg:shrink-0">
          {Number.isInteger(Number(challengeId)) && (
            <div className="border-line-line2 flex flex-col gap-3 rounded-[12px] border bg-white p-5">
              <div className="flex flex-col gap-1">
                <h2 className="font-body1-heading text-text-main">
                  친구와 대결
                </h2>
                <p className="font-caption-normal text-text-sub2 text-balance">
                  이 문제로 도전장을 보내 누가 더 잘 푸는지 겨뤄봐요.
                </p>
              </div>
              <ChallengeShareButton
                challengeId={Number(challengeId)}
                className="w-full"
              />
            </div>
          )}
          <AiFeedbackForm attemptId={submittedResult?.attemptId} />
          {nextChallenge && <NextChallengeCard {...nextChallenge} />}
        </aside>
      </div>
    </main>
  );
};
