'use client';

import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib';

/* ─────────────────────────────────────────────────────
 * 온보딩 큰 CTA — 오렌지 box-shadow(눌리는 느낌, B 액센트)
 *  variant: primary(오렌지) / ghost(흰 보조)
 *  주요 CTA 한정 box-shadow 0 5px 0 var(--orange-10).
 * ────────────────────────────────────────────────────*/
type CtaButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'ghost';
};

export const CtaButton = ({
  variant = 'primary',
  className,
  disabled,
  children,
  ...props
}: CtaButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      'font-body1-heading block w-full rounded-[12px] py-4 text-center tracking-tight transition-transform',
      'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      'active:translate-y-[2px]',
      variant === 'primary' &&
        'bg-key-color-primary text-white shadow-[0_5px_0_var(--color-orange-10)]',
      variant === 'ghost' &&
        'border-line-line1 text-text-sub2 border bg-white',
      disabled &&
        'pointer-events-none translate-y-0 bg-background-inactive text-white shadow-[0_5px_0_#cfcdc9]',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
