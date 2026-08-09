'use client';

import { useState } from 'react';

import Image, { type ImageLoaderProps } from 'next/image';
import Link from 'next/link';

import type {
  WrongAnswerItem,
  WrongAnswerReviewResult,
} from '@/entities/wrong-answer';
import { Skeleton } from '@/shared/components/loading';
import { Button, Checkbox } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';
import { getApiError } from '@/shared/lib/get-api-error';
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock3,
  Lightbulb,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import { useReviewWrongAnswer } from '../../hooks/use-review-wrong-answer';
import {
  useAskTeacherOnWrongAnswer,
  useWrongAnswersQuery,
} from '../../hooks/use-wrong-answer-query';
import { ReviewStamps } from './review-stamps';

/**
 * 승인 디자인 v22 `sReviewOk` 3219 `질문 남기기`.
 * 선생님 코멘트가 마음에 걸리면 학생이 되받아친다. 되물으면 선생님 처리 목록에 다시 올라간다.
 */
const TeacherCommentQuestion = ({
  wrongAnswer,
}: {
  wrongAnswer: WrongAnswerItem;
}) => {
  const [isWriting, setIsWriting] = useState(false);
  const [question, setQuestion] = useState('');
  const askTeacher = useAskTeacherOnWrongAnswer();

  if (wrongAnswer.studentQuestion && !isWriting) {
    return (
      <div
        className="border-orange-3 bg-gray-white mt-3 rounded-lg border p-3"
        data-testid="wrong-answer-student-question"
      >
        <p className="font-caption-normal text-gray-8">선생님께 남긴 질문</p>
        <p className="font-body2-normal text-gray-12 mt-1 whitespace-pre-wrap">
          {wrongAnswer.studentQuestion}
        </p>
        <Button
          size="xsmall"
          variant="outlined"
          className="mt-2"
          onClick={() => {
            setQuestion(wrongAnswer.studentQuestion ?? '');
            setIsWriting(true);
          }}
        >
          질문 고치기
        </Button>
      </div>
    );
  }

  if (!isWriting) {
    return (
      <Button
        size="xsmall"
        variant="outlined"
        className="mt-3"
        onClick={() => setIsWriting(true)}
        data-testid="wrong-answer-ask-teacher"
      >
        질문 남기기
      </Button>
    );
  }

  return (
    <form
      className="mt-3 flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = question.trim();
        if (!trimmed) return;
        askTeacher.mutate(
          { id: wrongAnswer.id, question: trimmed },
          {
            onSuccess: () => {
              setIsWriting(false);
              setQuestion('');
            },
          }
        );
      }}
    >
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={500}
        rows={3}
        autoFocus
        aria-label="선생님께 남길 질문"
        placeholder="어디가 이해되지 않는지 그대로 적어도 됩니다"
        className="border-gray-3 w-full rounded-lg border p-3 text-sm"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="xsmall"
          disabled={askTeacher.isPending || question.trim().length === 0}
        >
          보내기
        </Button>
        <Button
          type="button"
          size="xsmall"
          variant="outlined"
          onClick={() => {
            setIsWriting(false);
            setQuestion('');
          }}
        >
          취소
        </Button>
      </div>
    </form>
  );
};

type WrongAnswerReviewProps = {
  wrongAnswerId: number;
};

type ReviewFormProps = {
  wrongAnswer: WrongAnswerItem;
};

type ReviewResultProps = {
  isCorrect: boolean;
  usedHint: boolean;
  usedAi: boolean;
  result: WrongAnswerReviewResult;
};

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

const formatNextReview = (dateTime: string | null) => {
  if (!dateTime) return '5회독을 모두 채웠어요.';

  return `${new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateTime))}에 다시 만나요.`;
};

const formatTeacherCommentedAt = (dateTime: string | null) => {
  if (!dateTime) return null;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime));
};

const isReviewDue = (dateTime: string | null) =>
  !dateTime || new Date(dateTime).getTime() <= Date.now();

