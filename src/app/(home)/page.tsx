import type { Metadata } from 'next';

import { ChallengeListClient } from '@/features/open-challenge/components/list/challenge-list-client';
import OpenChallengeShell from '@/features/open-challenge/components/open-challenge-shell';
import { PortalConsultCta } from '@/features/home/components/portal-consult-cta';
import { PortalHero } from '@/features/home/components/portal-hero';
import { PortalMentorTeaser } from '@/features/home/components/portal-mentor-teaser';
import { PortalPopularPosts } from '@/features/home/components/portal-popular-posts';
import { PageViewTracker } from '@/shared/components/analytics';

// MVP-G 공개 포털 홈 — frd-public-portal-v1 §4.1 모듈 순서(모바일 고정,
// v8 계승): 히어로 → 오늘의 오픈챌린지 → 인기 글 → 상담소 → 대표 멘토.
// 오늘의 오픈챌린지는 기존 OpenChallengeShell/ChallengeListClient를
// 100% 그대로 재사용한다(신규 구현 0) — id="today-challenge"로 히어로
// CTA의 스크롤 타깃만 새로 건다.
export const metadata: Metadata = {
  title: '디에듀 | 오늘 한 문제, 또는 비공개 상담',
  description:
    '디에듀 AI 코치와 함께 문제를 제대로 풀어보세요. 고민이 있다면 비공개로 상담을 신청할 수 있어요.',
};

type HomePageProps = {
  searchParams: Promise<{ sort?: string; page?: string }>;
};

const parseSort = (value?: string) => {
  if (value === 'popular') return value;
  return 'latest';
};

const parsePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sort, page } = await searchParams;

  return (
    <>
      <PageViewTracker pageName="open-challenge" />
      <PortalHero />
      <div id="today-challenge">
        <OpenChallengeShell>
          <ChallengeListClient
            sort={parseSort(sort)}
            page={parsePage(page)}
          />
        </OpenChallengeShell>
      </div>
      <PortalPopularPosts />
      <PortalConsultCta />
      <PortalMentorTeaser />
    </>
  );
}
