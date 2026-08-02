'use client';

import { useMemo, useState } from 'react';

import { ExamAnalysisCard } from '@/features/exam/components/exam-analysis-card';
import { useSubmitExamAttempt } from '@/features/exam/hooks/use-exam-mutation';
import {
  useExamAnalysisQuery,
  useExamAttemptQuery,
} from '@/features/exam/hooks/use-exam-query';
import { Skeleton } from '@/shared/components/loading';
import { Button, Input } from '@/shared/components/ui';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyExamError } from '@/shared/lib/errors/errors';

type ExamAttemptClientProps = { attemptId: number };
type AnswerState = Record<
  number,
  { selectedAnswer: string; timeSpentSec: string }
>;

export const ExamAttemptClient = ({ attemptId }: ExamAttemptClientProps) => {
  const attemptQuery = useExamAttemptQuery(attemptId);
  const isAnalyzed = attemptQuery.data?.status === 'ANALYZED';
  const analysisQuery = useExamAnalysisQuery(attemptId, {
    enabled: isAnalyzed,
  });
  const submitMutation = useSubmitExamAttempt(attemptId);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [formError, setFormError] = useState<string | null>(null);

  const completedCount = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) => answer.selectedAnswer.trim() && answer.timeSpentSec !== ''
      ).length,
    [answers]
  );

  if (attemptQuery.isPending) return <Skeleton.Block className="h-96 w-full" />;
  if (analysisQuery.data)
    return <ExamAnalysisCard analysis={analysisQuery.data} />;
  if (!attemptQuery.data) return <p>시험을 불러오지 못했습니다.</p>;

  const sheet = attemptQuery.data;
  const handleSubmit = () => {
    setFormError(null);
    if (completedCount !== sheet.totalQuestions) {
      setFormError('모든 문항의 답과 소요 시간을 입력해주세요.');
      return;
    }
    submitMutation.mutate(
      {
        answers: sheet.questions.map((question) => ({
          questionNo: question.questionNo,
          selectedAnswer: answers[question.questionNo]!.selectedAnswer,
          timeSpentSec: Number(answers[question.questionNo]!.timeSpentSec),
        })),
      },
      {
        onError: (error) => {
          handleApiError(error, classifyExamError, {
            onField: setFormError,
            onContext: () =>
              setFormError('시험 상태가 바뀌었습니다. 다시 열어주세요.'),
            onAuth: () => setFormError('응시 권한을 확인해주세요.'),
            onUnknown: () => setFormError('제출 중 문제가 생겼습니다.'),
          });
        },
      }
    );
  };

  if (submitMutation.data)
    return <ExamAnalysisCard analysis={submitMutation.data} />;

  return (
    <section className="border-gray-3 bg-gray-white rounded-xl border p-5 md:p-7">
      <div>
        <p className="font-caption-heading text-orange-9">
          {sheet.examType === 'NATIONAL' ? '전국 모드' : '내신 모드'}
        </p>
        <h1 className="font-headline2-heading text-gray-12 mt-1">
          {sheet.title}
        </h1>
        <p className="font-body2-normal text-gray-8 mt-2">
          각 문항의 답과 실제 소요 시간을 초 단위로 기록해주세요.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {sheet.questions.map((question) => {
          const answer = answers[question.questionNo] ?? {
            selectedAnswer: '',
            timeSpentSec: '',
          };
          return (
            <article
              key={question.questionNo}
              className="border-gray-3 rounded-xl border p-4"
              data-testid={`exam-question-${question.questionNo}`}
            >
              <p className="font-body1-heading text-gray-12">
                {question.questionNo}. {question.prompt}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  value={answer.selectedAnswer}
                  placeholder="선택 답"
                  aria-label={`${question.questionNo}번 답`}
                  data-testid={`exam-answer-${question.questionNo}`}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.questionNo]: {
                        ...answer,
                        selectedAnswer: event.target.value,
                      },
                    }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  value={answer.timeSpentSec}
                  placeholder="소요 시간(초)"
                  aria-label={`${question.questionNo}번 소요 시간`}
                  data-testid={`exam-time-${question.questionNo}`}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.questionNo]: {
                        ...answer,
                        timeSpentSec: event.target.value,
                      },
                    }))
                  }
                />
              </div>
            </article>
          );
        })}
      </div>

      {formError && (
        <p
          className="font-caption-normal text-system-warning mt-4"
          role="alert"
        >
          {formError}
        </p>
      )}
      <Button
        className="mt-6 w-full"
        disabled={submitMutation.isPending}
        onClick={handleSubmit}
        data-testid="exam-submit-button"
      >
        {submitMutation.isPending
          ? '분석 중...'
          : `${completedCount}/${sheet.totalQuestions} 문항 제출`}
      </Button>
    </section>
  );
};
