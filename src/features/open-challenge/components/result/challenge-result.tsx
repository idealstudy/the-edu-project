'use client';

import { useEffect, useRef, useState } from 'react';

import { type ChallengeReviewSort } from '@/entities/open-challenge';
import { ChallengeShareButton } from '@/features/social';
import { BackButton } from '@/shared/components/ui';
import { trackOcComplete } from '@/shared/lib/analytics';

import {
  useCancelChallengeReviewRecommendMutation,
  useChallengeReviewsQuery,
  useMyOpenChallengeDetailQuery,
  useNextChallengeQuery,
  useOpenChallengeDetailQuery,
  useRecommendChallengeReviewMutation,
} from '../../hooks/use-open-challenge';
import { AiFeedbackForm } from './ai-feedback-form';
import { ChallengeResultSkeleton } from './challenge-result-skeleton';
import { ChallengeReward } from './challenge-reward';
import { NextChallengeCard } from './next-challenge-card';
import { ResultCrossCheck } from './result-cross-check';
import { type SolutionItem, SolutionList } from './solution-list';

type RewardDelta = {
  pointDelta: number;
  pointBalance: number;
  streakKept: boolean;
  streakDays: number;
  expDelta: number;
  expBefore: number;
  level: number;
  leveledUp: boolean;
  treeNodeName: string | null;
  masteryBefore: number;
  masteryAfter: number;
  conquered: boolean;
} | null;

type SubmittedResult = {
  isCorrect: boolean;
  correctAnswer: string;
  passRate: number | null;
  participantCount: number;
  attemptId?: string;
  // 방금 제출 시 내가 고른 답. 크로스체크 좌측 비교에 쓴다. 구버전 저장분엔 없을 수 있어 optional.
  selectedAnswer?: string | null;
  // 방금 푼 내 손글씨 풀이 스냅샷(PNG dataURL). strokes 가 있을 때만 채워진다.
  myDrawingDataUrl?: string;
  // 표시용 투영 보상 델타(D1). 구버전 백엔드 대비 optional.
  reward?: RewardDelta;
  // 결과화면 해설 섹션 표시 전용 시드 해설(마크다운). 판정(자력 여부)에는 영향 없음 — 제출 후 노출.
  solutionText?: string | null;
};

type ChallengeResultProps = {
  challengeId: string;
  /** 비로그인(게스트) 여부. oc_complete 이벤트의 is_guest 차원. */
  isGuest?: boolean;
};

const RESULT_STORAGE_KEY_PREFIX = 'open-challenge-result';

export const ChallengeResult = ({
  challengeId,
  isGuest = false,
}: ChallengeResultProps) => {
  const [isResultLoaded, setIsResultLoaded] = useState(false);
  const [submittedResult, setSubmittedResult] =
    useState<SubmittedResult | null>(null);
  const [reviewSort, setReviewSort] =
    useState<ChallengeReviewSort>('recommend');
  const hasFiredCompleteRef = useRef(false);

  const isLoggedIn = !isGuest;

  // 컨닝가드: 본인이 이 문제를 COMPLETED 한 경우에만 다른 풀이 열람.
  // 게스트는 private 엔드포인트(401)이므로 애초에 호출하지 않는다.
  const { data: myChallengeDetail, isLoading: isMyDetailLoading } =
    useMyOpenChallengeDetailQuery(challengeId, { enabled: isLoggedIn });
  const completedAttempt =
    myChallengeDetail?.attempts.find(
      (attempt) => attempt.status === 'COMPLETED'
    ) ?? null;
  // 방금 제출하고 결과 페이지에 도달한 경우도 완료로 간주(데이터 동기화 지연 대비).
  const isUnlocked = completedAttempt !== null || submittedResult !== null;
  // sessionStorage 소실(새로고침·직접 진입) 시 재조회 폴백 여부.
  const isFallback = !submittedResult && isUnlocked;

  // 크로스체크(문제+정오 비교) 좌측에 쓸 문제 원문 — 새로고침에도 항상 공개 API로 조회.
  const { data: challengeDetail, isLoading: isChallengeDetailLoading } =
    useOpenChallengeDetailQuery(challengeId, { enabled: isUnlocked });

  const { data: solutions, isLoading: isSolutionsLoading } =
    useChallengeReviewsQuery(challengeId, reviewSort, { enabled: isUnlocked });
  const { data: nextChallenge, isLoading: isNextChallengeLoading } =
    useNextChallengeQuery(challengeId, { isGuest });
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

  // oc_complete: 방금 제출한 결과가 있을 때 1회 발화 (루프 1바퀴 완주)
  useEffect(() => {
    if (!submittedResult || hasFiredCompleteRef.current) return;
    hasFiredCompleteRef.current = true;
    trackOcComplete({
      is_correct: submittedResult.isCorrect,
      tree_node: submittedResult.reward?.treeNodeName ?? null,
      is_guest: isGuest,
    });
  }, [submittedResult, isGuest]);

  if (
    !isResultLoaded ||
    isMyDetailLoading ||
    (isUnlocked && isSolutionsLoading) ||
    (isUnlocked && isChallengeDetailLoading) ||
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

  // 크로스체크 카드에 넘길 값 — 방금 제출 직후 응답을 우선, 없으면(새로고침) 재조회로 폴백.
  const crossCheckSelectedAnswer =
    submittedResult?.selectedAnswer ?? completedAttempt?.selectedAnswer ?? null;
  const crossCheckIsCorrect =
    submittedResult?.isCorrect ?? completedAttempt?.isCorrect ?? null;
  const crossCheckCorrectAnswer = submittedResult?.correctAnswer ?? null;
  const crossCheckPassRate =
    submittedResult?.passRate ?? challengeDetail?.passRate ?? null;
  const crossCheckParticipantCount =
    submittedResult?.participantCount ??
    challengeDetail?.participantCount ??
    null;

  return (
    <main className="tablet:px-8 mx-auto w-full max-w-[1200px] px-4 py-8">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {submittedResult && (
            <ChallengeReward
              isCorrect={submittedResult.isCorrect}
              reward={submittedResult.reward}
              passRate={submittedResult.passRate}
              participantCount={submittedResult.participantCount}
            />
          )}
          {isUnlocked && challengeDetail && (
            <ResultCrossCheck
              questionText={challengeDetail.questionText}
              questionImageUrl={challengeDetail.questionImageUrl}
              selectedAnswer={crossCheckSelectedAnswer}
              correctAnswer={crossCheckCorrectAnswer}
              isCorrect={crossCheckIsCorrect}
              passRate={crossCheckPassRate}
              participantCount={crossCheckParticipantCount}
              solutionText={submittedResult?.solutionText ?? null}
              fallbackAttemptId={
                isFallback ? (completedAttempt?.attemptId ?? null) : null
              }
              isLoggedIn={isLoggedIn}
            />
          )}
          {!isUnlocked && isGuest && (
            <section
              className="border-line-line2 flex flex-col gap-2 rounded-[12px] border bg-white p-5"
              aria-label="게스트 결과 안내"
            >
              <h2 className="font-body1-heading text-text-main">
                결과를 다시 볼 수 없어요
              </h2>
              <p className="font-caption-normal text-text-sub2">
                게스트는 풀이 기록이 저장되지 않아 새로고침하면 결과가 사라져요.
                로그인하면 문제·정답·해설을 언제든 다시 볼 수 있어요.
              </p>
            </section>
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
