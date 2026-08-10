'use client';

import React, { useState } from 'react';

import { cn } from '@/shared/lib';

import { Button } from './button';

type DataListProps = React.ComponentPropsWithRef<'div'> & {
  children: React.ReactNode;
  emptyState: React.ReactNode;
  maxVisibleItems?: number;
  defaultExpanded?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
};

export const DataList = ({
  children,
  emptyState,
  maxVisibleItems,
  defaultExpanded = false,
  expandLabel = '더 보기',
  collapseLabel = '접기',
  className,
  ...props
}: DataListProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const items = React.Children.toArray(children);
  const hasOverflow = Boolean(
    maxVisibleItems && items.length > maxVisibleItems
  );
  const visibleItems =
    hasOverflow && !isExpanded ? items.slice(0, maxVisibleItems) : items;

  if (items.length === 0) return emptyState;

  return (
    <div
      className={cn('min-w-0', className)}
      {...props}
    >
      <div className="gap-row-gap flex min-w-0 flex-col">{visibleItems}</div>
      {hasOverflow && (
        <Button
          variant="outlined"
          size="compact"
          className="mt-block-gap w-full"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded
            ? collapseLabel
            : `${expandLabel} (${items.length - visibleItems.length})`}
        </Button>
      )}
    </div>
  );
};
