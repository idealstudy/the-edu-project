import type { ReactNode } from 'react';

import { cn } from '@/shared/lib';

/* ─────────────────────────────────────────────────────
 * 스텝 질문 헤더 — 큰 질문 + 보조 설명
 *  강조어는 <em>(오렌지)로. text-wrap:balance.
 * ────────────────────────────────────────────────────*/
type QuestionHeaderProps = {
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
};

export const QuestionHeader = ({
  title,
  sub,
  className,
}: QuestionHeaderProps) => (
  <div className={cn('flex flex-col gap-2.5', className)}>
    <h1 className="font-title-heading text-text-main text-balance leading-[1.35] [&_em]:text-key-color-primary [&_em]:not-italic">
      {title}
    </h1>
    {sub && (
      <p className="font-label-normal text-text-sub2 leading-relaxed [&_b]:text-orange-10 [&_b]:font-semibold">
        {sub}
      </p>
    )}
  </div>
);
