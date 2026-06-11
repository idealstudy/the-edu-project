'use client';

import Link from 'next/link';

import { LevelBadgeConnected } from '@/features/level';
import { useMyPointWalletQuery } from '@/features/point/hooks/use-point';
import { PRIVATE } from '@/shared/constants';
import { ChevronRight, Wallet } from 'lucide-react';

/* ─────────────────────────────────────────────────────
 * 포인트 요약 카드 (학습 허브)
 *  entities/point 재사용 — 잔액(소모 화폐) + 레벨(성장 지표, 축 분리).
 *  상세 내역은 /points 로 위임("내역 보기").
 * ────────────────────────────────────────────────────*/
export const PointSummaryCard = () => {
  const { data, isLoading, isError } = useMyPointWalletQuery();
  const balance = data?.balance ?? 0;

  return (
    <section
      className="flex flex-col gap-4 md:flex-row md:items-stretch"
      aria-label="포인트 요약"
    >
      <div className="border-line-line1 bg-orange-1 flex flex-1 flex-col gap-2 rounded-[12px] border p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet
              size={18}
              className="text-orange-7"
              aria-hidden
            />
            <span className="font-caption-heading text-text-sub1">
              내 포인트 잔액
            </span>
          </div>
          <Link
            href={PRIVATE.POINTS.INDEX}
            className="font-caption-heading text-orange-7 inline-flex h-11 items-center gap-0.5 hover:underline"
          >
            내역 보기
            <ChevronRight
              size={14}
              aria-hidden
            />
          </Link>
        </div>

        {isError ? (
          <p className="font-body2-normal text-text-sub2 py-2">
            포인트를 불러오지 못했어요.
          </p>
        ) : (
          <p className="font-title-heading text-text-main tabular-nums">
            {isLoading ? '—' : balance.toLocaleString('ko-KR')}
            <span className="font-headline1-heading text-orange-7 ml-1">P</span>
          </p>
        )}

        <p className="font-caption-normal text-text-sub1 leading-relaxed">
          제대로 풀어 모으고, 정답 해설을 열면 차감되는 소모 화폐예요.
        </p>
      </div>

      {/* 레벨 — 포인트와 다른 축(성장 지표) */}
      <div className="w-full md:w-[300px] md:shrink-0">
        <LevelBadgeConnected />
      </div>
    </section>
  );
};
