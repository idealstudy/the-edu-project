'use client';

import Link from 'next/link';

import type { WrongAnswerItem } from '@/entities/wrong-answer';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';
import { ArrowLeft, Inbox, RefreshCw } from 'lucide-react';

import {
  useDailyProblemsQuery,
  useWrongAnswersQuery,
} from '../../hooks/use-wrong-answer-query';
import { ReviewStamps } from './review-stamps';

const SOURCE_LABEL: Record<WrongAnswerItem['sourceType'], string> = {
  EXAM: '시험 오답',
  TEACHER: '선생님 배정',
  SELF_REVIEW: '내 복습',
};

const getSnapshotText = (
  snapshot: WrongAnswerItem['questionSnapshot'],
  key: string
) => {
  const value = snapshot?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
};

const formatCommentedAt = (dateTime: string | null) => {
  if (!dateTime) return null;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime));
};

const getPreviousReviewText = (item: WrongAnswerItem) => {
  if (item.reviewCount === 0) {
    return '아직 이전 회독 기록이 없어요.';
  }

  if (item.lastReviewCorrect === true) {
    return '직전 회독에서 정답으로 기록했어요.';
  }

  if (item.lastReviewCorrect === false) {
    return '직전 회독에서 오답으로 기록했어요.';
  }

  return '직전 회독 결과가 아직 기록되지 않았어요.';
};

const ReviewLoading = () => (
  <div className="gap-block-gap flex flex-col">
    <Skeleton.Block className="h-40 w-full" />
    <Skeleton.Block className="h-32 w-full" />
    <Skeleton.Block className="h-40 w-full" />
  </div>
);

const EmptyReview = () => (
  <section
    className="border-gray-3 bg-gray-white rounded-card px-empty-pad-x py-empty-pad-y flex flex-col items-center border text-center"
    data-testid="wrong-answer-list-empty"
  >
    <Inbox
      className="text-gray-6 size-10"
      aria-hidden
    />
    <h2 className="font-body1-heading text-gray-12 mt-content-gap">
      아직 틀린 문제가 없어요
    </h2>
    <p className="font-body2-normal text-gray-8 mt-inline-gap max-w-copy leading-relaxed">
      여기는 틀린 문제가 쌓이는 곳입니다. 문제를 풀다 틀리면 자동으로 들어오고,
      다섯 번 맞힐 때까지 하루 한 번씩 돌아옵니다.
      <br />
      지금은 오늘의 문제 3개부터 시작하면 됩니다.
    </p>
    <Button
      asChild
      size="small"
      className="mt-section-gap"
    >
      <Link href={PRIVATE.DASHBOARD.STUDENT}>오늘의 문제 풀러 가기</Link>
    </Button>
  </section>
);

