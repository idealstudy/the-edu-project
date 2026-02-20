import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

interface SkeletonGridProps {
  count?: number;
  gridClassName: string;
  renderItem: (index: number) => ReactNode;
}

export function SkeletonGrid({
  count = 16,
  gridClassName,
  renderItem,
}: SkeletonGridProps) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderItem(index)}</div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn('animate-pulse rounded bg-gray-100', className)} />;
}
