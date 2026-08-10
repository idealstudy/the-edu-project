'use client';

import { useState } from 'react';

import Link from 'next/link';

import type { ExamAnalysis } from '@/entities/exam';
import { useAcknowledgeExamPin } from '@/features/exam/hooks/use-exam-mutation';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';

export const ExamAnalysisCard = ({ analysis }: { analysis: ExamAnalysis }) => {
  const [acknowledgedPinIds, setAcknowledgedPinIds] = useState<Set<number>>(
    new Set()
  );
  const acknowledgePin = useAcknowledgeExamPin(analysis.attemptId);
  const visiblePins = analysis.teacherPins.filter(
    (pin) => !acknowledgedPinIds.has(pin.id)
  );
  const correctCount = analysis.answerResults.filter(
    (answer) => answer.correct
  ).length;

  return (
    <div
      className="space-y-4"
      data-testid="exam-analysis-card"
    >
      <div className="text-gray-8 text-xs">
        내 학습 › 응시장 › <b>{analysis.examTitle} 분석</b>
      </div>
      <section className="border-gray-3 grid overflow-hidden rounded-xl border bg-white md:grid-cols-2">
        <div className="p-6">
          <p className="text-gray-8 text-xs font-bold">이 시험 점수</p>
          <p className="text-orange-7 mt-2 text-5xl font-black tabular-nums">
            {correctCount}
            <em className="text-gray-8 ml-1 text-lg font-bold not-italic">
              / {analysis.totalQuestions}
            </em>
          </p>
          <p className="text-gray-8 mt-3 text-xs">
            정답표 기준으로 채점한 원점수
          </p>
        </div>
        <div className="border-gray-3 border-t p-6 md:border-t-0 md:border-l">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-orange-2 text-orange-11 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
              {analysis.gradeBasis === 'MEASURED' ? '실측' : 'AI 예측'}
            </span>
            {analysis.gradeBasis === 'PREDICTED' && (
              <span className="border-gray-4 text-gray-10 rounded-full border px-2.5 py-1 text-[11px] font-bold">
                실측 아님
              </span>
            )}
            <span className="text-gray-8 text-[11px] font-bold">
              신뢰 {analysis.confidence}
            </span>
          </div>
          <p
            className="text-gray-12 mt-3 text-3xl font-black tracking-tight"
            data-testid="exam-grade-result"
          >
            {analysis.predictedGradeLow}~{analysis.predictedGradeHigh}등급
          </p>
          {analysis.standardScore !== null && (
            <p className="text-gray-10 mt-1 text-sm font-bold tabular-nums">
              표준점수 {analysis.standardScore}
            </p>
          )}
          <p className="text-gray-8 mt-3 text-xs leading-6">
            {analysis.dataNotice}
          </p>
        </div>
      </section>

      {analysis.gradeBasis === 'PREDICTED' && (
        <section
          className="border-orange-4 bg-orange-1 rounded-xl border p-5"
          data-testid="exam-prediction-evidence"
        >
          <h2 className="text-orange-11 text-sm font-extrabold">
            무엇을 보고 예측했나요
          </h2>
          <div className="divide-orange-3 mt-3 divide-y">
            {analysis.evidence.map((item) => (
              <p
                key={item.source}
                className="text-gray-10 py-3 text-xs leading-5"
              >
                {item.label}
              </p>
            ))}
          </div>
          {analysis.adjustmentReason && (
            <p className="text-orange-11 mt-3 text-[11px] leading-5">
              보정: {analysis.adjustmentReason}
            </p>
          )}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border-gray-3 rounded-xl border bg-white p-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-extrabold">문항별 정오</h2>
            <span className="text-gray-8 text-xs">
              번호를 누르면 그 문항 풀이로 넘어갑니다
            </span>
          </div>
          <div className="mt-4 grid grid-cols-10 gap-2">
            {analysis.answerResults.map((answer) => (
              <span
                key={answer.questionNo}
                className={
                  answer.correct
                    ? 'border-system-success bg-system-success-alt text-system-success flex aspect-square items-center justify-center rounded-md border text-[11px] font-bold'
                    : 'border-red-3 bg-red-1 text-red-10 flex aspect-square items-center justify-center rounded-md border text-[11px] font-bold'
                }
              >
                {answer.questionNo}
              </span>
            ))}
          </div>
          <p className="text-gray-8 mt-3 text-[11px]">
            선생님이 표시한 문항은 번호 칸 테두리로만 알립니다.
          </p>
          {visiblePins.map((pin) => (
            <div
              key={pin.id}
              className="border-orange-7 bg-orange-1 mt-3 rounded-lg border-2 p-3"
              data-testid={`exam-teacher-pin-${pin.id}`}
            >
              <p className="text-orange-11 text-xs font-extrabold">
                {pin.teacherName} 선생님 코멘트
              </p>
              <p className="text-gray-10 mt-2 text-xs leading-6">
                {pin.comment}
              </p>
              <Button
                size="xsmall"
                variant="outlined"
                className="mt-3"
                disabled={acknowledgePin.isPending}
                onClick={() =>
                  acknowledgePin.mutate(pin.id, {
                    onSuccess: () =>
                      setAcknowledgedPinIds((current) => {
                        const next = new Set(current);
                        next.add(pin.id);
                        return next;
                      }),
                  })
                }
                data-testid={`exam-pin-acknowledge-${pin.id}`}
              >
                확인했어요
              </Button>
            </div>
          ))}
        </section>
        <div className="space-y-4">
          <section className="border-gray-3 rounded-xl border bg-white p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-extrabold">이 시험이 바꾼 단원</h2>
              <span className="text-gray-8 text-xs">숙련도 갱신분</span>
            </div>
            {analysis.weakUnits.map((unit) => (
              <div
                key={unit.treeNodeId}
                className="border-gray-2 flex items-center gap-3 border-b py-3 last:border-b-0"
              >
                <span className="min-w-0 flex-1 text-xs font-bold">
                  {unit.name}
                  <small className="text-gray-8 mt-1 block font-normal">
                    {unit.wrongCount}문항 오답
                  </small>
                </span>
                <Button
                  asChild
                  size="xsmall"
                  variant="outlined"
                >
                  <Link
                    href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(unit.treeNodeId)}
                  >
                    정리하기
                  </Link>
                </Button>
              </div>
            ))}
          </section>
          <section className="border-gray-3 rounded-xl border bg-white p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-extrabold">지난 시험</h2>
              <span className="text-gray-8 text-xs">
                응시장 안에서도 볼 수 있어요
              </span>
            </div>
            <Button
              asChild
              size="small"
              variant="outlined"
              className="mt-4 w-full"
            >
              <Link href={PRIVATE.DASHBOARD.EXAM_HALL}>
                응시장으로 돌아가기
              </Link>
            </Button>
          </section>
        </div>
      </div>
      <p className="text-gray-8 text-center text-[11px] leading-5">
        틀린 문항이 오답 회독과 오늘의 문제와 단권화로 가는 것은{' '}
        <b>시스템이 알아서 합니다.</b> 이 화면은 <b>분석만</b> 합니다.
      </p>
    </div>
  );
};
