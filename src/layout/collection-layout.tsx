import React from 'react';

import { DataList } from '@/shared/components/ui/data-list';
import { cn } from '@/shared/lib';

type CollectionLayoutProps = React.ComponentPropsWithRef<'section'> & {
  children: React.ReactNode;
  emptyState: React.ReactNode;
  maxVisibleItems?: number;
  defaultExpanded?: boolean;
  expandLabel?: string;
  collapseLabel?: string;
};

export const CollectionLayout = ({
  children,
  emptyState,
  maxVisibleItems,
  defaultExpanded,
  expandLabel,
  collapseLabel,
  className,
  ...props
}: CollectionLayoutProps) => (
  <section
    className={cn('min-w-0', className)}
    {...props}
  >
    <DataList
      emptyState={emptyState}
      maxVisibleItems={maxVisibleItems}
      defaultExpanded={defaultExpanded}
      expandLabel={expandLabel}
      collapseLabel={collapseLabel}
    >
      {children}
    </DataList>
  </section>
);
