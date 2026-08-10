import React from 'react';

import { cn } from '@/shared/lib';

type SplitLayoutProps = React.ComponentPropsWithRef<'div'> & {
  ratio?: 'v22' | 'agenda' | 'legacy';
};

const RATIO_CLASS: Record<NonNullable<SplitLayoutProps['ratio']>, string> = {
  v22: 'lg:grid-split-v22',
  agenda: 'lg:grid-split-agenda',
  legacy: 'lg:grid-split-legacy',
};

const SplitLayoutRoot = ({
  ratio = 'v22',
  className,
  ...props
}: SplitLayoutProps) => (
  <div
    className={cn(
      'gap-block-gap grid min-w-0 grid-cols-1 items-start',
      RATIO_CLASS[ratio],
      className
    )}
    {...props}
  />
);

const SplitLayoutPane = ({
  className,
  ...props
}: React.ComponentPropsWithRef<'section'>) => (
  <section
    className={cn('min-w-0', className)}
    {...props}
  />
);

export const SplitLayout = Object.assign(SplitLayoutRoot, {
  Pane: SplitLayoutPane,
});
