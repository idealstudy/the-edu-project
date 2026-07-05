'use client';

import { useEffect, useRef, useTransition } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Pagination } from '@/shared/components/ui';
import { trackOcLand } from '@/shared/lib/analytics';
import { Inbox } from 'lucide-react';

import {
  useOpenChallengeListQuery,
  useRecommendedChallengesQuery,
} from '../../hooks/use-open-challenge';
import { ChallengeCard } from './challenge-card';
import { ChallengeListSkeleton } from './challenge-list-skeleton';
import { MotiveHeader } from './motive-header';
import { RecommendedChallengeCard } from './recommended-challenge-card';

type SortOption = 'latest' | 'popular';

const PAGE_SIZE = 12;

type ChallengeListClientProps = {
  sort: SortOption;
  page: number;
};

export const ChallengeListClient = ({
  sort,
  page,
}: ChallengeListClientProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const hasFiredLandRef = useRef(false);

  useEffect(() => {
    if (hasFiredLandRef.current) return;
    hasFiredLandRef.current = true;
    trackOcLand({
      src: searchParams.get('src') ?? 'direct',
      entry_kind: 'normal',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: challenges, isLoading } = useOpenChallengeListQuery({
    subject: 'ALL',
    sort,
  });

  // 오늘의 추천 1문제 — 로그인 등급 정보가 없으면 grade 미지정(오답률순) 호출.
  // 현재 화면엔 과목 필터 UI가 없어 전체 과목으로 추천을 받는다.
  const { data: recommended } = useRecommendedChallengesQuery({
    subject: 'ALL',
  });
  const topRecommended = recommended?.[0];

  const totalPages = Math.ceil((challenges?.length ?? 0) / PAGE_SIZE);
  const visibleChallenges = (challenges ?? []).slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  return (
    <>
      {page === 1 && <MotiveHeader />}
      {page === 1 && topRecommended && (
        <RecommendedChallengeCard challenge={topRecommended} />
      )}
      {isLoading ? (
        <ChallengeListSkeleton />
      ) : (
        <>
          {visibleChallenges.length > 0 ? (
            <div className="grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {visibleChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                />
              ))}
            </div>
          ) : (
            <div className="border-line-line1 flex flex-col items-center gap-2 rounded-xl border bg-white py-16 text-center">
              <Inbox
                size={36}
                className="text-gray-6"
              />
              <p className="font-body1-heading text-text-main">
                아직 등록된 문제가 없어요.
              </p>
              <p className="text-gray-8 text-sm">
                새 문제가 등록되면 이곳에 보여요.
              </p>
            </div>
          )}

          {(challenges?.length ?? 0) > PAGE_SIZE && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-10 justify-center"
            />
          )}
        </>
      )}
    </>
  );
};
