'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { ExamAnalysisCard } from '@/features/exam/components/exam-analysis-card';
import { useSubmitExamAttempt } from '@/features/exam/hooks/use-exam-mutation';
import {
  useExamAnalysisQuery,
  useExamAttemptQuery,
} from '@/features/exam/hooks/use-exam-query';
import { ExamTakeLayout } from '@/layout';
import { Button } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyExamError } from '@/shared/lib/errors/errors';
import { getApiError } from '@/shared/lib/get-api-error';

type ExamAttemptClientProps = { attemptId: number };

export const ExamAttemptClient = ({ attemptId }: ExamAttemptClientProps) => {
  const attempt = useExamAttemptQuery(attemptId);
  const analyzed = attempt.data?.status === 'ANALYZED';
  const analysis = useExamAnalysisQuery(attemptId, { enabled: analyzed });
  const submit = useSubmitExamAttempt(attemptId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [folded, setFolded] = useState(false);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [startedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(analyzed);

  useEffect(() => {
    const timer = window.setInterval(
      () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (analyzed && analysis.data) setShowAnalysis(true);
  }, [analyzed, analysis.data]);

  const sheet = attempt.data;
  const attemptError = getApiError(attempt.error);
  const submittedAnalysis = submit.data;
  const result = submittedAnalysis ?? analysis.data;
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers]
  );

  if (attempt.isPending) {
    return (
      <p className="text-gray-8 py-20 text-center text-sm">
        시험지를 불러오는 중입니다
      </p>
    );
  }
  if (!sheet) {
    if (attemptError?.code === 'EXAM_ATTEMPT_EXPIRED') {
      return (
        <section
          className="border-gray-3 rounded-card mx-auto my-20 max-w-md border bg-white p-8 text-center"
          data-testid="exam-attempt-expired"
        >
          <h1 className="text-gray-12 text-heading-wrap text-lg font-extrabold">
            응시 기간이 끝난 시험이에요
          </h1>
          <p className="text-gray-8 text-break-safe mt-2 text-sm leading-6">
            시험지는 더 이상 열 수 없습니다. 응시장에서 다른 시험을
            확인해주세요.
          </p>
          <Button
            asChild
            className="mt-5"
          >
            <Link href={PRIVATE.DASHBOARD.EXAM_HALL}>시험 목록으로</Link>
          </Button>
        </section>
      );
    }
    return (
      <p className="text-red-10 py-20 text-center text-sm">
        시험을 불러오지 못했습니다.
      </p>
    );
  }
  if (result && showAnalysis) {
    return <ExamAnalysisCard analysis={result} />;
  }
  if (submittedAnalysis) {
    const correct = Math.round(
      (submittedAnalysis.rawScore / 100) * sheet.totalQuestions
    );
    return (
      <div
        className="space-y-4"
        data-testid="exam-submit-result"
      >
        <div className="text-gray-8 text-xs">
          내 학습 › 응시장 › <b>{sheet.title} 채점 결과</b>
        </div>
        <section className="border-gray-3 rounded-card grid min-w-0 overflow-hidden border bg-white md:grid-cols-2">
          <div className="p-6">
            <p className="text-gray-8 text-xs font-bold">맞은 개수</p>
            <p className="text-orange-7 numeric-tabular mt-2 text-5xl font-black">
              {correct}
              <em className="text-gray-8 ml-1 text-lg font-bold not-italic">
                / {sheet.totalQuestions}
              </em>
            </p>
            <p className="text-gray-8 mt-3 text-xs">
              방금 제출 · 걸린 시간{' '}
              {Math.max(1, Math.round(elapsedSeconds / 60))}분
            </p>
          </div>
          <div className="border-gray-3 border-t p-6 md:border-t-0 md:border-l">
            <p className="text-gray-8 text-xs font-bold">방금 채점했습니다</p>
            <p className="text-gray-10 text-break-safe mt-2 text-xs leading-6">
              선생님이 낸 문항에는 정답이 이미 붙어 있어 제출하자마자
              채점됩니다.
              <br />
              틀린 <b>{sheet.totalQuestions - correct}문항</b>은 오답 회독에
              담겼습니다.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="small"
                onClick={() => setShowAnalysis(true)}
              >
                시험 분석 보기
              </Button>
              <Button
                asChild
                size="small"
                variant="outlined"
              >
                <Link href={PRIVATE.DASHBOARD.WRONG_ANSWERS}>
                  틀린 문항부터 다시 보기
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="border-gray-3 rounded-card p-card-pad border bg-white">
          <h2 className="text-sm font-extrabold">문항별 정오</h2>
          <p className="text-gray-8 mt-1 text-xs">
            번호를 누르면 그 문항과 내 손풀이가 열립니다
          </p>
          <div className="mt-4 grid grid-cols-10 gap-2">
            {submittedAnalysis.answerResults.map((answer) => (
              <span
                key={answer.questionNo}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-md border text-xs font-bold',
                  answer.correct
                    ? 'border-system-success bg-system-success-alt text-system-success'
                    : 'border-red-3 bg-red-1 text-red-10'
                )}
              >
                {answer.questionNo}
              </span>
            ))}
          </div>
        </section>
        <section className="border-gray-3 rounded-card p-card-pad border bg-white">
          <h2 className="text-sm font-extrabold">다음은</h2>
          <div className="divide-gray-2 mt-3 divide-y text-xs">
            <p className="flex justify-between py-3">
              <b>시험 분석</b>
              <span className="text-gray-8">
                백분위와 예상 등급을 확인합니다
              </span>
            </p>
            <p className="flex justify-between py-3">
              <b>선생님</b>
              <span className="text-gray-8">
                제출 사실이 스터디룸 학습 관리에 바로 뜹니다
              </span>
            </p>
            <p className="flex justify-between py-3">
              <b>단권화 노트</b>
              <span className="text-gray-8">
                틀린 단원이 숙련도에 반영됩니다
              </span>
            </p>
          </div>
        </section>
        <p className="bg-orange-1 text-orange-11 text-break-safe rounded-button p-card-pad text-xs leading-6">
          채점은 <b>정답표 기준</b>이라 AI 코치가 끼지 않습니다. 왜 틀렸는지 한
          문제씩 파고드는 것은 오답 회독에서 오픈챌린지 풀이 화면으로 넘어가
          합니다.
        </p>
      </div>
    );
  }

  const currentQuestion = sheet.questions[currentIndex]!;
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');

  const handleSubmit = () => {
    setFormError(null);
    if (answeredCount !== sheet.totalQuestions) {
      setFormError(
        `남은 문항 ${sheet.totalQuestions - answeredCount}개에 답해주세요.`
      );
      return;
    }
    submit.mutate(
      {
        answers: sheet.questions.map((question) => ({
          questionNo: question.questionNo,
          selectedAnswer: answers[question.questionNo]!,
          timeSpentSec: Math.max(
            1,
            Math.floor(elapsedSeconds / sheet.totalQuestions)
          ),
        })),
      },
      {
        onError: (error) =>
          handleApiError(error, classifyExamError, {
            onField: setFormError,
            onContext: () =>
              setFormError(
                '시험 상태가 바뀌었습니다. 응시장을 다시 열어주세요.'
              ),
            onAuth: () => setFormError('응시 권한을 확인해주세요.'),
          }),
      }
    );
  };

  return (
    <div data-testid="exam-take-screen">
      <header className="border-gray-3 rounded-card mb-section-gap p-card-pad flex min-w-0 flex-wrap items-end justify-between gap-3 border bg-white">
        <div>
          <h1 className="font-headline3-heading text-heading-wrap">
            {sheet.title} · {sheet.totalQuestions}문항
          </h1>
          <p className="text-gray-8 mt-1 text-xs">
            선생님 배정 · 시간을 재고 시험지를 통째로 풉니다
          </p>
        </div>
        <div className="text-right">
          <span className="text-gray-8 block text-xs font-bold">지난 시간</span>
          <span className="text-gray-12 numeric-tabular text-2xl font-black">
            {minutes}:{seconds}
          </span>
        </div>
      </header>

      <ExamTakeLayout folded={folded}>
        <aside className="border-gray-3 rounded-card h-fit min-w-0 border bg-white p-3">
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            className="border-gray-3 rounded-button min-h-control-sm mb-3 w-full cursor-pointer border px-2 text-xs font-bold"
            onClick={() => setFolded((value) => !value)}
            data-testid="exam-palette-toggle"
          >
            {folded ? '›' : '‹ 문항 접기'}
          </UnstyledButton>
          <div
            className={cn(
              'grid gap-1.5',
              folded ? 'grid-cols-1' : 'grid-cols-5'
            )}
          >
            {sheet.questions.map((question, index) => (
              <UnstyledButton
                variant="unstyled"
                size="none"
                key={question.questionNo}
                type="button"
                className={cn(
                  'relative aspect-square cursor-pointer rounded-md border text-xs font-bold',
                  index === currentIndex
                    ? 'border-orange-7 bg-orange-7 text-white'
                    : answers[question.questionNo]
                      ? 'border-orange-4 bg-orange-1 text-orange-11'
                      : 'border-gray-3 text-gray-10 bg-white'
                )}
                onClick={() => setCurrentIndex(index)}
              >
                {question.questionNo}
                {marked.has(question.questionNo) && (
                  <i className="bg-system-warning absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full" />
                )}
              </UnstyledButton>
            ))}
          </div>
          {!folded && (
            <>
              <div className="bg-gray-2 rounded-pill mt-3 h-2 overflow-hidden">
                <i
                  className="bg-orange-7 block h-full"
                  style={{
                    width: `${(answeredCount / sheet.totalQuestions) * 100}%`,
                  }}
                />
              </div>
              <p className="text-gray-8 mt-2 text-center text-xs">
                푼 문항 {answeredCount} / {sheet.totalQuestions}
              </p>
              <Button
                className="mt-3 w-full"
                size="small"
                disabled={submit.isPending}
                onClick={handleSubmit}
              >
                답안 제출하기
              </Button>
            </>
          )}
        </aside>

        <main>
          <section className="border-gray-3 rounded-card p-card-pad min-w-0 border bg-white">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-extrabold">
                {currentQuestion.questionNo}번
              </h2>
              <span className="text-gray-8 text-xs">
                {sheet.examType === 'SCHOOL'
                  ? '선생님이 올린 시험지 · 주관식'
                  : '문제은행 시험 · 객관식'}
              </span>
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                className="border-gray-4 rounded-button min-h-control-sm ml-auto cursor-pointer border px-3 text-xs font-bold"
                onClick={() =>
                  setMarked((current) => {
                    const next = new Set(current);
                    if (next.has(currentQuestion.questionNo)) {
                      next.delete(currentQuestion.questionNo);
                    } else {
                      next.add(currentQuestion.questionNo);
                    }
                    return next;
                  })
                }
              >
                나중에 볼 문항으로 표시
              </UnstyledButton>
            </div>
            <div
              className={cn(
                'text-gray-12 mt-4 min-h-44 rounded-lg border p-5 text-sm leading-8',
                sheet.examType === 'SCHOOL'
                  ? 'border-gray-4 bg-gray-1'
                  : 'border-gray-3 bg-white'
              )}
            >
              <span className="text-gray-8 text-ui-choice">
                {sheet.examType === 'SCHOOL' ? '올린 시험지' : '문제'}
              </span>
              <p className="mt-3">{currentQuestion.prompt}</p>
            </div>
            <div
              className="border-gray-3 bg-gray-1 rounded-button min-h-answer-box-min mt-section-gap p-card-pad border"
              data-testid="exam-answer-box"
            >
              {sheet.examType === 'SCHOOL' ? (
                <input
                  className="border-gray-4 rounded-button h-12 w-full border bg-white px-4 text-center text-lg font-bold"
                  aria-label={`${currentQuestion.questionNo}번 주관식 답`}
                  value={answers[currentQuestion.questionNo] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [currentQuestion.questionNo]: event.target.value,
                    }))
                  }
                />
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '3', '4', '5'].map((choice) => (
                    <UnstyledButton
                      variant="unstyled"
                      size="none"
                      key={choice}
                      type="button"
                      className={cn(
                        'h-12 cursor-pointer rounded-md border text-sm font-extrabold',
                        answers[currentQuestion.questionNo] === choice
                          ? 'border-orange-7 bg-orange-7 text-white'
                          : 'border-gray-4 text-gray-10 bg-white'
                      )}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [currentQuestion.questionNo]:
                            current[currentQuestion.questionNo] === choice
                              ? ''
                              : choice,
                        }))
                      }
                    >
                      {choice}
                    </UnstyledButton>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-8 mt-2 text-xs leading-5">
              답을 넣는 상자는 객관식과 주관식이 <b>같은 자리, 같은 크기</b>
              입니다.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                size="xsmall"
                variant="outlined"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((value) => value - 1)}
              >
                ‹ 이전 문항
              </Button>
              <Button
                size="xsmall"
                disabled={currentIndex === sheet.questions.length - 1}
                onClick={() => setCurrentIndex((value) => value + 1)}
              >
                다음 문항 ›
              </Button>
              <span className="text-gray-8 numeric-tabular ml-auto text-xs font-bold">
                {currentQuestion.questionNo} / {sheet.totalQuestions} 문항
              </span>
            </div>
          </section>
          <section className="border-gray-3 rounded-card p-card-pad mt-section-gap border bg-white">
            <h2 className="text-sm font-extrabold">손풀이</h2>
            <p className="text-gray-8 mt-1 text-xs">
              여기 쓴 것은 제출 뒤 분석에 같이 저장됩니다
            </p>
            <div className="border-gray-4 bg-gray-1 text-gray-7 rounded-button p-card-pad mt-section-gap min-h-44 border border-dashed text-xs">
              손풀이 영역
            </div>
          </section>
          {formError && (
            <p
              className="border-red-3 bg-red-1 text-red-10 rounded-button p-card-pad mt-section-gap border text-xs font-bold"
              role="alert"
            >
              {formError}
            </p>
          )}
          <p className="text-gray-8 mt-section-gap text-center text-xs leading-5">
            왼쪽 레일을 {folded ? <b>접은 상태</b> : <b>편 상태</b>}입니다.{' '}
            {folded
              ? '문제 영역이 192px 넓어집니다.'
              : '시험지 전체가 몇 문항이고 어디까지 왔는지가 항상 보입니다.'}
          </p>
        </main>
      </ExamTakeLayout>
    </div>
  );
};
