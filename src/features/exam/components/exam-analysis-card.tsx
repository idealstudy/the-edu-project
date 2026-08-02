'use client';

import { useState } from 'react';

import Link from 'next/link';

import type { ExamAnalysis } from '@/entities/exam';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MessageSquareText,
  Network,
  NotebookPen,
  Pin,
} from 'lucide-react';

type ExamAnalysisCardProps = { analysis: ExamAnalysis };

type EvidenceSource = ExamAnalysis['evidence'][number]['source'];

const EVIDENCE_ICON: Record<EvidenceSource, typeof BarChart3> = {
  EXAM_SCORE: BarChart3,
  WRONG_ANSWER_REVIEW: CheckCircle2,
  WEAKNESS_TREE: Network,
};

const EVIDENCE_TITLE: Record<EvidenceSource, string> = {
  EXAM_SCORE: '시험 점수',
  WRONG_ANSWER_REVIEW: '해결 기록',
  WEAKNESS_TREE: '약점 잎',
};

const GRADE_TICKS = [1, 2, 3, 4, 5] as const;

const getGradeBandStyle = (low: number, high: number) => {
  const safeLow = Math.min(5, Math.max(1, low));
  const safeHigh = Math.min(5, Math.max(safeLow, high));

  return {
    left: `${(safeLow - 1) * 20}%`,
    width: `${Math.max(20, (safeHigh - safeLow + 1) * 20)}%`,
  };
};

const getLeafColor = (wrongCount: number) => {
  if (wrongCount >= 3) return 'bg-orange-7';
  if (wrongCount >= 1) return 'bg-orange-5';
  return 'bg-orange-3';
};

