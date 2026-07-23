'use client';

import { cn } from '@/shared/lib';

import type { ExamHallSummary } from '../../mock/mvp-g-dashboard.mock';

type Props = {
  /**
   * 실 데이터가 준비되면 여기로 채운다. 없으면(=지금) "준비 중" 빈 상태만 그린다.
   * ⛔ 백엔드 계약 필요: 예상 등급 계산(오픈챌린지 응시 결과 → 등급컷 매핑) API 부재.
   */
  summary?: ExamHallSummary;
  className?: string;
};

/**
 * 응시장 카드 — MVP-G v3 학생 대시보드 ① 블록. 레이아웃(뼈대)만 v3를 따르고,
 * 실측 없는 등급·D-day 숫자는 렌더하지 않는다(회장 지시 2026-07-23).
 */
export const ExamHallCard = ({ summary, className }: Props) => {
  if (!summary) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
          className
        )}
      >
        <h3 className="font-body1-heading text-gray-12">응시장</h3>
        <div className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-8 text-center">
          <p className="font-body2-heading text-gray-10">준비 중이에요</p>
          <p className="font-caption-normal text-gray-8">
            시험지를 응시하면 예상 등급이 여기 나타나요
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
    >
      <p className="font-body2-normal text-gray-8">
        {summary.examTitle}{' '}
        <span className="text-orange-7 font-body1-heading">
          D-{summary.examDDay}
        </span>
      </p>

      {!summary.hasAttempts ? (
        <div className="mt-4 flex flex-col gap-2 text-center">
          <p className="font-body1-heading text-gray-12">
            진단 1세트 풀면 예상 등급이 나옵니다
          </p>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-wrap items-baseline gap-3">
          <span className="font-body1-heading text-gray-12">
            지금 이대로면
          </span>
          <span className="text-orange-7 font-headline1-heading tabular-nums">
            {summary.predictedGrade ?? '-'}
            <span className="font-body1-heading">등급</span>
          </span>
          {summary.deltaMessage && (
            <span className="font-body2-heading text-green-600">
              ↑ {summary.deltaMessage}
            </span>
          )}
        </div>
      )}

      <p className="font-caption-normal text-gray-7 mt-2.5">
        * {summary.confidenceNote}
      </p>
    </section>
  );
};
