'use client';

import React from 'react';

import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { ROUTE } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';

const MARKETING_ASSETS = {
  SPOTLIGHT: {
    badge: 'marketing spotlight',
    title: '학부모에게 알려야 할 디에듀, 우리가 함께 준비했어요',
    description:
      '소개서, 홍보 이미지, 문구 템플릿까지 한 번에 모아둔 티에듀 마케팅 키트를 내려받고 바로 공유해 보세요. 첫 인상을 결정짓는 메시지와 디자인을 대신 고민했습니다.',
    buttons: [
      {
        text: '홍보자료 내려받기',
        href: ROUTE.DASHBOARD.HOME,
        variant: 'primary',
      },
      {
        text: '체험 수업 초대 링크 만들기',
        href: ROUTE.DASHBOARD.HOME,
        variant: 'secondary',
      },
    ],
  },
};

const CTA_STYLING =
  'relative overflow-hidden rounded-[32px] bg-gradient-to-r from-orange-scale-orange-40 to-orange-scale-orange-50 text-white shadow-[0_24px_48px_rgba(255,72,5,0.35)]';

export const DashboardCtx = () => {
  return (
    <section
      className={cn(CTA_STYLING, 'p-10')}
      aria-labelledby="dashboard-cta-title"
    >
      <div className="relative z-[1] flex flex-col gap-5 text-left">
        <p className="text-sm font-semibold tracking-[0.24em] text-white/80 uppercase">
          {MARKETING_ASSETS.SPOTLIGHT.badge}
        </p>
        <h2
          id="dashboard-cta-title"
          className="text-[28px] leading-[140%] font-bold tracking-[-0.04em]"
        >
          {MARKETING_ASSETS.SPOTLIGHT.title}
        </h2>
        <p className="max-w-[560px] text-base leading-[160%] text-white/90">
          {MARKETING_ASSETS.SPOTLIGHT.description}
        </p>
        <div className="flex flex-wrap gap-3">
          {MARKETING_ASSETS.SPOTLIGHT.buttons.map((btn, index) => (
            <Button
              key={index}
              size="medium"
              className={cn(
                'border-none',
                btn.variant === 'primary' &&
                  'text-key-color-primary hover:bg-gray-scale-gray-5 bg-white',
                btn.variant === 'secondary' &&
                  'bg-key-color-primary/10 border-white/40 text-white hover:border-white hover:bg-white/10'
              )}
              variant={btn.variant === 'secondary' ? 'outlined' : 'primary'}
              onClick={(e) => {
                e.preventDefault();
                alert(
                  '해당 기능은 곧 만날 수 있어요! 다음 업데이트를 기대해주세요.'
                );
              }}
              asChild
            >
              <Link href={btn.href}>{btn.text}</Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 -right-6 bottom-0 hidden w-1/3 rotate-3 bg-white/10 blur-3xl lg:block" />
    </section>
  );
};
