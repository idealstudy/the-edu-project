'use client';

import Image from 'next/image';
import Link from 'next/link';

import type {
  DailyProblemItem,
  WrongAnswerItem,
} from '@/entities/wrong-answer';
import { useOpenChallengeDetailQuery } from '@/features/open-challenge/hooks/use-open-challenge';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import {
  Archive,
  BookOpenCheck,
  GraduationCap,
  Puzzle,
  RefreshCw,
} from 'lucide-react';

import {
  useDailyProblemsQuery,
  useWrongAnswersQuery,
} from '../../hooks/use-wrong-answer-query';
import { ReviewStamps } from './review-stamps';

type TodayProblemCardProps = {
  item: DailyProblemItem;
  wrongAnswer?: WrongAnswerItem;
};

const DIFFICULTY_LABEL: Record<string, string> = {
  HIGHEST: '1등급 문제',
  HIGH: '2등급 문제',
  MIDDLE: '3등급 문제',
  MID: '3등급 문제',
  LOW: '기초 문제',
};

const getProvider = (provider: DailyProblemItem['provider']) =>
  provider === 'TEACHER'
    ? {
        label: '선생님 출제',
        detail: '선생님이 배정',
        icon: GraduationCap,
        badgeClassName: 'border-orange-3 bg-orange-2 text-orange-10',
      }
    : {
        label: '오픈챌린지 추천',
        detail: '약점·복습 주기 기반 추천',
        icon: Puzzle,
        badgeClassName: 'border-gray-3 bg-gray-white text-gray-8',
      };

const TodayProblemCard = ({ item, wrongAnswer }: TodayProblemCardProps) => {
  const challengeId = item.challengeId?.toString() ?? '';
  const challengeQuery = useOpenChallengeDetailQuery(challengeId, {
    enabled: Boolean(item.challengeId),
  });
  const challenge = challengeQuery.data;
  const provider = getProvider(item.provider);
  const ProviderIcon = provider.icon;
  const title =
    wrongAnswer?.title ?? challenge?.topic ?? `오늘의 문제 ${item.position}`;
  const questionText =
    wrongAnswer?.questionText ??
    challenge?.questionText ??
    '문제 내용을 불러오는 중이에요.';
  const sourceLabel =
    wrongAnswer?.questionSnapshot?.sourceText ??
    wrongAnswer?.questionSnapshot?.source ??
    (challenge
      ? `${challenge.topic} ${challenge.questionNumber}번`
      : undefined);
  const href = item.wrongAnswerId
    ? PRIVATE.DASHBOARD.WRONG_ANSWER_REVIEW(item.wrongAnswerId)
    : item.challengeId
      ? PUBLIC.OPEN_CHALLENGE.DETAIL(item.challengeId)
      : PRIVATE.DASHBOARD.WRONG_ANSWERS;

  return (
    <article
      className="border-gray-3 bg-gray-white tablet:min-w-0 flex min-w-[82%] snap-start flex-col overflow-hidden rounded-xl border"
      data-testid={`daily-problem-card-${item.position}`}
    >
      <div className="flex items-center gap-2 px-4 pt-3.5">
        <span
          className={`font-caption-heading flex items-center gap-1 rounded-full border px-2.5 py-1 ${provider.badgeClassName}`}
        >
          <ProviderIcon
            size={13}
            aria-hidden
          />
          {provider.label}
        </span>
        <span className="font-caption-normal text-gray-8 min-w-0 truncate">
          {provider.detail}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-4">
        {typeof sourceLabel === 'string' && sourceLabel.length > 0 && (
          <span className="font-caption-heading bg-gray-2 text-gray-10 rounded-full px-2.5 py-1">
            {sourceLabel}
          </span>
        )}
        {item.difficulty && (
          <span className="font-caption-heading border-orange-7 text-orange-9 rounded-full border px-2.5 py-1">
            {DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}
          </span>
        )}
      </div>

      <div className="mt-2 flex min-h-6 items-center justify-between gap-2 px-4">
        <span className="font-caption-heading text-gray-8 tabular-nums">
          {item.nationalWrongRate === null
            ? ''
            : `전국 오답률 ${item.nationalWrongRate}%`}
        </span>
        <ReviewStamps
          filled={item.stampsFilled}
          total={item.stampsTotal}
        />
      </div>

      <div className="border-gray-3 bg-system-background -0 mx-4 mt-2.5 rounded-lg border p-3.5">
        <p className="font-caption-heading text-gray-8">
          {wrongAnswer?.questionSnapshot?.unit
            ? String(wrongAnswer.questionSnapshot.unit)
            : title}
        </p>
        {challengeQuery.isPending && !wrongAnswer?.questionText ? (
          <div className="mt-3 flex flex-col gap-2">
            <Skeleton.Block className="h-3 w-full" />
            <Skeleton.Block className="h-3 w-4/5" />
            <Skeleton.Block className="h-3 w-2/3" />
          </div>
        ) : (
          <p className="font-body2-normal text-gray-11 mt-2 line-clamp-4 leading-relaxed">
            {questionText}
          </p>
        )}
      </div>

      <p className="font-caption-heading text-orange-10 mt-3 flex-1 px-4 leading-relaxed">
        <b>왜 이 문제?</b> {item.reason}
      </p>

      <Button
        asChild
        size="small"
        variant={item.provider === 'TEACHER' ? 'primary' : 'secondary'}
        className="mx-4 mt-3 mb-4 w-auto"
      >
        <Link
          href={href}
          data-testid={`daily-problem-start-${item.position}`}
        >
          {item.wrongAnswerId ? '지금 다시 풀기' : '오픈챌린지 풀기'}
        </Link>
      </Button>
    </article>
  );
};

