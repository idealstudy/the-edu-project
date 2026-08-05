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
      <div className="text-xs text-[#71717a]">
        내 학습 › 응시장 › <b>{analysis.examTitle} 분석</b>
      </div>
      <section className="grid overflow-hidden rounded-xl border border-[#e4e4e7] bg-white md:grid-cols-2">
        <div className="p-6">
          <p className="text-xs font-bold text-[#71717a]">이 시험 점수</p>
          <p className="mt-2 text-5xl font-black text-[#ef6c00] tabular-nums">
            {correctCount}
            <em className="ml-1 text-lg font-bold text-[#71717a] not-italic">
              / {analysis.totalQuestions}
            </em>
          </p>
          <p className="mt-3 text-xs text-[#71717a]">
            정답표 기준으로 채점한 원점수
          </p>
        </div>
        <div className="border-t border-[#e4e4e7] p-6 md:border-t-0 md:border-l">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#fff0e2] px-2.5 py-1 text-[11px] font-extrabold text-[#9a460d]">
              {analysis.gradeBasis === 'MEASURED' ? '실측' : 'AI 예측'}
            </span>
            {analysis.gradeBasis === 'PREDICTED' && (
              <span className="rounded-full border border-[#d4d4d8] px-2.5 py-1 text-[11px] font-bold text-[#52525b]">
                실측 아님
              </span>
            )}
            <span className="text-[11px] font-bold text-[#71717a]">
              신뢰 {analysis.confidence}
            </span>
          </div>
          <p
            className="mt-3 text-3xl font-black tracking-tight text-[#27272a]"
            data-testid="exam-grade-result"
          >
            {analysis.gradeBasis === 'MEASURED'
              ? `${analysis.predictedGradeLow}등급`
              : `${analysis.predictedGradeLow}~${analysis.predictedGradeHigh}등급`}
          </p>
          {analysis.standardScore !== null && (
            <p className="mt-1 text-sm font-bold text-[#52525b] tabular-nums">
              표준점수 {analysis.standardScore}
            </p>
          )}
          <p className="mt-3 text-xs leading-6 text-[#71717a]">
            {analysis.dataNotice}
          </p>
        </div>
      </section>

      {analysis.gradeBasis === 'PREDICTED' && (
        <section
          className="rounded-xl border border-[#f0a36a] bg-[#fff7f0] p-5"
          data-testid="exam-prediction-evidence"
        >
          <h2 className="text-sm font-extrabold text-[#8f3f08]">
            무엇을 보고 예측했나요
          </h2>
          <div className="mt-3 divide-y divide-[#f3d5bd]">
            {analysis.evidence.map((item) => (
              <p
                key={item.source}
                className="py-3 text-xs leading-5 text-[#62534a]"
              >
                {item.label}
              </p>
            ))}
          </div>
          {analysis.adjustmentReason && (
            <p className="mt-3 text-[11px] leading-5 text-[#7a4a25]">
              보정: {analysis.adjustmentReason}
            </p>
          )}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-extrabold">문항별 정오</h2>
            <span className="text-xs text-[#71717a]">
              번호를 누르면 그 문항 풀이로 넘어갑니다
            </span>
          </div>
          <div className="mt-4 grid grid-cols-10 gap-2">
            {analysis.answerResults.map((answer) => (
              <span
                key={answer.questionNo}
                className={
                  answer.correct
                    ? 'flex aspect-square items-center justify-center rounded-md border border-[#b7e3c3] bg-[#effaf1] text-[11px] font-bold text-[#237a3d]'
                    : 'flex aspect-square items-center justify-center rounded-md border border-[#efb5ae] bg-[#fff5f3] text-[11px] font-bold text-[#9f2f26]'
                }
              >
                {answer.questionNo}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#71717a]">
            선생님이 표시한 문항은 번호 칸 테두리로만 알립니다.
          </p>
          {visiblePins.map((pin) => (
            <div
              key={pin.id}
              className="mt-3 rounded-lg border-2 border-[#ef6c00] bg-[#fff7f0] p-3"
              data-testid={`exam-teacher-pin-${pin.id}`}
            >
              <p className="text-xs font-extrabold text-[#8f3f08]">
                {pin.teacherName} 선생님 코멘트
              </p>
              <p className="mt-2 text-xs leading-6 text-[#52525b]">
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
          <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-extrabold">이 시험이 바꾼 단원</h2>
              <span className="text-xs text-[#71717a]">숙련도 갱신분</span>
            </div>
            {analysis.weakUnits.map((unit) => (
              <div
                key={unit.treeNodeId}
                className="flex items-center gap-3 border-b border-[#ececef] py-3 last:border-b-0"
              >
                <span className="min-w-0 flex-1 text-xs font-bold">
                  {unit.name}
                  <small className="mt-1 block font-normal text-[#71717a]">
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
          <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-extrabold">지난 시험</h2>
              <span className="text-xs text-[#71717a]">
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
      <p className="text-center text-[11px] leading-5 text-[#71717a]">
        틀린 문항이 오답 회독과 오늘의 문제와 단권화로 가는 것은{' '}
        <b>시스템이 알아서 합니다.</b> 이 화면은 <b>분석만</b> 합니다.
      </p>
    </div>
  );
};
