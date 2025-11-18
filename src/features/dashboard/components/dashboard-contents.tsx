'use client';

import React from 'react';

import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface DashboardContentsProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  buttonVariant: 'primary' | 'secondary' | 'outlined';
  children: React.ReactNode;
}

export const DashboardContents = ({
  title,
  description,
  buttonText,
  buttonHref,
  buttonVariant,
  children,
}: DashboardContentsProps) => {
  return (
    <section className="flex h-full flex-col rounded-[32px] bg-white p-8 shadow-[0_24px_48px_rgba(15,23,42,0.06)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-text-main text-[24px] leading-[140%] font-semibold tracking-[-0.04em]">
            {title}
          </h2>
          <p className="text-text-sub2 text-sm">{description}</p>
        </div>
        <Button
          size="xsmall"
          variant={buttonVariant}
          className={cn(buttonVariant === 'primary' && 'border-none')}
          onClick={(e) => {
            if (buttonText === '전체보기') {
              e.preventDefault();
              alert(
                '해당 기능은 곧 만날 수 있어요! 다음 업데이트를 기대해주세요.'
              );
            }
          }}
          asChild
        >
          <Link href={buttonHref}>{buttonText}</Link>
        </Button>
      </header>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </section>
  );
};
