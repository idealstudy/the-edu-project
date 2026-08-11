import { cn } from '@/shared/lib';

import styles from './segmented-progress.module.css';

type SegmentedProgressProps = {
  primaryValue: number;
  secondaryValue?: number;
  variant?: 'segments' | 'comparison';
  label: string;
  testId?: string;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export const SegmentedProgress = ({
  primaryValue,
  secondaryValue = 0,
  variant = 'segments',
  label,
  testId,
}: SegmentedProgressProps) => {
  const primary = clampPercent(primaryValue);
  const total = clampPercent(primary + secondaryValue);
  const isComparison = variant === 'comparison';

  return (
    <div
      className={styles.root}
      role="img"
      aria-label={label}
      data-testid={testId}
    >
      <progress
        className={cn(
          styles.progress,
          isComparison ? styles.comparisonBase : styles.segmentBase
        )}
        max={100}
        value={isComparison ? 100 : total}
        aria-hidden
      />
      <progress
        className={cn(
          styles.progress,
          isComparison ? styles.comparisonOverlay : styles.segmentOverlay
        )}
        max={100}
        value={primary}
        aria-hidden
      />
    </div>
  );
};
