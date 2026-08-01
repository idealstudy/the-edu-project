'use client';

import type { GrowthStage } from '@/entities/growth';
import { useStudentGrowthQuery } from '@/features/dashboard/hooks/use-growth-query';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { Flame, RefreshCw } from 'lucide-react';

import { TreeIcon } from '../growth/tree-icon';

type Props = {
  className?: string;
};

const STAGE_COPY: Record<GrowthStage, { label: string; description: string }> =
  {
    HEALTHY: {
      label: '건강',
      description: '오늘도 기록을 이어가고 있어요',
    },
    WILTING: {
      label: '조금 시듦',
      description: '오늘 기록하면 바로 건강해져요',
    },
    WITHERED: {
      label: '많이 시듦',
      description: '기록을 다시 시작하면 한 단계씩 회복해요',
    },
    DORMANT: {
      label: '휴면',
      description: '나무와 경험치는 그대로예요. 다시 깨워보세요',
    },
  };

const GrowthBandLoading = ({ className }: Props) => (
  <section
    className={cn(
      'bg-gray-white border-gray-4 flex items-center gap-4 rounded-2xl border px-5.5 py-3.5',
      className
    )}
    data-testid="student-growth-loading"
  >
    <Skeleton.Block className="size-10 shrink-0 rounded-full" />
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <Skeleton.Block className="h-4 w-40" />
      <Skeleton.Block className="h-2 w-full" />
    </div>
  </section>
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
          'bg-gray-white border-gray-4 flex flex-wrap items-center gap-3 rounded-2xl border px-5.5 py-4',
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
            온도나무를 불러오지 못했어요
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
  const stageCopy = STAGE_COPY[growth.stage];
  const xpRatio = Math.min(
    100,
    Math.round((growth.xp / growth.xpToNextLevel) * 100)
  );
  const isWilting = growth.stage !== 'HEALTHY';

  return (
    <section
      className={cn(
        'tablet:flex-nowrap flex flex-wrap items-center gap-x-4.5 gap-y-3 rounded-2xl border px-5.5 py-3.5',
        isWilting ? 'bg-gray-1 border-gray-3' : 'bg-gray-white border-gray-4',
        className
      )}
      aria-label={`온도나무 ${stageCopy.label}`}
      data-testid="student-growth-band"
    >
      <TreeIcon
        stage={growth.stage}
        size={42}
      />
      <div className="tablet:flex tablet:items-center tablet:gap-4 min-w-0 flex-1">
        <div className="shrink-0">
          <p
            className={cn(
              'font-body2-heading whitespace-nowrap',
              isWilting ? 'text-gray-9' : 'text-gray-12'
            )}
          >
            온도나무 Lv.{growth.level}
            <span className="font-caption-normal text-gray-8 ml-1.5">
              · {growth.daysGrown}일째
            </span>
          </p>
          <p className="font-caption-normal text-gray-8 mt-0.5">
            {stageCopy.label} · {stageCopy.description}
          </p>
        </div>
        <div className="tablet:mt-0 mt-2 min-w-0 flex-1">
          <div
            className="bg-gray-2 h-2 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-label="다음 레벨 경험치"
            aria-valuemin={0}
            aria-valuemax={growth.xpToNextLevel}
            aria-valuenow={growth.xp}
          >
            <div
              className="bg-orange-7 h-full rounded-full"
              style={{ width: `${xpRatio}%` }}
            />
          </div>
          <p className="font-caption-normal text-gray-8 mt-1 tabular-nums">
            {growth.xp} / {growth.xpToNextLevel} xp · 누적{' '}
            {growth.totalExperience} xp
          </p>
        </div>
      </div>
      <div className="tablet:ml-0 ml-14 flex shrink-0 items-center gap-4">
        {isWilting && (
          <span className="font-caption-heading text-gray-8 whitespace-nowrap">
            시듦 {growth.wiltingDays}일
          </span>
        )}
        <span className="text-orange-7 font-body2-heading flex items-center gap-1 whitespace-nowrap">
          <Flame
            size={17}
            aria-hidden
          />
          {growth.streakDays}일
          <span className="font-caption-normal text-gray-8">연속</span>
        </span>
      </div>
    </section>
  );
};
