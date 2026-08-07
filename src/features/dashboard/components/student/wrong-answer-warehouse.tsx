'use client';

import Link from 'next/link';

import type { WrongAnswerItem } from '@/entities/wrong-answer';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';
import {
  Archive,
  ArrowLeft,
  CalendarClock,
  Inbox,
  RefreshCw,
} from 'lucide-react';

import { useWrongAnswersQuery } from '../../hooks/use-wrong-answer-query';
import { ReviewStamps } from './review-stamps';

const SOURCE_LABEL: Record<WrongAnswerItem['sourceType'], string> = {
  EXAM: '시험 오답',
  TEACHER: '선생님 출제',
  SELF_REVIEW: '내 복습',
};

const formatReviewDate = (dateTime: string | null) => {
  if (!dateTime) return null;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(dateTime));
};

const isReviewDue = (dateTime: string | null) =>
  !dateTime || new Date(dateTime).getTime() <= Date.now();

const WarehouseLoading = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 3 }, (_, index) => (
      <Skeleton.Block
        key={index}
        className="h-40 w-full"
      />
    ))}
  </div>
);

const WrongAnswerCard = ({ item }: { item: WrongAnswerItem }) => {
  const reviewDue = isReviewDue(item.nextReviewAt);
  const nextReviewDate = formatReviewDate(item.nextReviewAt);

  return (
    <article
      className="border-gray-3 bg-gray-white rounded-xl border p-5"
      data-testid={`wrong-answer-card-${item.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-caption-heading bg-orange-2 text-orange-10 rounded-full px-2.5 py-1">
              {SOURCE_LABEL[item.sourceType]}
            </span>
            {item.nationalWrongRate !== null && (
              <span className="font-caption-heading text-gray-8 tabular-nums">
                전국 오답률 {item.nationalWrongRate}%
              </span>
            )}
          </div>
          <h2 className="font-body1-heading text-gray-12 mt-3">
            {item.title ?? '제목 없는 오답'}
          </h2>
          <p className="font-body2-normal text-gray-9 mt-2 line-clamp-2 leading-relaxed">
            {item.questionText ?? '저장된 문제 이미지에서 내용을 확인해주세요.'}
          </p>
        </div>
        <ReviewStamps
          filled={item.reviewCount}
          total={5}
          className="shrink-0"
        />
      </div>

      <div className="border-gray-2 mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="font-caption-normal text-gray-8 flex items-center gap-1.5">
          <CalendarClock
            size={15}
            aria-hidden
          />
          {reviewDue
            ? '지금 회독할 수 있어요'
            : `다음 회독 ${nextReviewDate ?? '예정'}`}
        </div>
        {reviewDue ? (
          <Button
            asChild
            size="xsmall"
          >
            <Link
              href={PRIVATE.DASHBOARD.WRONG_ANSWER_REVIEW(item.id)}
              data-testid={`wrong-answer-review-${item.id}`}
            >
              다시 풀기
            </Link>
          </Button>
        ) : (
          <span className="border-gray-4 bg-gray-1 text-gray-7 rounded-lg border px-3 py-2 text-xs font-bold">
            복습 간격 대기 중
          </span>
        )}
      </div>
    </article>
  );
};

export const WrongAnswerWarehouse = () => {
  const wrongAnswersQuery = useWrongAnswersQuery();

  return (
    <main className="bg-system-background tablet:px-10 tablet:py-12 min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-[960px]">
        <Button
          asChild
          size="xsmall"
          variant="outlined"
        >
          <Link href={PRIVATE.DASHBOARD.STUDENT}>
            <ArrowLeft
              size={16}
              aria-hidden
            />
            대시보드
          </Link>
        </Button>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Archive
                size={26}
                className="text-orange-7"
                aria-hidden
              />
              <h1 className="font-headline1-heading text-gray-12">오답 목록</h1>
            </div>
            <p className="font-body2-normal text-gray-8 mt-2">
              틀린 문제는 상한 없이 쌓이고, 5회독을 채우면 이 목록에서 빠져요.
            </p>
          </div>
        </div>

        <div className="mt-6">
          {wrongAnswersQuery.isPending && <WarehouseLoading />}

          {wrongAnswersQuery.isError && (
            <section
              className="border-gray-3 bg-gray-white flex flex-col items-center rounded-xl border px-6 py-14 text-center"
              data-testid="wrong-answer-list-error"
            >
              <RefreshCw
                size={32}
                className="text-gray-6"
                aria-hidden
              />
              <h2 className="font-body1-heading text-gray-12 mt-3">
                오답 목록을 불러오지 못했어요
              </h2>
              <Button
                size="small"
                variant="outlined"
                className="mt-5"
                onClick={() => void wrongAnswersQuery.refetch()}
              >
                다시 불러오기
              </Button>
            </section>
          )}

          {wrongAnswersQuery.isSuccess &&
            (() => {
              const activeWrongAnswers = wrongAnswersQuery.data.items.filter(
                (item) => item.status === 'ACTIVE' && item.reviewCount < 5
              );

              if (activeWrongAnswers.length === 0) {
                return (
                  <section
                    className="border-gray-3 bg-gray-white flex flex-col items-center rounded-xl border px-6 py-14 text-center"
                    data-testid="wrong-answer-list-empty"
                  >
                    <Inbox
                      size={38}
                      className="text-gray-6"
                      aria-hidden
                    />
                    <h2 className="font-body1-heading text-gray-12 mt-3">
                      지금 복습할 오답이 없어요
                    </h2>
                    <p className="font-body2-normal text-gray-8 mt-1">
                      새로 틀린 문제는 자동으로 이 창고에 들어옵니다.
                    </p>
                  </section>
                );
              }

              return (
                <div className="flex flex-col gap-3">
                  <p className="font-caption-heading text-gray-8 tabular-nums">
                    복습 중 {activeWrongAnswers.length}문제
                  </p>
                  {activeWrongAnswers.map((item) => (
                    <WrongAnswerCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              );
            })()}
        </div>
      </div>
    </main>
  );
};
