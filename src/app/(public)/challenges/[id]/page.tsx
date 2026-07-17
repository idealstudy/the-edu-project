import { redirect } from 'next/navigation';

import { PUBLIC } from '@/shared/constants';

// /challenges/:id 는 기존 /open-challenge/:id(풀이 세션·AI 코치 상태가 이미
// 결선된 경로)로 정합 리다이렉트한다. route.ts CHALLENGES.DETAIL 주석 참조.
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChallengeDetailRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(PUBLIC.CHALLENGES.DETAIL(id));
}
