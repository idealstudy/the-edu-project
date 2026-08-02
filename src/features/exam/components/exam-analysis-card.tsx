'use client';

import type { ExamAnalysis } from '@/entities/exam';
import { AlertCircle, BarChart3, CheckCircle2, Network } from 'lucide-react';

type ExamAnalysisCardProps = { analysis: ExamAnalysis };

const evidenceIcon = {
  EXAM_SCORE: BarChart3,
  WRONG_ANSWER_REVIEW: CheckCircle2,
  WEAKNESS_TREE: Network,
} as const;

export const ExamAnalysisCard = ({ analysis }: ExamAnalysisCardProps) => {
  return (
    <section
      className="border-gray-3 bg-gray-white rounded-xl border p-5 md:p-7"
      data-testid="exam-analysis-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-caption-heading text-orange-9">
            {analysis.examType === 'NATIONAL'
              ? '전국 모드'
              : '내신 · AI 추정 참고용'}
          </p>
          <h1 className="font-headline2-heading text-gray-12 mt-1">
            {analysis.examTitle}
          </h1>
        </div>
        <span className="bg-orange-1 text-orange-10 rounded-full px-3 py-1.5 text-sm font-semibold">
          원점수 {analysis.rawScore.toFixed(0)}점
        </span>
      </div>

      <div className="border-orange-3 bg-orange-1 mt-5 rounded-xl border p-5 text-center">
        <p className="font-caption-heading text-orange-10">현재 예상 범위</p>
        <p className="text-orange-7 mt-1 text-4xl font-extrabold tabular-nums">
          {analysis.predictedGradeLow}~{analysis.predictedGradeHigh}등급
        </p>
        <p className="font-caption-normal text-gray-8 mt-2">
          단정값이 아니라 시험·회독·약점트리를 합친 범위입니다.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="font-body1-heading text-gray-12">이 추정이 나온 곳</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {analysis.evidence.map((evidence) => {
            const Icon = evidenceIcon[evidence.source];
            return (
              <div
                key={evidence.source}
                className="border-gray-3 rounded-xl border p-4"
              >
                <Icon
                  size={20}
                  className="text-orange-7"
                  aria-hidden
                />
                <p className="font-body2-heading text-gray-11 mt-2">
                  {evidence.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-body1-heading text-gray-12">약점 단원</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.weakUnits.length === 0 ? (
            <span className="font-body2-normal text-gray-8">
              이번 시험에서 집계된 약점 단원이 없어요.
            </span>
          ) : (
            analysis.weakUnits.map((unit) => (
              <span
                key={unit.treeNodeId}
                className="border-orange-3 bg-orange-1 text-orange-10 rounded-full border px-3 py-1.5 text-sm"
              >
                {unit.name} ·{' '}
                {unit.wrongCount > 0
                  ? `오답 ${unit.wrongCount}`
                  : '숙련도 보완'}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="border-gray-3 bg-gray-1 mt-6 flex gap-2 rounded-xl border p-4">
        <AlertCircle
          size={18}
          className="text-gray-8 mt-0.5 shrink-0"
          aria-hidden
        />
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          {analysis.dataNotice}
        </p>
      </div>
    </section>
  );
};
