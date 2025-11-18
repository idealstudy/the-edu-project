'use client';

import React from 'react';

import { useDashboardQuery } from '@/features/dashboard';
import { DashboardSummaryCard } from '@/features/dashboard/components/dashboard-card';
import { DashboardContents } from '@/features/dashboard/components/dashboard-contents';
import { ContentsCard } from '@/features/dashboard/components/dashboard-contents-card';
import { DashboardCtx } from '@/features/dashboard/components/dashboard-ctx';
import {
  MY_STUDY_ROOMS,
  RECENT_STUDY_NOTES,
  SUMMARY_CARDS,
} from '@/features/dashboard/mock';
import { PRIVATE } from '@/shared/constants';

/* ─────────────────────────────────────────────────────
 * 테스트용 플래그
 * ────────────────────────────────────────────────────*/
const ALERT_KEY = 'dashboard_welcome_alert_shown';
export const DashboardContainer = () => {
  // [CRITICAL TODO: API 구현 누락] useDashboardQuery의 데이터(data)를 사용할 수 있도록 백엔드 API 및 바인딩 작업을 즉시 진행해야 합니다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, isLoading, isError } = useDashboardQuery();

  React.useEffect(() => {
    const hasShown = sessionStorage.getItem(ALERT_KEY);
    if (!hasShown) {
      alert(
        '선생님, 환영합니다! 개인 정보 바인딩은 다음 업데이트를 통해 제공될 예정입니다.'
      );
      sessionStorage.setItem(ALERT_KEY, 'true');
    }
  }, []);

  return (
    <div className="bg-system-background">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-6 pt-12 pb-24">
        {/* 대시보드 헤더 */}
        <section className="rounded-[32px] bg-white p-10 shadow-[0_24px_48px_rgba(255,72,5,0.08)]">
          <p className="text-text-sub2 text-sm">
            오늘은 학생들과 함께 성장하는 하루에요
          </p>
          <h1 className="text-text-main mt-2 text-[32px] leading-[140%] font-bold tracking-[-0.04em]">
            디에듀 선생님 안녕하세요!
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUMMARY_CARDS.map((card) => (
              <DashboardSummaryCard
                key={card.id}
                card={card}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <DashboardContents
            title="내 스터디룸"
            description="오늘도 학생들과 함께할 준비가 끝났어요"
            buttonText="새로 만들기"
            buttonHref={PRIVATE.ROOM.CREATE}
            buttonVariant="primary"
          >
            {MY_STUDY_ROOMS.map((room) => (
              <ContentsCard.Room
                key={room.id}
                room={room}
              />
            ))}
          </DashboardContents>
          <DashboardContents
            title="최근 수업노트"
            description="다시 확인하고 싶은 수업 기록을 모아봤어요"
            buttonText="전체보기"
            buttonHref={PRIVATE.DASHBOARD.INDEX}
            buttonVariant="outlined"
          >
            {RECENT_STUDY_NOTES.map((note) => (
              <ContentsCard.Note
                key={note.id}
                note={note}
              />
            ))}
          </DashboardContents>
        </div>

        <DashboardCtx />
      </div>
    </div>
  );
};
