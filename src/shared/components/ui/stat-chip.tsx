import React from 'react';

import { cn } from '@/shared/lib';

type StatChipProps = React.ComponentPropsWithRef<'div'> & {
  label: string;
  value: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
};

const TONE_CLASS: Record<NonNullable<StatChipProps['tone']>, string> = {
  neutral: 'border-line-line1 bg-white text-text-main',
  brand: 'border-orange-3 bg-orange-1 text-orange-11',
  success: 'border-system-success bg-system-success-alt text-system-success',
  warning: 'border-system-warning bg-system-warning-alt text-system-warning',
};

export const StatChip = ({
  label,
  value,
  tone = 'neutral',
  className,
  ...props
}: StatChipProps) => (
  <div
    className={cn(
      'min-h-chip-min rounded-pill px-card-pad gap-inline-gap inline-flex max-w-full min-w-0 items-center border',
      TONE_CLASS[tone],
      className
    )}
    {...props}
  >
    <span className="font-caption-normal text-single-line">{label}</span>
    <strong className="font-caption-heading numeric-tabular shrink-0">
      {value}
    </strong>
  </div>
);
