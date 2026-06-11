import type { Metadata } from 'next';

import { ChallengeListClient } from '@/features/open-challenge/components/list/challenge-list-client';
import OpenChallengeShell from '@/features/open-challenge/components/open-challenge-shell';
import { PageViewTracker } from '@/shared/components/analytics';

export const metadata: Metadata = {
  title: '오픈챌린지 | 디에듀',
  description:
    '디에듀 AI 코치와 함께 문제를 제대로 풀어보세요. 제대로 푼 만큼 약점 지도가 채워집니다.',
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
      <OpenChallengeShell>
        <ChallengeListClient
          sort={parseSort(sort)}
          page={parsePage(page)}
        />
      </OpenChallengeShell>
    </>
  );
}