export const ExamAnalysisCard = ({ analysis }: ExamAnalysisCardProps) => {
  const [isPinAcknowledged, setIsPinAcknowledged] = useState(false);
  const bandStyle = getGradeBandStyle(
    analysis.predictedGradeLow,
    analysis.predictedGradeHigh
  );
  const reviewEvidence = analysis.evidence.find(
    (evidence) => evidence.source === 'WRONG_ANSWER_REVIEW'
  );
  const weaknessEvidence = analysis.evidence.find(
    (evidence) => evidence.source === 'WEAKNESS_TREE'
  );

  return (
    <section
      className="border-gray-3 bg-gray-white rounded-xl border p-5 md:p-7"
      data-testid="exam-analysis-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
            {analysis.examType === 'NATIONAL'
              ? '전국 · 등급컷 근거'
              : '내신 · AI 추정 참고용'}
          </span>
          <h1 className="font-headline2-heading text-gray-12 mt-2">
            {analysis.examTitle}
          </h1>
        </div>
        <span className="bg-orange-1 text-orange-10 rounded-full px-3 py-1.5 text-sm font-semibold">
          원점수 {analysis.rawScore.toFixed(0)}점
        </span>
      </div>

      <div className="border-gray-3 mt-5 rounded-xl border p-5 md:p-6">
        <p className="font-caption-heading text-gray-8">다음 시험 예상</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <p className="text-orange-8 text-4xl font-extrabold tabular-nums">
            {analysis.predictedGradeLow}~{analysis.predictedGradeHigh}등급
          </p>
          <span className="font-body2-heading text-gray-8">범위로 말해요</span>
        </div>

        <div
          className="mt-5"
          data-testid="exam-grade-range-bar"
        >
          <div
            className="bg-gray-2 relative h-2.5 rounded-full"
            role="img"
            aria-label={`예상 등급 ${analysis.predictedGradeLow}등급에서 ${analysis.predictedGradeHigh}등급 사이`}
          >
            <div
              className="from-orange-5 to-orange-7 absolute inset-y-0 rounded-full bg-gradient-to-r"
              style={bandStyle}
            />
          </div>
          <div className="text-gray-7 mt-1.5 flex justify-between px-0.5 text-[11px] tabular-nums">
            {GRADE_TICKS.map((grade) => (
              <span key={grade}>{grade}</span>
            ))}
          </div>
        </div>

        <p className="font-caption-normal text-gray-8 mt-4 leading-relaxed">
          {analysis.dataNotice}
        </p>
      </div>

      <div
        className="border-orange-3 bg-orange-1 mt-4 rounded-lg border p-4 md:p-5"
        data-testid="exam-evidence-origin-chain"
      >
        <div className="flex items-start gap-3">
          <NotebookPen
            size={32}
            className="text-orange-7 shrink-0"
            aria-hidden
          />
          <div>
            <h2 className="font-body1-heading text-gray-12">
              이 추정이 나온 곳 · 네가 채운 단권화
            </h2>
            <p className="font-caption-normal text-gray-8 mt-1 leading-relaxed">
              예상등급은 시험 점수만이 아니라 해결 기록과 약점트리 변화를 함께
              봅니다.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="bg-orange-2 text-orange-10 rounded-lg px-3 py-2 text-center text-xs font-bold">
            내 노트 —
            <small className="mt-0.5 block font-medium">계약 미연결</small>
          </span>
          <ArrowRight
            size={15}
            className="text-gray-7"
            aria-hidden
          />
          <span className="bg-orange-2 text-orange-10 rounded-lg px-3 py-2 text-center text-xs font-bold">
            해결 {reviewEvidence?.value ?? 0}문제
            <small className="mt-0.5 block font-medium">
              {reviewEvidence?.label ?? '회독 기록 없음'}
            </small>
          </span>
          <ArrowRight
            size={15}
            className="text-gray-7"
            aria-hidden
          />
          <span className="bg-orange-2 text-orange-10 rounded-lg px-3 py-2 text-center text-xs font-bold">
            약점 잎이 짙어짐
            <small className="mt-0.5 block font-medium">
              {weaknessEvidence?.label ?? '변화 기록 없음'}
            </small>
          </span>
          <ArrowRight
            size={15}
            className="text-gray-7"
            aria-hidden
          />
          <span className="bg-orange-7 rounded-lg px-3 py-2 text-center text-xs font-bold text-white">
            예상 {analysis.predictedGradeLow}~{analysis.predictedGradeHigh}등급
            <small className="mt-0.5 block font-medium">체계의 결과</small>
          </span>
        </div>
      </div>

      <div className="border-gray-3 mt-4 rounded-lg border p-4 md:p-5">
        <h2 className="font-body1-heading text-gray-12">
          약점 단원 {analysis.weakUnits.length}
        </h2>
        <p className="font-caption-normal text-gray-7 mt-1">
          오답은 다시 풀기 큐에 쌓이고, 단원별 단권화 방에서 이어집니다.
        </p>
        {analysis.weakUnits.length === 0 ? (
          <p className="font-body2-normal text-gray-8 mt-4">
            이번 시험에서 집계된 약점 단원이 없어요.
          </p>
        ) : (
          <ul className="mt-3">
            {analysis.weakUnits.map((unit) => (
              <li
                key={unit.treeNodeId}
                className="border-gray-2 flex items-center gap-3 border-b py-3 last:border-b-0"
              >
                <span
                  className={`${getLeafColor(unit.wrongCount)} h-8 w-8 shrink-0 rotate-[-20deg] rounded-[50%_50%_50%_5px]`}
                  aria-label={`약점 강도 ${unit.wrongCount}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-body2-heading text-gray-11">{unit.name}</p>
                  <p className="font-caption-normal text-gray-7 mt-0.5">
                    {unit.wrongCount > 0
                      ? `${unit.wrongCount}문항 오답`
                      : '숙련도 보완 필요'}
                  </p>
                </div>
                <Link
                  href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(unit.treeNodeId)}
                  className="text-orange-9 text-xs font-bold whitespace-nowrap"
                >
                  단권화 방
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
        data-testid="exam-teacher-pin-loop"
      >
        <div className="flex items-center gap-2 text-blue-900">
          <Pin
            size={18}
            aria-hidden
          />
          <h2 className="font-body2-heading">선생님 핀 확인 루프</h2>
        </div>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-body2-heading text-gray-10">
              핀 코멘트 데이터 미연결
            </p>
            <p className="font-caption-normal text-gray-7 mt-1">
              서버 코멘트 대신 계약 상태만 표시합니다. 아래 확인은 UI 동작
              대조용이며 서버에는 저장되지 않습니다.
            </p>
          </div>
          {isPinAcknowledged ? (
            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
              확인했어요
            </span>
          ) : (
            <Button
              size="xsmall"
              variant="outlined"
              aria-describedby="exam-pin-contract-notice"
              onClick={() => setIsPinAcknowledged(true)}
              data-testid="exam-pin-acknowledge-button"
            >
              확인했어요
            </Button>
          )}
        </div>
        <p
          id="exam-pin-contract-notice"
          className="font-caption-normal mt-3 flex items-center gap-1.5 text-blue-800"
          role="status"
        >
          <MessageSquareText
            size={14}
            aria-hidden
          />
          선생님뷰 상태:{' '}
          {isPinAcknowledged ? '확인함 · 로컬 UI만' : '미확인 · 서버 미연결'}
        </p>
      </div>

      <Link
        href={PRIVATE.DASHBOARD.WRONG_ANSWERS}
        className="bg-orange-7 hover:bg-orange-8 border-gray-11 mt-5 block rounded-lg border px-5 py-3.5 text-center text-base font-extrabold text-white"
        data-testid="exam-review-wrong-answers-cta"
      >
        오답{' '}
        {analysis.weakUnits.reduce((sum, unit) => sum + unit.wrongCount, 0)}문제
        다시 풀러 가기
      </Link>

      <div className="border-gray-3 bg-gray-1 mt-4 flex gap-2 rounded-xl border p-4">
        <AlertCircle
          size={18}
          className="text-gray-8 mt-0.5 shrink-0"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-caption-normal text-gray-9 leading-relaxed">
            {analysis.referenceOnly
              ? '예상 등급은 참고 범위이며 확정 성적이 아닙니다.'
              : '실데이터 기준 분석입니다.'}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {analysis.evidence.map((evidence) => {
              const Icon = EVIDENCE_ICON[evidence.source];
              return (
                <span
                  key={evidence.source}
                  className="text-gray-8 flex items-center gap-1.5 text-xs"
                >
                  <Icon
                    size={14}
                    className="text-orange-7"
                    aria-hidden
                  />
                  {EVIDENCE_TITLE[evidence.source]} · {evidence.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
