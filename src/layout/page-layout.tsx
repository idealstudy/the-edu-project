import React from 'react';

import { cn } from '@/shared/lib';
import { Slot } from 'radix-ui';

type PageLayoutProps = React.ComponentPropsWithRef<'main'> & {
  asChild?: boolean;
  width?: 'page' | 'content' | 'fluid';
};

// 토큰 이름은 globals.css `@theme` 의 `--container-*` 와 정확히 일치해야 한다.
// 2026-08-11 발견: 구 이름 `max-w-page-max` · `max-w-content-max` 는 대응 토큰이 없어
// Tailwind 가 규칙을 아예 만들지 않았다(= 폭 제한이 안 걸리는 무효 클래스).
// 실재 토큰은 `--container-page`(1180px) · `--container-content`(1100px).
const WIDTH_CLASS: Record<NonNullable<PageLayoutProps['width']>, string> = {
  page: 'max-w-page',
  content: 'max-w-content',
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