const ReviewResult = ({
  isCorrect,
  usedHint,
  usedAi,
  result,
}: ReviewResultProps) => (
  <section
    className="border-gray-3 bg-gray-white tablet:p-8 rounded-xl border p-6"
    data-testid="wrong-answer-review-result"
  >
    <div
      className={`rounded-xl border p-5 ${
        isCorrect
          ? 'border-green-200 bg-green-50'
          : 'border-system-warning bg-system-warning-alt'
      }`}
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <CheckCircle2
            size={24}
            className="text-green-700"
            aria-hidden
          />
        ) : (
          <XCircle
            size={24}
            className="text-system-warning"
            aria-hidden
          />
        )}
        <h1
          className={`font-headline2-heading ${
            isCorrect ? 'text-green-800' : 'text-gray-12'
          }`}
        >
          {isCorrect ? '정답으로 기록했어요' : '오답으로 기록했어요'}
        </h1>
      </div>
      <p className="font-body2-normal text-gray-10 mt-2 leading-relaxed">
        맞고 틀림과 관계없이 오늘 회독 1회가 인정됐어요.
      </p>
      <ReviewStamps
        filled={result.stampsFilled}
        total={result.stampsTotal}
        className="mt-4"
      />
    </div>

    <div className="tablet:grid-cols-2 mt-4 grid gap-3">
      <div className="border-gray-3 rounded-lg border p-4">
        <p className="font-caption-heading text-gray-8">이번 풀이</p>
        <p className="font-body1-heading text-gray-12 mt-1">
          {!usedHint && !usedAi ? '힌트 없이 해결' : '도움 받고 해결'}
        </p>
      </div>
      <div className="border-gray-3 rounded-lg border p-4">
        <p className="font-caption-heading text-gray-8">힌트 없이 푼 누적</p>
        <p className="font-body1-heading text-gray-12 mt-1 tabular-nums">
          {result.hintFreeSolveCount}회
        </p>
      </div>
    </div>

    <p className="font-body2-normal text-gray-9 mt-5">
      {result.graduated
        ? '5회독 졸업. 오답 목록과 오늘의 문제에서 빠집니다.'
        : formatNextReview(result.nextReviewAt)}
    </p>

    <div className="mt-6 flex flex-wrap gap-2">
      <Button
        asChild
        size="small"
      >
        <Link href={PRIVATE.DASHBOARD.WRONG_ANSWERS}>오답 목록으로</Link>
      </Button>
      <Button
        asChild
        size="small"
        variant="outlined"
      >
        <Link href={PRIVATE.DASHBOARD.STUDENT}>대시보드로</Link>
      </Button>
    </div>
  </section>
);

