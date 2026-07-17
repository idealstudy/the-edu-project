import type { Metadata } from 'next';

import { ChallengeListClient } from '@/features/open-challenge/components/list/challenge-list-client';
import OpenChallengeShell from '@/features/open-challenge/components/open-challenge-shell';
import { PageViewTracker } from '@/shared/components/analytics';

// MVP-G 공개 포털: 오픈챌린지 도메인을 /challenges 문으로도 노출한다.
// 화면·데이터 로직은 기존 사이트 메인('/')과 100% 동일 컴포넌트 재사용 —
// 신규 구현 0 (frd-public-portal-v1 §6.1, api-contract §5).
export const metadata: Metadata = {
  title: '오늘의 문제 | 디에듀',
  description:
    '디에듀 AI 코치와 함께 문제를 제대로 풀어보세요. 제대로 푼 만큼 약점 지도가 채워집니다.',
};

type ChallengesPageProps = {
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

export default async function ChallengesPage({
  searchParams,
}: ChallengesPageProps) {
  const { sort, page } = await searchParams;

  return (
    <>
      <PageViewTracker pageName="challenges" />
      <OpenChallengeShell>
        <ChallengeListClient
          sort={parseSort(sort)}
          page={parsePage(page)}
        />
      </OpenChallengeShell>
    </>
  );
}
