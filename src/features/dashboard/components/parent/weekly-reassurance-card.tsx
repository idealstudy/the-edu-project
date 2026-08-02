'use client';

import { useParentGradeSummaryQuery } from '@/features/exam/hooks/use-exam-query';
import { Skeleton } from '@/shared/components/loading';
import { cn } from '@/shared/lib';
import { LockKeyhole, TrendingUp } from 'lucide-react';

type WeeklyReassuranceCardProps = {
  childId: number | null;
  className?: string;
};

export const WeeklyReassuranceCard = ({
  childId,
  className,
}: WeeklyReassuranceCardProps) => {
  const summaryQuery = useParentGradeSummaryQuery(childId, {
    enabled: childId !== null,
  });

  if (childId !== null && summaryQuery.isPending) {
    return <Skeleton.Block className="h-60 w-full" />;
  }

  const summary = summaryQuery.data;
  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-xl border p-6',
        className
      )}
      data-testid="parent-grade-summary-card"
    >
      <div className="flex items-center gap-2">
        <TrendingUp size={21} className="text-orange-7" aria-hidden />
        <h3 className="font-body1-heading text-gray-12">예상 등급 안심 카드</h3>
      </div>

      {!summary || summary.predictedGradeLow === null ? (
        <div className="border-gray-2 bg-gray-1 mt-4 rounded-xl border py-7 text-center">
          <p className="font-body2-heading text-gray-10">
            첫 시험이 열리면 범위를 알려드릴게요
          </p>
        </div>
      ) : (
        <div className="border-orange-3 bg-orange-1 mt-4 rounded-xl border p-5 text-center">
          <p className="font-caption-heading text-orange-10">
            {summary.childName} 학생의 현재 예상 범위
          </p>
          <p className="text-orange-7 mt-1 text-4xl font-extrabold tabular-nums">
            {summary.predictedGradeLow}~{summary.predictedGradeHigh}등급
          </p>
          <p className="font-body2-normal text-gray-9 mt-2">
            {summary.reassuranceSummary}
          </p>
          {summary.estimate && (
            <span className="font-caption-heading border-orange-3 mt-3 inline-flex rounded-full border px-2.5 py-1 text-orange-10">
              추정 범위 · 참고용
            </span>
          )}
        </div>
      )}

      <div className="border-gray-4 mt-4 flex gap-2 rounded-xl border p-3.5">
        <LockKeyhole size={17} className="text-gray-8 mt-0.5 shrink-0" aria-hidden />
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          {summary?.notice ??
            '아이가 매일 쓰는 회고와 문항별 답, 세부 활동은 부모님께 공유되지 않아요.'}
        </p>
      </div>
    </section>
  );
};
