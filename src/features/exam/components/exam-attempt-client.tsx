'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { ExamAnalysisCard } from '@/features/exam/components/exam-analysis-card';
import { useSubmitExamAttempt } from '@/features/exam/hooks/use-exam-mutation';
import {
  useExamAnalysisQuery,
  useExamAttemptQuery,
} from '@/features/exam/hooks/use-exam-query';
import { Button } from '@/shared/components/ui';
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
      <p className="py-20 text-center text-sm text-[#71717a]">
        시험지를 불러오는 중입니다
      </p>
    );
  }
  if (!sheet) {
    if (attemptError?.code === 'EXAM_ATTEMPT_EXPIRED') {
      return (
        <section
          className="mx-auto my-20 max-w-md rounded-xl border border-[#e4e4e7] bg-white p-8 text-center"
          data-testid="exam-attempt-expired"
        >
          <h1 className="text-lg font-extrabold text-[#27272a]">
            응시 기간이 끝난 시험이에요
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#71717a]">
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
      <p className="py-20 text-center text-sm text-[#9f2f26]">
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
        <div className="text-xs text-[#71717a]">
          내 학습 › 응시장 › <b>{sheet.title} 채점 결과</b>
        </div>
        <section className="grid overflow-hidden rounded-xl border border-[#e4e4e7] bg-white md:grid-cols-2">
          <div className="p-6">
            <p className="text-xs font-bold text-[#71717a]">맞은 개수</p>
            <p className="mt-2 text-5xl font-black text-[#ef6c00] tabular-nums">
              {correct}
              <em className="ml-1 text-lg font-bold text-[#71717a] not-italic">
                / {sheet.totalQuestions}
              </em>
            </p>
            <p className="mt-3 text-xs text-[#71717a]">
              방금 제출 · 걸린 시간{' '}
              {Math.max(1, Math.round(elapsedSeconds / 60))}분
            </p>
          </div>
          <div className="border-t border-[#e4e4e7] p-6 md:border-t-0 md:border-l">
            <p className="text-xs font-bold text-[#71717a]">
              방금 채점했습니다
            </p>
            <p className="mt-2 text-xs leading-6 text-[#52525b]">
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
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
          <h2 className="text-sm font-extrabold">문항별 정오</h2>
          <p className="mt-1 text-xs text-[#71717a]">
            번호를 누르면 그 문항과 내 손풀이가 열립니다
          </p>
          <div className="mt-4 grid grid-cols-10 gap-2">
            {submittedAnalysis.answerResults.map((answer) => (
              <span
                key={answer.questionNo}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-md border text-xs font-bold',
                  answer.correct
                    ? 'border-[#b7e3c3] bg-[#effaf1] text-[#237a3d]'
                    : 'border-[#efb5ae] bg-[#fff5f3] text-[#9f2f26]'
                )}
              >
                {answer.questionNo}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
          <h2 className="text-sm font-extrabold">다음은</h2>
          <div className="mt-3 divide-y divide-[#ececef] text-xs">
            <p className="flex justify-between py-3">
              <b>시험 분석</b>
              <span className="text-[#71717a]">
                백분위와 예상 등급을 확인합니다
              </span>
            </p>
            <p className="flex justify-between py-3">
              <b>선생님</b>
              <span className="text-[#71717a]">
                제출 사실이 스터디룸 학습 관리에 바로 뜹니다
              </span>
            </p>
            <p className="flex justify-between py-3">
              <b>단권화 노트</b>
              <span className="text-[#71717a]">
                틀린 단원이 숙련도에 반영됩니다
              </span>
            </p>
          </div>
        </section>
        <p className="rounded-lg bg-[#fff7f0] p-4 text-xs leading-6 text-[#7a4a25]">
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
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#e4e4e7] bg-white p-4">
        <div>
          <h1 className="text-[19px] font-extrabold">
            {sheet.title} · {sheet.totalQuestions}문항
          </h1>
          <p className="mt-1 text-xs text-[#71717a]">
            선생님 배정 · 시간을 재고 시험지를 통째로 풉니다
          </p>
        </div>
        <div className="text-right">
          <span className="block text-[11px] font-bold text-[#71717a]">
            지난 시간
          </span>
          <span className="text-2xl font-black text-[#27272a] tabular-nums">
            {minutes}:{seconds}
          </span>
        </div>
      </header>

      <div
        className={cn(
          'grid gap-4',
          folded
            ? 'grid-cols-[56px_minmax(0,1fr)]'
            : 'md:grid-cols-[192px_minmax(0,1fr)]'
        )}
      >
        <aside className="h-fit rounded-xl border border-[#e4e4e7] bg-white p-3">
          <button
            type="button"
            className="mb-3 w-full cursor-pointer rounded-md border border-[#e4e4e7] py-2 text-xs font-bold"
            onClick={() => setFolded((value) => !value)}
            data-testid="exam-palette-toggle"
          >
            {folded ? '›' : '‹ 문항 접기'}
          </button>
          <div
            className={cn(
              'grid gap-1.5',
              folded ? 'grid-cols-1' : 'grid-cols-5'
            )}
          >
            {sheet.questions.map((question, index) => (
              <button
                key={question.questionNo}
                type="button"
                className={cn(
                  'relative aspect-square cursor-pointer rounded-md border text-xs font-bold',
                  index === currentIndex
                    ? 'border-[#ef6c00] bg-[#ef6c00] text-white'
                    : answers[question.questionNo]
                      ? 'border-[#f0a36a] bg-[#fff7f0] text-[#8f3f08]'
                      : 'border-[#e4e4e7] bg-white text-[#52525b]'
                )}
                onClick={() => setCurrentIndex(index)}
              >
                {question.questionNo}
                {marked.has(question.questionNo) && (
                  <i className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#b5382f]" />
                )}
              </button>
            ))}
          </div>
          {!folded && (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ececef]">
                <i
                  className="block h-full bg-[#ef6c00]"
                  style={{
                    width: `${(answeredCount / sheet.totalQuestions) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-center text-[11px] text-[#71717a]">
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
          <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-extrabold">
                {currentQuestion.questionNo}번
              </h2>
              <span className="text-xs text-[#71717a]">
                {sheet.examType === 'SCHOOL'
                  ? '선생님이 올린 시험지 · 주관식'
                  : '문제은행 시험 · 객관식'}
              </span>
              <button
                type="button"
                className="ml-auto cursor-pointer rounded-md border border-[#d4d4d8] px-3 py-2 text-xs font-bold"
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
              </button>
            </div>
            <div
              className={cn(
                'mt-4 min-h-44 rounded-lg border p-5 text-[15px] leading-8 text-[#27272a]',
                sheet.examType === 'SCHOOL'
                  ? 'border-[#c9c9ce] bg-[#fafafa]'
                  : 'border-[#e4e4e7] bg-white'
              )}
            >
              <span className="text-[11px] text-[#71717a]">
                {sheet.examType === 'SCHOOL' ? '올린 시험지' : '문제'}
              </span>
              <p className="mt-3">{currentQuestion.prompt}</p>
            </div>
            <div
              className="mt-4 min-h-24 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-4"
              data-testid="exam-answer-box"
            >
              {sheet.examType === 'SCHOOL' ? (
                <input
                  className="h-12 w-full rounded-md border border-[#d4d4d8] bg-white px-4 text-center text-lg font-bold"
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
                    <button
                      key={choice}
                      type="button"
                      className={cn(
                        'h-12 cursor-pointer rounded-md border text-sm font-extrabold',
                        answers[currentQuestion.questionNo] === choice
                          ? 'border-[#ef6c00] bg-[#ef6c00] text-white'
                          : 'border-[#d4d4d8] bg-white text-[#52525b]'
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
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#71717a]">
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
              <span className="ml-auto text-xs font-bold text-[#71717a] tabular-nums">
                {currentQuestion.questionNo} / {sheet.totalQuestions} 문항
              </span>
            </div>
          </section>
          <section className="mt-4 rounded-xl border border-[#e4e4e7] bg-white p-5">
            <h2 className="text-sm font-extrabold">손풀이</h2>
            <p className="mt-1 text-xs text-[#71717a]">
              여기 쓴 것은 제출 뒤 분석에 같이 저장됩니다
            </p>
            <div className="mt-4 min-h-44 rounded-lg border border-dashed border-[#c9c9ce] bg-[#fafafa] p-4 text-xs text-[#a1a1aa]">
              손풀이 영역
            </div>
          </section>
          {formError && (
            <p
              className="mt-4 rounded-lg border border-[#efb5ae] bg-[#fff5f3] p-4 text-xs font-bold text-[#9f2f26]"
              role="alert"
            >
              {formError}
            </p>
          )}
          <p className="mt-4 text-center text-[11px] leading-5 text-[#71717a]">
            왼쪽 레일을 {folded ? <b>접은 상태</b> : <b>편 상태</b>}입니다.{' '}
            {folded
              ? '문제 영역이 192px 넓어집니다.'
              : '시험지 전체가 몇 문항이고 어디까지 왔는지가 항상 보입니다.'}
          </p>
        </main>
      </div>
    </div>
  );
};