const TodayReview = ({ item }: { item: WrongAnswerItem }) => {
  const reviewHref = PRIVATE.DASHBOARD.WRONG_ANSWER_REVIEW(item.id);
  const questionHref = `${reviewHref}?question=1`;
  const unit = getSnapshotText(item.questionSnapshot, 'unit');
  const commentedAt = formatCommentedAt(item.commentedAt);

  return (
    <div
      className="gap-block-gap flex flex-col"
      data-testid="wrong-answer-today-review"
    >
      <article className="border-gray-3 bg-gray-white rounded-card p-card-pad border">
        <div className="gap-content-gap flex flex-wrap items-start">
          <div className="min-w-0">
            <div className="gap-content-gap flex flex-wrap items-center">
              <h2 className="font-body1-heading text-gray-12">
                {item.title ?? '오답 문제'}
              </h2>
              <span className="font-caption-heading bg-orange-2 text-orange-10 rounded-pill px-content-gap py-inline-gap-xs">
                {SOURCE_LABEL[item.sourceType]}
              </span>
            </div>
            <p className="font-caption-normal text-gray-8 mt-inline-gap">
              {unit ? `${unit} · ` : ''}
              {item.reviewCount + 1}회독
            </p>
          </div>
        </div>

        <p className="font-body2-normal text-gray-12 bg-system-background mt-section-gap rounded-button border-gray-2 p-card-pad truncate border leading-relaxed">
          {item.questionText ?? '저장된 문제 이미지에서 내용을 확인해주세요.'}
        </p>

        <div className="mt-content-gap gap-content-gap flex flex-wrap items-center">
          <ReviewStamps
            filled={item.reviewCount}
            total={5}
          />
          <span className="font-caption-heading text-gray-8 tabular-nums">
            회독 · 하루 한 번
          </span>
        </div>
      </article>

      {item.teacherComment && (
        <section
          className="border-orange-3 bg-orange-1 rounded-card p-card-pad border"
          data-testid="wrong-answer-teacher-comment"
        >
          <div className="gap-content-gap flex flex-wrap items-baseline justify-between">
            <h2 className="font-body1-heading text-gray-12">선생님 코멘트</h2>
            {commentedAt && (
              <time
                className="font-caption-normal text-gray-8"
                dateTime={item.commentedAt ?? undefined}
              >
                {commentedAt}
              </time>
            )}
          </div>
          <p className="font-body2-normal text-gray-12 mt-content-gap leading-relaxed whitespace-pre-wrap">
            {item.teacherComment}
          </p>
          <div className="mt-block-gap gap-inline-gap flex flex-wrap">
            <Button
              asChild
              size="xsmall"
            >
              <Link href={reviewHref}>확인했어요</Link>
            </Button>
            <Button
              asChild
              size="xsmall"
              variant="outlined"
            >
              <Link href={questionHref}>질문 남기기</Link>
            </Button>
          </div>
        </section>
      )}

      <section className="border-gray-3 bg-gray-white rounded-card p-card-pad border">
        <div className="gap-content-gap flex flex-wrap items-baseline">
          <h2 className="font-body1-heading text-gray-12">내 풀이</h2>
          <span className="font-caption-normal text-gray-8">
            이전 회독 기록
          </span>
        </div>
        <div className="border-gray-3 bg-system-background mt-content-gap rounded-button p-card-pad border">
          <p className="font-label-heading text-gray-11 tabular-nums">
            {item.reviewCount === 0
              ? '첫 회독 전'
              : `${item.reviewCount}회독 기록`}
          </p>
          <p className="font-body2-normal text-gray-9 mt-inline-gap leading-relaxed">
            {getPreviousReviewText(item)} 힌트 없이 푼 누적은{' '}
            <b className="text-gray-11 font-bold tabular-nums">
              {item.hintFreeSolveCount}회
            </b>
            입니다.
          </p>
        </div>
        <Button
          asChild
          size="medium"
          className="mt-block-gap w-full"
        >
          <Link
            href={reviewHref}
            data-testid={`wrong-answer-review-${item.id}`}
          >
            {item.reviewCount + 1}회독 풀이 쓰기
          </Link>
        </Button>
        <p className="bg-gray-1 text-gray-9 font-caption-normal mt-content-gap rounded-button p-content-gap leading-relaxed">
          다시 푸는 순간은 풀이 화면입니다. 이 화면은 회독 상태와 선생님
          코멘트를 관리합니다.
        </p>
      </section>
    </div>
  );
};

export const WrongAnswerWarehouse = () => {
  const dailyProblemsQuery = useDailyProblemsQuery();
  const wrongAnswersQuery = useWrongAnswersQuery();
  const isPending = dailyProblemsQuery.isPending || wrongAnswersQuery.isPending;
  const isError = dailyProblemsQuery.isError || wrongAnswersQuery.isError;

  const todayWrongAnswerIds = new Set(
    (dailyProblemsQuery.data?.items ?? [])
      .filter(
        (problem) =>
          problem.kind === 'WRONG_ANSWER' && problem.wrongAnswerId !== null
      )
      .map((problem) => problem.wrongAnswerId)
  );
  const todayWrongAnswer = wrongAnswersQuery.data?.items.find(
    (item) =>
      todayWrongAnswerIds.has(item.id) &&
      item.status === 'ACTIVE' &&
      item.reviewCount < 5
  );

  return (
    <div className="bg-system-background min-h-screen">
      <main className="p-section-gap-mobile tablet:p-section-gap w-full">
        <Button
          asChild
          size="xsmall"
          variant="outlined"
        >
          <Link href={PRIVATE.DASHBOARD.STUDENT}>
            <ArrowLeft
              className="size-4"
              aria-hidden
            />
            대시보드
          </Link>
        </Button>

        <header className="mt-section-gap">
          <h1 className="font-headline1-heading text-gray-12">오답 회독</h1>
          <p className="font-body2-normal text-gray-8 mt-inline-gap">
            오늘 1문제 회독. 5회독 도장, 하루 1회독.
          </p>
        </header>

        <div className="mt-section-gap">
          {isPending && <ReviewLoading />}

          {isError && (
            <section
              className="border-gray-3 bg-gray-white rounded-card px-empty-pad-x py-empty-pad-y flex flex-col items-center border text-center"
              data-testid="wrong-answer-list-error"
            >
              <RefreshCw
                className="text-gray-6 size-8"
                aria-hidden
              />
              <h2 className="font-body1-heading text-gray-12 mt-content-gap">
                오늘 회독할 문제를 불러오지 못했어요
              </h2>
              <Button
                size="small"
                variant="outlined"
                className="mt-section-gap"
                onClick={() => {
                  void dailyProblemsQuery.refetch();
                  void wrongAnswersQuery.refetch();
                }}
              >
                다시 불러오기
              </Button>
            </section>
          )}

          {!isPending &&
            !isError &&
            (todayWrongAnswer ? (
              <TodayReview item={todayWrongAnswer} />
            ) : (
              <EmptyReview />
            ))}
        </div>
      </main>
    </div>
  );
};
