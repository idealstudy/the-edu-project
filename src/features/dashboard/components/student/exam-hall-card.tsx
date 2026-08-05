'use client';

import Link from 'next/link';

import {
  useAssignedExamsQuery,
  useExamAnalysisQuery,
} from '@/features/exam/hooks/use-exam-query';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';

type Props = { className?: string };

export const ExamHallCard = ({ className }: Props) => {
  const exams = useAssignedExamsQuery();
  const analyzedExam = exams.data?.find((exam) => exam.status === 'ANALYZED');
  const analysis = useExamAnalysisQuery(analyzedExam?.attemptId ?? 0, {
    enabled: Boolean(analyzedExam),
  });
  const pendingExam = exams.data?.find((exam) => exam.status !== 'ANALYZED');

  if (exams.isPending) return <Skeleton.Block className="h-64 w-full" />;

  return (
    <section
      className={cn(
        'rounded-2xl border border-[#e4e4e7] bg-white p-6',
        className
      )}
      data-testid="expected-grade-card"
    >
      {analysis.data ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold text-[#27272a]">
              내 위치 ·{' '}
              {analysis.data.gradeBasis === 'MEASURED' ? '실측' : '예측'}
            </h3>
            <span className="rounded-full bg-[#fff0e2] px-2.5 py-1 text-[11px] font-extrabold text-[#9a460d]">
              {analysis.data.gradeBasis === 'MEASURED'
                ? '기준표 반영'
                : 'AI 예측'}
            </span>
            {analysis.data.gradeBasis === 'PREDICTED' && (
              <span className="rounded-full border border-[#d4d4d8] px-2.5 py-1 text-[11px] font-bold text-[#52525b]">
                실측 아님
              </span>
            )}
          </div>
          <p className="mt-3 text-4xl font-black tracking-tight text-[#27272a]">
            {analysis.data.gradeBasis === 'MEASURED'
              ? `${analysis.data.predictedGradeLow}등급`
              : `${analysis.data.predictedGradeLow}~${analysis.data.predictedGradeHigh}등급`}
          </p>
          {analysis.data.standardScore !== null && (
            <p className="mt-1 text-sm font-bold text-[#52525b] tabular-nums">
              표준점수 {analysis.data.standardScore}
            </p>
          )}
          <div className="mt-4 divide-y divide-[#ececef] rounded-lg border border-[#ececef] px-4">
            {analysis.data.evidence.map((item) => (
              <p
                key={item.source}
                className="py-3 text-xs leading-5 text-[#52525b]"
              >
                {item.label}
              </p>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[#71717a]">
            {analysis.data.dataNotice}
          </p>
        </>
      ) : (
        <>
          <h3 className="text-sm font-extrabold text-[#27272a]">내 위치</h3>
          <p className="mt-3 text-xl font-extrabold text-[#27272a]">
            아직 등급을 계산할 자료가 없어요
          </p>
          <p className="mt-2 text-xs leading-6 text-[#71717a]">
            추측으로 숫자를 만들지 않습니다. 아래 두 가지 중 하나만 하면 이
            자리에 내 위치가 들어옵니다.
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href={PUBLIC.OPEN_CHALLENGE.LIST}
              className="flex items-center gap-3 rounded-lg border border-[#e4e4e7] p-3 text-xs font-bold text-[#27272a]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0e2] text-[#9a460d]">
                1
              </span>
              <span className="flex-1">
                오픈챌린지 10문항 풀기
                <small className="mt-1 block font-normal text-[#71717a]">
                  한 문항에 3분쯤 걸려요
                </small>
              </span>
              <span className="text-[#ef6c00]">시작하기</span>
            </Link>
            <Link
              href={PRIVATE.DASHBOARD.EXAM_HALL}
              className="flex items-center gap-3 rounded-lg border border-[#e4e4e7] p-3 text-xs font-bold text-[#27272a]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0e2] text-[#9a460d]">
                2
              </span>
              <span className="flex-1">
                응시장에서 모의고사 1개 응시
                <small className="mt-1 block font-normal text-[#71717a]">
                  기준표가 있으면 실측 등급이 나옵니다
                </small>
              </span>
              <span className="text-[#ef6c00]">보러 가기</span>
            </Link>
          </div>
        </>
      )}

      <Link
        href={PRIVATE.DASHBOARD.EXAM_HALL}
        className="mt-5 flex items-center gap-3 rounded-lg border border-[#f0a36a] bg-[#fff7f0] p-4 text-xs font-bold text-[#8f3f08]"
      >
        <span className="flex-1">
          응시장 열기
          {pendingExam ? (
            <small className="mt-1 block font-normal text-[#71717a]">
              배정 1건 · {pendingExam.title}
            </small>
          ) : (
            <small className="mt-1 block font-normal text-[#71717a]">
              지금 볼 수 있는 시험을 확인합니다
            </small>
          )}
        </span>
        {pendingExam && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ef6c00] px-2 text-white">
            1
          </span>
        )}
        <span>›</span>
      </Link>
      {analyzedExam && (
        <Button
          asChild
          size="small"
          variant="outlined"
          className="mt-3 w-full"
        >
          <Link href={PRIVATE.DASHBOARD.EXAM_ATTEMPT(analyzedExam.attemptId)}>
            시험 분석 보기
          </Link>
        </Button>
      )}
    </section>
  );
};
