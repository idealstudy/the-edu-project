'use client';

import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { trackHomeStartClick } from '@/shared/lib/analytics';

/**
 * B+A 랜딩 히어로.
 * Thesis: "많이가 아니라 제대로 풀어야 오른다."
 * 절제된 여백(A) + 큰 오렌지 CTA(B).
 */
export function LandingHero() {
  return (
    <section
      className={cn(
        'bg-orange-1 mx-auto flex w-full flex-col items-center gap-6 px-6 py-14 text-center',
        'tablet:gap-8 tablet:py-20',
        'desktop:py-28'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className={cn(
            'font-label-heading text-orange-7 bg-white/70 rounded-full px-4 py-1.5',
            'tablet:font-body2-heading'
          )}
        >
          제대로 푼 만큼 오른다
        </span>
        <h1
          className={cn(
            'font-title-heading text-text-main text-balance',
            'tablet:font-display-2',
            'desktop:font-display-1'
          )}
        >
          많이가 아니라
          <br />
          <em className="text-orange-7 not-italic">제대로</em> 풀어야 오른다
        </h1>
        <p
          className={cn(
            'font-body2-normal text-gray-9 max-w-[34ch] text-balance',
            'tablet:font-body1-normal'
          )}
        >
          제대로 푼 만큼 내 약점 지도가 오렌지로 채워집니다.
          <br className="max-tablet:hidden" />
          막히면 답이 아니라, AI 코치와 한 걸음씩.
        </p>
      </div>

      <div className={cn('flex w-full flex-col gap-2', 'tablet:w-auto tablet:flex-row tablet:gap-3')}>
        <Button
          size="large"
          asChild
          className="shadow-[0_5px_0_var(--orange-10)] active:translate-y-[2px] active:shadow-[0_3px_0_var(--orange-10)]"
        >
          <Link
            href={PUBLIC.OPEN_CHALLENGE.LIST}
            onClick={trackHomeStartClick}
          >
            문제 풀어보기
          </Link>
        </Button>
        <Button
          variant="secondary"
          size="large"
          asChild
        >
          <Link href={PUBLIC.CORE.SIGNUP}>디에듀 시작하기</Link>
        </Button>
      </div>
    </section>
  );
}
