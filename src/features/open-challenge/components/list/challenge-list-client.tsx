'use client';

import { useEffect, useRef, useTransition } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { type RecommendedChallengeItem } from '@/entities/open-challenge';
import { useSession } from '@/providers/session/session-context';
import { Pagination } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { trackOcLand } from '@/shared/lib/analytics';
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Inbox,
  MapPinned,
} from 'lucide-react';

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
  const { status: sessionStatus } = useSession();
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
      {page === 1 &&
        topRecommended &&
        (sessionStatus === 'unauthenticated' ? (
          <GuestChallengeLanding challenge={topRecommended} />
        ) : (
          <RecommendedChallengeCard challenge={topRecommended} />
        ))}
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

/**
 * 비로그인 방문자는 추천 API가 내려준 실제 통계로만 첫 문제의 난도를 체감한다.
 * 등급별 분포·친구 비교는 해당 데이터 계약이 없으므로 이 표면에 만들지 않는다.
 */
const GuestChallengeLanding = ({
  challenge,
}: {
  challenge: RecommendedChallengeItem;
}) => {
  const passRate = Math.max(0, Math.min(100, 100 - challenge.wrongAnswerRate));

  return (
    <section
      aria-label="오늘의 오픈챌린지"
      className="bg-gray-11 mb-8 overflow-hidden rounded-2xl text-white shadow-[0_14px_34px_rgba(28,26,25,0.2)]"
    >
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-center lg:p-10">
        <div>
          <p className="text-orange-4 flex items-center gap-2 text-sm font-bold tracking-wide">
            <ChartNoAxesColumnIncreasing
              size={17}
              aria-hidden
            />
            오늘의 오픈챌린지 · 실제 참여 집계
          </p>
          <p className="mt-5 text-5xl leading-none font-black tracking-[-0.06em] tabular-nums sm:text-6xl">
            {challenge.wrongAnswerRate}%
          </p>
          <h2 className="mt-2 text-2xl leading-tight font-extrabold text-balance sm:text-3xl">
            가 이 문제를 틀렸습니다.
          </h2>
          <p className="text-gray-3 mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            지금까지 {challenge.participantCount.toLocaleString()}명이 도전했고,
            {` ${passRate}%`}만 정답을 골랐어요. 너는 어디에 들지 직접 확인해
            봐.
          </p>
          <p className="text-gray-5 mt-3 text-sm">
            {challenge.sourceText} · 누적 문제 참여 기준
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="large"
              className="w-full sm:w-auto"
            >
              <Link href={PUBLIC.OPEN_CHALLENGE.DETAIL(challenge.id)}>
                문제 먼저 보기
                <ArrowRight
                  className="ml-1"
                  size={18}
                  aria-hidden
                />
              </Link>
            </Button>
            <p className="text-gray-4 text-sm font-medium">
              풀이 기록과 결과 저장은 로그인 후 가능해요.
            </p>
          </div>
        </div>

        <div className="text-text-main rounded-xl bg-white p-4 sm:p-5">
          <div className="bg-orange-1 relative flex min-h-[178px] items-center justify-center overflow-hidden rounded-lg p-4">
            {challenge.questionImageUrl ? (
              <Image
                src={challenge.questionImageUrl}
                alt={`${challenge.sourceText} 문제 미리보기`}
                width={320}
                height={180}
                className="max-h-[180px] w-full object-contain"
              />
            ) : (
              <p className="max-w-[260px] text-center text-lg leading-relaxed font-bold text-balance">
                {challenge.title}
              </p>
            )}
            <span className="bg-gray-11 absolute top-3 left-3 rounded-md px-2 py-1 text-xs font-bold text-white">
              선택지는 다음 화면에서
            </span>
          </div>

          <div className="bg-gray-1 mt-4 flex items-center gap-3 rounded-lg px-4 py-3">
            <MapPinned
              className="text-orange-7 shrink-0"
              size={20}
              aria-hidden
            />
            <p className="text-sm leading-relaxed font-medium">
              문제 하나를 풀면, 결과가 네 약점 지도에 기록될 수 있어요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
