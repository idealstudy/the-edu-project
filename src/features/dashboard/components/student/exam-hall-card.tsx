
'use client';

import Link from 'next/link';

import { useAssignedExamsQuery } from '@/features/exam/hooks/use-exam-query';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { ClipboardCheck } from 'lucide-react';

type Props = { className?: string };

/**
 * 응시장 카드 — MVP-G v3 학생 대시보드 ① 블록. 레이아웃(뼈대)만 v3를 따르고,
 * 실측 없는 등급·D-day 숫자는 렌더하지 않는다(회장 지시 2026-07-23).
 */
export const ExamHallCard = ({ className }: Props) => {
  const examsQuery = useAssignedExamsQuery();

  if (examsQuery.isPending) {
    return <Skeleton.Block className="h-52 w-full" />;
  }

  const exam = examsQuery.data?.[0];
  if (!exam) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
          className
        )}
      >
        <h3 className="font-body1-heading text-gray-12">응시장</h3>
        <div className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-8 text-center">
          <ClipboardCheck
            size={28}
            className="text-gray-6"
            aria-hidden
          />
          <p className="font-body2-heading text-gray-10">
            선생님이 첫 시험을 열면 채워집니다
          </p>
          <p className="font-caption-normal text-gray-8">
            기다리는 동안 지금까지 쌓은 단권화 책을 둘러볼 수 있어요
          </p>
          <Button
            asChild
            size="small"
            variant="outlined"
            className="mt-3"
          >
            <Link href={PRIVATE.DASHBOARD.UNIT_NOTES}>단권화 책 구경</Link>
          </Button>
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
      <p className="font-body2-normal text-gray-8">{exam.title}</p>

      {exam.status !== 'ANALYZED' ? (
        <div className="mt-4 flex flex-col gap-2 text-center">
          <p className="font-body1-heading text-gray-12">
            문항별 답과 소요 시간을 기록하면 바로 분석해요
          </p>
          <Button
            asChild
            className="mt-2"
          >
            <Link
              href={PRIVATE.DASHBOARD.EXAM_ATTEMPT(exam.attemptId)}
              data-testid="exam-start-button"
            >
              시험 응시하기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-3.5 flex flex-wrap items-baseline gap-3">
          <span className="font-body1-heading text-gray-12">
            지금 이대로면
          </span>
          <span className="text-orange-7 font-headline1-heading tabular-nums">
            {exam.predictedGradeLow}~{exam.predictedGradeHigh}
            <span className="font-body1-heading">등급 예상</span>
          </span>
          <Button
            asChild
            size="small"
            variant="outlined"
          >
            <Link href={PRIVATE.DASHBOARD.EXAM_ATTEMPT(exam.attemptId)}>
              근거 보기
            </Link>
          </Button>
        </div>
      )}

      <p className="font-caption-normal text-gray-7 mt-2.5">
        * 예상 등급은 단정값이 아닌 범위이며, 데이터 출처를 함께 표시합니다.
      </p>
    </section>
  );
};
