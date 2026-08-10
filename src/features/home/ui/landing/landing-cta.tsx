'use client';

import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { trackHomeStartClick } from '@/shared/lib/analytics';

// 랜딩 마무리 CTA.
export function LandingCta() {
  return (
    <section
      className={cn(
        'bg-gray-12 mx-auto flex w-full flex-col items-center gap-6 px-6 py-16 text-center',
        'tablet:py-20'
      )}
    >
      <h2
        className={cn(
          'font-headline1-heading text-balance text-white',
          'tablet:font-title-heading'
        )}
      >
        오늘의 한 문제부터.
      </h2>
      <p className="font-label-normal text-gray-5 tablet:font-body2-normal">
        많이가 아니라, 제대로. 지금 한 문제를 제대로 풀어보세요.
      </p>
      <Button
        size="large"
        asChild
        className="shadow-[0_5px_0_var(--orange-10)] active:translate-y-0.5 active:shadow-[0_3px_0_var(--orange-10)]"
      >
        <Link
          href={PUBLIC.OPEN_CHALLENGE.LIST}
          onClick={trackHomeStartClick}
        >
          문제 풀어보기
        </Link>
      </Button>
    </section>
  );
}
