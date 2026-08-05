'use client';

import Link from 'next/link';

import { useStudentGrowthQuery } from '@/features/dashboard/hooks/use-growth-query';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import { cn } from '@/shared/lib';
import { Flame, RefreshCw, Sprout } from 'lucide-react';

type Props = {
  className?: string;
};

const INTENSITY_STYLE = [
  'bg-gray-2',
  'bg-orange-2',
  'bg-orange-5',
  'bg-orange-7',
] as const;

const GrowthBandLoading = ({ className }: Props) => (
  <section
    className={cn(
      'bg-gray-white border-gray-4 flex items-center gap-4 rounded-xl border p-5',
      className
    )}
    data-testid="student-growth-loading"
  >
    <Skeleton.Block className="h-20 w-24 shrink-0 rounded-xl" />
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Skeleton.Block className="h-6 w-48" />
      <Skeleton.Block className="h-4 w-56" />
      <Skeleton.Block className="h-2 w-full" />
    </div>
  </section>
);

const WeaknessTreeMiniGrid = ({
  cells,
}: {
  cells: Array<{
    nodeId: number;
    unitName: string;
    masteryScore: number;
    intensity: number;
  }>;
}) => (
  <div
    className="grid shrink-0 grid-cols-4 gap-1"
    role="img"
    aria-label={`약점트리 숙련도 ${cells.length}개 단원`}
    data-testid="student-growth-tree-grid"
  >
    {cells.map((cell) => (
      <span
        key={cell.nodeId}
        className={cn(
          'size-5 rounded-md',
          INTENSITY_STYLE[cell.intensity] ?? INTENSITY_STYLE[0]
        )}
        title={`${cell.unitName} ${cell.masteryScore}%`}
        aria-label={`${cell.unitName} 숙련도 ${cell.masteryScore}%`}
      />
    ))}
  </div>
);

export const GrowthBand = ({ className }: Props) => {
  const growthQuery = useStudentGrowthQuery();

  if (growthQuery.isPending) {
    return <GrowthBandLoading className={className} />;
  }

  if (growthQuery.isError) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-wrap items-center gap-3 rounded-xl border p-5',
          className
        )}
        data-testid="student-growth-error"
      >
        <RefreshCw
          size={24}
          className="text-gray-6"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-body2-heading text-gray-10">
            성장 지표를 불러오지 못했어요
          </p>
          <p className="font-caption-normal text-gray-8 mt-0.5">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
        <Button
          size="xsmall"
          variant="outlined"
          onClick={() => void growthQuery.refetch()}
        >
          다시 불러오기
        </Button>
      </section>
    );
  }

  const growth = growthQuery.data;
  const xpRatio = Math.min(
    100,
    Math.round((growth.xp / growth.xpToNextLevel) * 100)
  );
  const isEmpty = growth.totalExperience === 0;

  if (isEmpty) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col items-center rounded-xl border p-6 text-center',
          className
        )}
        data-testid="student-growth-empty"
      >
        <WeaknessTreeMiniGrid cells={growth.weaknessTreeCells} />
        <Sprout
          size={24}
          className="text-orange-6 mt-4"
          aria-hidden
        />
        <h3 className="font-body1-heading text-gray-11 mt-2">
          아직 회색이에요. 첫 문제를 풀면
          <br />내 트리가 오렌지로 데워지기 시작해요
        </h3>
        <p className="font-caption-normal text-gray-7 mt-2">
          제대로 푼 문제만 트리를 채워요. 찍은 건 반영하지 않아요.
        </p>
        <Link
          href={PRIVATE.TREE.INDEX}
          className="bg-orange-7 hover:bg-orange-8 border-gray-11 mt-4 rounded-lg border px-5 py-3 text-sm font-bold text-white"
        >
          첫 진단 1세트 풀고 내 트리 깨우기 (+0xp)
        </Link>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center',
        className
      )}
      aria-label={`성장 레벨 ${growth.level}, ${growth.streakDays}일 연속`}
      data-testid="student-growth-band"
    >
      <div className="flex shrink-0 flex-col items-center gap-2">
        <WeaknessTreeMiniGrid cells={growth.weaknessTreeCells} />
        <span className="font-caption-heading text-gray-7">
          정복도 {growth.overallMasteryPercent}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="text-gray-12 text-2xl font-extrabold">
            Lv.{growth.level}
          </h3>
          <span className="font-caption-normal text-gray-7">
            수학 정복도 {growth.overallMasteryPercent}% · {growth.daysGrown}
            일째 성장
          </span>
        </div>
        <p className="text-orange-7 mt-1 flex items-center gap-1.5 text-sm font-bold">
          <Flame
            size={17}
            aria-hidden
          />
          {growth.streakDays}일 연속
          {growth.streakDays > 0 && (
            <span className="font-caption-normal text-gray-8">
              · 오늘 안 하면 끊겨요
            </span>
          )}
        </p>
        <div
          className="bg-gray-2 mt-3 h-2 w-full max-w-md overflow-hidden rounded-full"
          role="progressbar"
          aria-label="다음 레벨 경험치"
          aria-valuemin={0}
          aria-valuemax={growth.xpToNextLevel}
          aria-valuenow={growth.xp}
          data-testid="student-growth-xp-bar"
        >
          <div
            className="bg-orange-7 h-full rounded-full"
            style={{ width: `${xpRatio}%` }}
          />
        </div>
        <p className="font-caption-normal text-gray-7 mt-1 tabular-nums">
          {growth.xp} / {growth.xpToNextLevel} xp · 누적{' '}
          {growth.totalExperience} xp
        </p>
        <p className="border-gray-3 bg-gray-1 font-caption-normal text-gray-7 mt-3 rounded-lg border px-3 py-2 leading-relaxed">
          자력 정답으로 쌓인 단원 숙련도 평균입니다. 셀은 0·1–33·34–66·67–100의
          네 농도로 표시합니다.
        </p>
      </div>
    </section>
  );
};
