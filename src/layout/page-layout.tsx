import React from 'react';

import { cn } from '@/shared/lib';
import { Slot } from 'radix-ui';

type PageLayoutProps = React.ComponentPropsWithRef<'main'> & {
  asChild?: boolean;
  width?: 'page' | 'content' | 'fluid';
};

const WIDTH_CLASS: Record<NonNullable<PageLayoutProps['width']>, string> = {
  page: 'max-w-page-max',
  content: 'max-w-content-max',
  fluid: 'max-w-none',
};

const PageLayoutRoot = ({
  asChild = false,
  width = 'page',
  className,
  children,
  ...props
}: PageLayoutProps) => {
  const Component = asChild ? Slot.Root : 'main';

  return (
    <Component
      className={cn(
        'px-section-gap py-section-gap mx-auto w-full min-w-0',
        WIDTH_CLASS[width],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const PageLayoutHeader = ({
  className,
  ...props
}: React.ComponentPropsWithRef<'header'>) => (
  <header
    className={cn(
      'mb-section-gap gap-content-gap flex min-w-0 flex-wrap items-center',
      className
    )}
    {...props}
  />
);

const PageLayoutContent = ({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) => (
  <div
    className={cn('gap-section-gap flex min-w-0 flex-col', className)}
    {...props}
  />
);

export const PageLayout = Object.assign(PageLayoutRoot, {
  Header: PageLayoutHeader,
  Content: PageLayoutContent,
});
