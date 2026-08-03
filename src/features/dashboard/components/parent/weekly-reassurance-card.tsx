'use client';

import { useChildReportQuery } from '@/features/parent';
import { Skeleton } from '@/shared/components/loading';
import { cn } from '@/shared/lib';
import { ArrowRight, LockKeyhole, ShieldCheck, Sprout } from 'lucide-react';

type WeeklyReassuranceCardProps = {
  childId: number | null;
  className?: string;
};

export const WeeklyReassuranceCard = ({
  childId,
  className,
}: WeeklyReassuranceCardProps) => {
  const summaryQuery = useChildReportQuery(childId ?? 0);

  if (childId !== null && summaryQuery.isPending) {
    return <Skeleton.Block className="h-96 w-full" />;
  }

  const summary = summaryQuery.data;
  const childName = summary?.childName ?? '자녀';
  const beforeAfter = summary?.beforeAfter;
  const hasGradeRange =
    summary?.expectedGradeRange !== undefined &&
    summary.expectedGradeRange !== '데이터 없음';
  const formatPercent = (value: number | undefined) =>
    value === undefined ? '—' : `${Math.round(value)}%`;
  const formatDays = (value: number | undefined) =>
    value === undefined ? '—' : `주 ${Number(value.toFixed(1))}일`;
  const trackTotal =
    (beforeAfter?.solutionViewRateBefore ?? 0) +
    (beforeAfter?.solutionViewRateAfter ?? 0);
  const beforeTrack =
    trackTotal === 0
      ? 0
      : Math.round(
          ((beforeAfter?.solutionViewRateBefore ?? 0) / trackTotal) * 100
        );

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-5 md:p-6',
        className
      )}
      data-testid="parent-grade-summary-card"
    >
      <header className="border-gray-3 from-orange-1 rounded-2xl border bg-gradient-to-b to-white px-5 py-7 text-center">
        <span className="border-orange-3 text-orange-9 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold">
          <ShieldCheck
            size={15}
            aria-hidden
          />
          디에듀가 보증하는 관리
        </span>
        <h3 className="font-headline2-heading text-gray-12 mt-3">
          {childName}의 성과
        </h3>
        <p className="font-body2-normal text-gray-8 mt-1">
          학습 변화 기록 · 주간 관리
        </p>
        <span className="bg-orange-1 text-orange-9 mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold">
          최근 4주 실제 학습 기록
        </span>
      </header>

      <p className="font-body2-normal text-gray-9 mx-1 mt-5 text-center leading-relaxed">
        처음 2주와 최근 2주의 실제 행동 기록을 비교했어요.
        <br />
        기록이 쌓이면 <b className="text-gray-12">가장 크게 달라진 습관</b>부터
        보여드릴게요.
      </p>

      <h4 className="font-caption-heading text-gray-7 mt-6 tracking-wide">
        가장 큰 변화
      </h4>
      <div className="border-gray-3 mt-2 rounded-2xl border p-5">
        <p className="font-body2-heading text-gray-11">
          막혔을 때 해설을 여는 비율
        </p>
        <div className="mt-4 flex items-center gap-3 text-center">
          <div className="flex-1">
            <p className="font-caption-normal text-gray-7">관리 전</p>
            <p className="text-gray-7 mt-1 text-2xl font-extrabold">
              {formatPercent(beforeAfter?.solutionViewRateBefore)}
            </p>
          </div>
          <ArrowRight
            size={20}
            className="text-orange-5"
            aria-hidden
          />
          <div className="flex-1">
            <p className="font-caption-normal text-gray-7">지금</p>
            <p className="text-orange-7 mt-1 text-3xl font-extrabold">
              {formatPercent(beforeAfter?.solutionViewRateAfter)}
            </p>
          </div>
        </div>
        <div
          className="bg-gray-2 mt-4 flex h-2.5 overflow-hidden rounded-full"
          role="img"
          aria-label={`해설 열람 비율 ${formatPercent(beforeAfter?.solutionViewRateBefore)}에서 ${formatPercent(beforeAfter?.solutionViewRateAfter)}로 변화`}
          data-testid="parent-before-after-track"
        >
          <div
            className="bg-gray-4 h-full"
            style={{ width: `${beforeTrack}%` }}
          />
          <div
            className="bg-orange-7 h-full"
            style={{ width: `${100 - beforeTrack}%` }}
          />
        </div>
        <p className="font-caption-normal text-gray-8 mt-3 leading-relaxed">
          해설을 먼저 연 완료 기록 ÷ 해당 2주 완료 기록으로 계산합니다.
        </p>
      </div>

      <h4 className="font-caption-heading text-gray-7 mt-6 tracking-wide">
        함께 좋아진 것
      </h4>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <div className="border-gray-3 rounded-xl border p-4 text-center">
          <p className="font-caption-normal text-gray-7">예상 위치</p>
          <p className="font-body2-heading text-gray-11 mt-2">
            {hasGradeRange ? (
              <>
                <span className="text-gray-7">
                  {beforeAfter?.expectedGradeRangeBefore ?? '데이터 없음'}
                </span>
                <ArrowRight
                  size={14}
                  className="text-orange-5 mx-1 inline"
                  aria-hidden
                />
                <span className="text-orange-8">
                  {beforeAfter?.expectedGradeRangeAfter ??
                    summary.expectedGradeRange}
                </span>
              </>
            ) : (
              '— → —'
            )}
          </p>
        </div>
        <div className="border-gray-3 rounded-xl border p-4 text-center">
          <p className="font-caption-normal text-gray-7">자습 꾸준함</p>
          <p className="font-body2-heading text-gray-11 mt-2">
            <span className="text-gray-7">
              {formatDays(beforeAfter?.selfStudyDaysPerWeekBefore)}
            </span>
            <ArrowRight
              size={14}
              className="text-orange-5 mx-1 inline"
              aria-hidden
            />
            <span className="text-orange-8">
              {formatDays(beforeAfter?.selfStudyDaysPerWeekAfter)}
            </span>
          </p>
        </div>
      </div>

      <div className="border-orange-3 bg-orange-1 mt-3 rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <span className="bg-orange-7 flex size-8 items-center justify-center rounded-full text-sm font-bold text-white">
            선
          </span>
          <div>
            <p className="font-body2-heading text-gray-11">
              {summary?.teacherName ?? '담당 선생님'} 한마디
            </p>
            <p className="font-caption-normal text-gray-7">
              담당 선생님 · 직접 작성
            </p>
          </div>
        </div>
        <p className="font-body2-normal text-gray-8 mt-3 leading-relaxed">
          {summary?.teacherComment ?? '아직 등록된 한마디가 없어요.'}
        </p>
      </div>

      <div className="border-gray-3 mt-5 flex gap-2.5 rounded-xl border p-3.5">
        <ShieldCheck
          size={22}
          className="text-orange-7 shrink-0"
          aria-hidden
        />
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          <b className="text-gray-11">디에듀가 보장합니다</b> — 매주 증거 리포트
          · 자습 추적 · 약점 진단. 어느 주든 관리가 끊기지 않아요.
        </p>
      </div>
      <p className="font-caption-normal text-gray-7 mt-3 text-center leading-relaxed">
        성과 산출에 연결된 학습 기록{' '}
        <b className="text-gray-9">{beforeAfter?.learningRecordCount ?? 0}건</b>{' '}
        · 첫 2주와 최근 2주를 같은 규칙으로 비교합니다.
      </p>

      {!summary || !beforeAfter?.sufficientData ? (
        <div className="border-gray-3 mt-5 flex flex-col items-center rounded-2xl border border-dashed px-5 py-8 text-center">
          <Sprout
            size={30}
            className="text-orange-6"
            aria-hidden
          />
          <p className="font-body2-heading text-gray-10 mt-3">
            첫 성과 카드는 곧 만들어져요
          </p>
          <p className="font-caption-normal text-gray-8 mt-1 leading-relaxed">
            전→후 변화를 보여드리려면 기록이 조금 더 필요해요.
          </p>
        </div>
      ) : (
        <p className="border-orange-3 bg-orange-1 text-orange-10 font-caption-normal mt-5 rounded-xl border p-3 text-center">
          최신 분석 시험 예상 위치는 {summary.expectedGradeRange}입니다. 등급은
          단정값이 아닌 현재 범위로 안내합니다.
        </p>
      )}

      <div className="border-gray-4 mt-4 flex gap-2 rounded-xl border p-3.5">
        <LockKeyhole
          size={17}
          className="text-gray-8 mt-0.5 shrink-0"
          aria-hidden
        />
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          아이가 매일 쓰는 회고와 문항별 답, 세부 활동은 부모님께 공유되지
          않아요.
        </p>
      </div>
    </section>
  );
};
