'use client';

import { DashboardSummaryCardProps } from '@/features/dashboard/types';
import { cn } from '@/shared/lib/utils';

export const DashboardSummaryCard = ({ card }: DashboardSummaryCardProps) => {
  const IconComponent = card.icon;

  return (
    <article
      className={cn(
        'text-text-main relative flex h-full flex-col gap-3 rounded-[28px] border border-transparent p-6 transition-shadow duration-200',
        card.accentClassName
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          {card.badge ? (
            <span
              className={cn(
                'text-text-main/80 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
                card.badge.className
              )}
            >
              {card.badge.label}
            </span>
          ) : null}
          <p className="text-text-sub2 text-sm">{card.description}</p>
          <h3 className="text-text-main text-lg font-semibold">{card.title}</h3>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full text-lg',
            card.iconClassName
          )}
        >
          <IconComponent
            aria-hidden
            className="h-6 w-6"
          />
        </div>
      </div>
      <p className="text-text-main mt-auto text-[36px] leading-[120%] font-bold tracking-[-0.04em]">
        {card.value}
      </p>
    </article>
  );
};