const TodayProblemsLoading = () => (
  <section className="border-gray-3 bg-gray-white rounded-xl border p-6">
    <Skeleton.Block className="h-7 w-44" />
    <div className="tablet:grid tablet:grid-cols-3 mt-4 flex gap-3 overflow-hidden">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton.Block
          key={index}
          className="tablet:min-w-0 -0 min-w-[82%]"
        />
      ))}
    </div>
  </section>
);

export const TodayProblemsSection = () => {
  const dailyProblemsQuery = useDailyProblemsQuery();
  const wrongAnswersQuery = useWrongAnswersQuery();

  if (dailyProblemsQuery.isPending || wrongAnswersQuery.isPending) {
    return <TodayProblemsLoading />;
  }

  if (dailyProblemsQuery.isError) {
    return (
      <section
        className="border-gray-3 bg-gray-white flex flex-col items-center rounded-xl border px-6 py-12 text-center"
        data-testid="daily-problems-error"
      >
        <RefreshCw
          size={30}
          className="text-gray-6"
          aria-hidden
        />
        <h2 className="font-body1-heading text-gray-12 mt-3">
          오늘의 문제를 불러오지 못했어요
        </h2>
        <p className="font-body2-normal text-gray-8 mt-1">
          잠시 후 다시 시도해주세요.
        </p>
        <Button
          size="small"
          variant="outlined"
          className="mt-5"
          onClick={() => {
            void dailyProblemsQuery.refetch();
            void wrongAnswersQuery.refetch();
          }}
        >
          다시 불러오기
        </Button>
      </section>
    );
  }

  const queue = dailyProblemsQuery.data;
  const wrongAnswersById = new Map(
    (wrongAnswersQuery.data?.items ?? []).map((wrongAnswer) => [
      wrongAnswer.id,
      wrongAnswer,
    ])
  );

  if (queue.onboarding || queue.items.length === 0) {
    return (
      <section
        className="border-gray-3 bg-gray-white flex flex-col items-center rounded-xl border px-6 py-10 text-center"
        data-testid="daily-problems-empty"
      >
        <Image
          src="/dashboard/dashboard-character.png"
          width={130}
          height={130}
          alt="문제를 기다리는 디에듀 캐릭터"
        />
        <h2 className="font-headline2-heading text-gray-12 mt-4">
          선생님이 시험을 준비하고 있어요
        </h2>
        <p className="font-body2-normal text-gray-8 mt-2 leading-relaxed">
          오늘의 문제는 시험 오답과 수업에서 만들어져요.
          <br />
          선생님이 첫 시험을 열면 채워집니다.
        </p>
        <Button
          asChild
          size="small"
          variant="outlined"
          className="mt-5"
        >
          <Link href={PRIVATE.DASHBOARD.UNIT_NOTES}>단권화 책 구경</Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      className="border-gray-3 bg-gray-white tablet:p-6 rounded-xl border p-4"
      aria-labelledby="daily-problems-title"
      data-testid="daily-problems-section"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck
              size={22}
              className="text-orange-7"
              aria-hidden
            />
            <h2
              id="daily-problems-title"
              className="font-headline2-heading text-gray-12"
            >
              오늘은 이 3개면 돼요
            </h2>
          </div>
          <p className="font-caption-normal text-gray-8 mt-1">
            선생님 문제 먼저 · 모자라면 오픈챌린지에서 추천 · 도장 = 회독
          </p>
        </div>
        <Button
          asChild
          size="xsmall"
          variant="outlined"
        >
          <Link href={PRIVATE.DASHBOARD.WRONG_ANSWERS}>
            <Archive
              size={16}
              aria-hidden
            />
            오답 목록
          </Link>
        </Button>
      </div>

      <div className="border-orange-3 bg-orange-1 mt-4 flex items-center gap-3 rounded-lg border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-body2-heading text-gray-11">밀린 오답</p>
          <p className="font-caption-normal text-gray-8 mt-0.5">
            못 푼 건 다음 큐로 자동 이월돼요
          </p>
        </div>
        <span className="font-body2-heading text-orange-10 tabular-nums">
          {queue.backlogCount}건
        </span>
      </div>

      <div className="tablet:grid tablet:grid-cols-3 tablet:overflow-visible mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
        {queue.items.map((item) => (
          <TodayProblemCard
            key={item.position}
            item={item}
            wrongAnswer={
              item.wrongAnswerId
                ? wrongAnswersById.get(item.wrongAnswerId)
                : undefined
            }
          />
        ))}
      </div>

      <p className="font-caption-normal text-gray-7 mt-3 leading-relaxed">
        난이도·전국 오답률은 교육청·평가원 기출처럼 공개 데이터가 있는 문제에만
        표시돼요.
      </p>
    </section>
  );
};