const ReviewForm = ({ wrongAnswer }: ReviewFormProps) => {
  const [solveOpen, setSolveOpen] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [usedAi, setUsedAi] = useState(false);
  const [submittedVerdict, setSubmittedVerdict] = useState<boolean | null>(
    null
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const reviewMutation = useReviewWrongAnswer(wrongAnswer.id);
  const reviewDue = isReviewDue(wrongAnswer.nextReviewAt);

  const submitReview = (isCorrect: boolean) => {
    setSubmissionError(null);
    reviewMutation.mutate(
      { isCorrect, usedHint, usedAi },
      {
        onSuccess: () => setSubmittedVerdict(isCorrect),
        onError: (error) =>
          setSubmissionError(
            getApiError(error)?.message ??
              '회독 기록에 실패했어요. 잠시 후 다시 시도해주세요.'
          ),
      }
    );
  };

  if (reviewMutation.data && submittedVerdict !== null) {
    return (
      <ReviewResult
        isCorrect={submittedVerdict}
        usedHint={usedHint}
        usedAi={usedAi}
        result={reviewMutation.data}
      />
    );
  }

  return (
    <section className="border-gray-3 bg-gray-white tablet:p-8 rounded-xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-caption-heading text-orange-9">
            {wrongAnswer.reviewCount + 1}회독
          </p>
          <h1 className="font-headline2-heading text-gray-12 mt-1">
            {wrongAnswer.title ?? '오답 다시 풀기'}
          </h1>
        </div>
        <ReviewStamps
          filled={wrongAnswer.reviewCount}
          total={5}
        />
      </div>

      {wrongAnswer.questionImageUrl && (
        <div className="border-gray-3 bg-system-background relative mt-5 aspect-[4/3] overflow-hidden rounded-lg border">
          <Image
            loader={passthroughImageLoader}
            unoptimized
            fill
            sizes="(max-width: 768px) 100vw, 820px"
            src={wrongAnswer.questionImageUrl}
            alt="다시 풀 오답 문제"
            className="object-contain"
          />
        </div>
      )}

      {wrongAnswer.questionText && (
        <div className="border-gray-3 bg-system-background mt-5 rounded-lg border p-5">
          <p className="font-body1-normal text-gray-12 leading-loose whitespace-pre-wrap">
            {wrongAnswer.questionText}
          </p>
        </div>
      )}

      {!wrongAnswer.questionImageUrl && !wrongAnswer.questionText && (
        <div className="border-gray-3 bg-gray-1 mt-5 rounded-lg border px-5 py-10 text-center">
          <AlertCircle
            size={28}
            className="text-gray-6 mx-auto"
            aria-hidden
          />
          <p className="font-body2-heading text-gray-10 mt-2">
            저장된 문제 본문이 없어요
          </p>
        </div>
      )}

      {wrongAnswer.teacherComment && (
        <section
          className="border-orange-3 bg-orange-1 mt-5 rounded-xl border p-5"
          data-testid="wrong-answer-teacher-comment"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-body1-heading text-gray-12">선생님 코멘트</h2>
            {wrongAnswer.commentedAt && (
              <time
                className="font-caption-normal text-gray-8"
                dateTime={wrongAnswer.commentedAt}
              >
                {formatTeacherCommentedAt(wrongAnswer.commentedAt)}
              </time>
            )}
          </div>
          <p className="font-body2-normal text-gray-12 mt-3 leading-relaxed whitespace-pre-wrap">
            {wrongAnswer.teacherComment}
          </p>
          {/* 승인 디자인 v22 `sReviewOk` 3219 `질문 남기기` */}
          <TeacherCommentQuestion wrongAnswer={wrongAnswer} />
        </section>
      )}

      <section className="border-gray-3 mt-5 rounded-xl border p-5">
        <h2 className="font-body1-heading text-gray-12">내 풀이</h2>
        <p className="font-caption-normal text-gray-8 mt-1">
          이전 풀이를 확인한 뒤 오늘 회독 풀이를 시작합니다.
        </p>
        <div className="border-gray-3 bg-gray-1 text-gray-8 mt-3 rounded-lg border p-4 text-xs leading-6">
          문제 본문과 지난 풀이를 다시 보고, 맞고 틀림과 관계없이 오늘 회독
          1회를 남깁니다.
        </div>
        {!solveOpen && (
          <Button
            className="mt-3 w-full"
            onClick={() => setSolveOpen(true)}
            data-testid="wrong-answer-open-solver"
          >
            {wrongAnswer.reviewCount + 1}회독 풀이 쓰기
          </Button>
        )}
      </section>

      {solveOpen && (
        <>
          <div className="mt-6">
            <h2 className="font-body1-heading text-gray-12">도움 사용 기록</h2>
            <p className="font-caption-normal text-gray-8 mt-1">
              도움을 받아도 회독은 똑같이 인정돼요. 기록은 약점 진단에만
              쓰입니다.
            </p>
            <Checkbox.Group className="tablet:grid-cols-2 mt-3 grid gap-2">
              <Checkbox.Label className="border-gray-3 rounded-lg border p-3.5">
                <Checkbox
                  checked={usedHint}
                  onCheckedChange={(checked) => setUsedHint(checked === true)}
                  data-testid="wrong-answer-used-hint"
                />
                <Lightbulb
                  size={18}
                  className="text-orange-7"
                  aria-hidden
                />
                <span className="font-body2-heading text-gray-11">
                  힌트 사용
                </span>
              </Checkbox.Label>
              <Checkbox.Label className="border-gray-3 rounded-lg border p-3.5">
                <Checkbox
                  checked={usedAi}
                  onCheckedChange={(checked) => setUsedAi(checked === true)}
                  data-testid="wrong-answer-used-ai"
                />
                <Bot
                  size={18}
                  className="text-orange-7"
                  aria-hidden
                />
                <span className="font-body2-heading text-gray-11">
                  AI 도움 사용
                </span>
              </Checkbox.Label>
            </Checkbox.Group>
          </div>

          {!reviewDue && (
            <div className="border-orange-3 bg-orange-1 mt-5 flex gap-2 rounded-lg border p-4">
              <Clock3
                size={18}
                className="text-orange-9 mt-0.5"
                aria-hidden
              />
              <p className="font-body2-normal text-orange-10">
                복습 간격이 아직 남았어요.{' '}
                {formatNextReview(wrongAnswer.nextReviewAt)}
              </p>
            </div>
          )}

          {submissionError && (
            <div
              className="border-system-warning bg-system-warning-alt mt-5 rounded-lg border px-4 py-3"
              role="alert"
              data-testid="wrong-answer-review-error"
            >
              <p className="font-body2-heading text-gray-12">
                {submissionError}
              </p>
            </div>
          )}

          <div className="tablet:grid-cols-2 mt-6 grid gap-2">
            <Button
              size="medium"
              variant="secondary"
              disabled={!reviewDue || reviewMutation.isPending}
              onClick={() => submitReview(false)}
              data-testid="wrong-answer-submit-incorrect"
            >
              <XCircle
                size={18}
                aria-hidden
              />
              틀렸어요
            </Button>
            <Button
              size="medium"
              disabled={!reviewDue || reviewMutation.isPending}
              onClick={() => submitReview(true)}
              data-testid="wrong-answer-submit-correct"
            >
              <CheckCircle2
                size={18}
                aria-hidden
              />
              맞았어요
            </Button>
          </div>
        </>
      )}
    </section>
  );
};

export const WrongAnswerReview = ({
  wrongAnswerId,
}: WrongAnswerReviewProps) => {
  const wrongAnswersQuery = useWrongAnswersQuery();

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <main className="w-full p-4">
        <Button
          asChild
          size="xsmall"
          variant="outlined"
        >
          <Link href={PRIVATE.DASHBOARD.WRONG_ANSWERS}>
            <ArrowLeft
              size={16}
              aria-hidden
            />
            오답 목록
          </Link>
        </Button>

        <div className="mt-6">
          {wrongAnswersQuery.isPending && (
            <div className="border-gray-3 bg-gray-white rounded-xl border p-6">
              <Skeleton.Block className="h-8 w-48" />
              <Skeleton.Block className="mt-5 h-64 w-full" />
              <Skeleton.Block className="mt-5 h-24 w-full" />
            </div>
          )}

          {wrongAnswersQuery.isError && (
            <section
              className="border-gray-3 bg-gray-white flex flex-col items-center rounded-xl border px-6 py-14 text-center"
              data-testid="wrong-answer-review-load-error"
            >
              <RefreshCw
                size={32}
                className="text-gray-6"
                aria-hidden
              />
              <h1 className="font-body1-heading text-gray-12 mt-3">
                문제를 불러오지 못했어요
              </h1>
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
              const wrongAnswer = wrongAnswersQuery.data.items.find(
                (item) => item.id === wrongAnswerId
              );

              if (!wrongAnswer || wrongAnswer.status === 'GRADUATED') {
                return (
                  <section className="border-gray-3 bg-gray-white flex flex-col items-center rounded-xl border px-6 py-14 text-center">
                    <AlertCircle
                      size={34}
                      className="text-gray-6"
                      aria-hidden
                    />
                    <h1 className="font-body1-heading text-gray-12 mt-3">
                      회독할 수 없는 문제예요
                    </h1>
                    <p className="font-body2-normal text-gray-8 mt-1">
                      이미 졸업했거나 오답 목록에서 사라졌어요.
                    </p>
                  </section>
                );
              }

              return <ReviewForm wrongAnswer={wrongAnswer} />;
            })()}
        </div>
      </main>
    </div>
  );
};
