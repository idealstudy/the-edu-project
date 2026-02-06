import React from 'react';

import { cn } from '@/shared/lib';

interface SessionContainerProps {
  tag: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}

// 공통 레이아웃 컴포넌트: session 2, 3, 4 적용
export function SessionContainer({
  tag,
  title,
  description,
  children,
}: SessionContainerProps) {
  return (
    <section
      className={cn(
        'flex flex-col items-center gap-6 px-4.5 py-8',
        'tablet:gap-8 tablet:px-20 tablet:py-12'
      )}
    >
      <div className="gap flex flex-col items-center">
        <span
          className={cn(
            'font-body2-heading text-key-color-primary bg-orange-scale-orange-5 mb-4 rounded-lg px-4 py-2',
            'tablet:px-6 tablet:py-3'
          )}
        >
          {tag}
        </span>
        <h2
          className={cn(
            'font-headline2-heading mb-2 text-center',
            'tablet:font-headline1-heading'
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'text-gray-90 font-label-normal text-center',
            'tablet:font-body2-normal'
          )}
        >
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}
