'use client';

import { type PointTransactionView } from '@/entities/point';
import { LevelBadgeConnected } from '@/features/level';
import { ArrowDownRight, ArrowUpRight, TriangleAlert, Wallet } from 'lucide-react';

import { useMyPointWalletQuery } from '../hooks/use-point';
import { PointWalletSkeleton } from './point-wallet-skeleton';

/* ─────────────────────────────────────────────────────
 * 발생 시각 → 한국어 날짜 라벨
 * ────────────────────────────────────────────────────*/
const formatDate = (regDate: string): string => {
  const parsed = new Date(regDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/* ─────────────────────────────────────────────────────
 * 거래 1건 (타임라인 행)
 *  +적립=오렌지 / −차감=그레이. 사유는 한글 라벨.
 * ────────────────────────────────────────────────────*/
const TransactionRow = ({
  transaction,
}: {
  transaction: PointTransactionView;
}) => {
  const { earn, amount, reasonLabel, regDate } = transaction;

  return (
    <li className="border-line-line1 flex items-center gap-3 border-t py-3 first:border-t-0">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          earn ? 'bg-orange-1' : 'bg-gray-1'
        }`}
      >
        {earn ? (
          <ArrowUpRight
            size={18}
            className="text-orange-7"
            aria-hidden
          />
        ) : (
          <ArrowDownRight
            size={18}
            className="text-gray-7"
            aria-hidden
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-body2-heading text-text-main truncate">
          {reasonLabel}
        </span>
        {regDate && (
          <span className="font-caption-normal text-text-sub2 tabular-nums">
            {formatDate(regDate)}
          </span>
        )}
      </div>

      <span
        className={`font-body2-heading shrink-0 tabular-nums ${
          earn ? 'text-orange-7' : 'text-text-sub1'
        }`}
      >
        {earn ? '+' : '−'}
        {Math.abs(amount)}P
      </span>
    </li>
  );
};

/* ─────────────────────────────────────────────────────
 * 포인트 지갑 화면 클라이언트
 *  로딩 / 에러 / 빈(거래 0건) / 정상 4상태.
 *  잔액 히어로(큰 숫자) + "포인트=소모 화폐" 설명 + 적립/차감 타임라인.
 *  레벨(성장 지표)은 별도 축으로 시각 분리.
 * ────────────────────────────────────────────────────*/
export const PointWalletClient = () => {
  const { data, isLoading, isError, refetch } = useMyPointWalletQuery();

  if (isLoading) {
    return <PointWalletSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-line-line1 flex flex-col items-center gap-3 rounded-[12px] border bg-white py-16 text-center">
        <TriangleAlert
          size={32}
          className="text-system-warning"
          aria-hidden
        />
        <p className="font-body1-heading text-text-main">
          포인트 지갑을 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="bg-key-color-primary font-label-heading mt-1 flex h-11 items-center rounded-[8px] px-5 text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const balance = data?.balance ?? 0;
  const transactions = data?.transactions ?? [];

  return (
    <div className="flex flex-col gap-6 min-[1200px]:flex-row min-[1200px]:items-start">
      <div className="flex flex-1 flex-col gap-6">
        {/* 잔액 히어로 */}
        <section
          className="bg-orange-1 border-line-line1 flex flex-col gap-2 rounded-[12px] border p-6"
          aria-label="포인트 잔액"
        >
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
          <p className="font-title-heading text-text-main tabular-nums">
            {balance.toLocaleString('ko-KR')}
            <span className="font-headline1-heading text-orange-7 ml-1">P</span>
          </p>
          <p className="font-caption-normal text-text-sub1 leading-relaxed">
            포인트는 모았다가 쓰는 소모 화폐예요. 자력으로 정답을 맞히거나
            연속으로 학습하면 쌓이고, 정답 해설을 열어보면 차감돼요.
          </p>
        </section>

        {/* 적립/차감 타임라인 */}
        <section
          className="border-line-line1 flex flex-col gap-3 rounded-[12px] border bg-white p-5"
          aria-label="포인트 적립·차감 내역"
        >
          <h2 className="font-body1-heading text-text-main">적립·차감 내역</h2>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="bg-gray-1 flex h-12 w-12 items-center justify-center rounded-full">
                <Wallet
                  size={22}
                  className="text-gray-7"
                  aria-hidden
                />
              </div>
              <p className="font-body2-heading text-text-main text-balance">
                아직 포인트 내역이 없어요.
              </p>
              <p className="font-caption-normal text-text-sub2 max-w-[280px] text-balance">
                첫 문제를 제대로 풀면 포인트가 쌓이기 시작해요.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {transactions.map((transaction, index) => (
                <TransactionRow
                  key={`${transaction.regDate}-${transaction.type}-${index}`}
                  transaction={transaction}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 레벨 (성장 지표 — 포인트와 다른 축) */}
      <div className="w-full shrink-0 min-[1200px]:w-[300px]">
        <LevelBadgeConnected />
      </div>
    </div>
  );
};
