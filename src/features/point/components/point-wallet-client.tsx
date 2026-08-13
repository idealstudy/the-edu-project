'use client';

import { type ReactNode, useState } from 'react';

import Link from 'next/link';

import { type PointTransactionView } from '@/entities/point';
import { LevelBadgeConnected } from '@/features/level';
import { Button, Card, EmptyState, StatusBadge } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  Flame,
  TriangleAlert,
  Wallet,
} from 'lucide-react';

import {
  useMyPointWalletQuery,
  useSolutionViewCostQuery,
} from '../hooks/use-point';
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
  const solutionCost = useSolutionViewCostQuery();
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  if (isLoading) {
    return <PointWalletSkeleton />;
  }

  if (isError) {
    return (
      <Card className="py-empty-pad-y flex flex-col items-center gap-3 text-center">
        <TriangleAlert
          size={32}
          className="text-system-warning"
          aria-hidden
        />
        <p className="font-body1-heading text-text-main">
          포인트 지갑을 불러오지 못했어요.
        </p>
        <Button
          variant="primary"
          size="small"
          onClick={() => refetch()}
        >
          다시 시도
        </Button>
      </Card>
    );
  }

  const balance = data?.balance ?? 0;
  const transactions = data?.transactions ?? [];
  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 6);
  const solutionPrice = solutionCost.data?.cost;
  const solutionIsFree = solutionCost.data?.free ?? false;
  const canOpenSolution =
    solutionIsFree || (solutionPrice !== undefined && balance >= solutionPrice);

  return (
    <div className="gap-section-gap flex flex-col">
      <div className="desktop:grid-split-v22 gap-section-gap desktop:grid-cols-2 grid grid-cols-1">
        <Card
          className="border-orange-3 bg-orange-1 gap-content-gap flex flex-col"
          aria-label="포인트 잔액"
        >
          <div className="gap-content-gap flex items-center">
            <Wallet
              size={18}
              className="text-orange-7"
              aria-hidden
            />
            <span className="font-caption-heading text-text-sub1">
              사용 가능한 포인트
            </span>
          </div>
          <p className="font-title-heading text-text-main tabular-nums">
            {balance.toLocaleString('ko-KR')}
            <span className="font-headline1-heading text-orange-7 ml-1">P</span>
          </p>
          <p className="font-caption-normal text-text-sub1 leading-relaxed">
            포인트는 학습 노력의 기록이며 성취도나 실력 등급이 아닙니다.
            자력으로 정답을 맞히거나 연속으로 학습하면 쌓여요.
          </p>
        </Card>

        <LevelBadgeConnected />
      </div>

      <div className="gap-section-gap desktop:grid-cols-2 grid grid-cols-1">
        <Card data-testid="point-spend-places">
          <Card.Header>
            <div>
              <Card.Title>포인트 사용처</Card.Title>
              <Card.Description>
                차감 전에 비용과 잔액을 확인해요.
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content className="gap-block-gap tablet:grid-cols-2 desktop:grid-cols-1 grid grid-cols-1">
            <article className="border-gray-3 rounded-card gap-content-gap p-card-pad flex flex-col border">
              <div>
                <b className="text-gray-12 block text-sm">정답 해설 1회 열람</b>
                <span className="text-orange-10 font-body1-heading mt-inline-gap-xs block tabular-nums">
                  {solutionCost.isLoading
                    ? '비용 확인 중'
                    : solutionCost.isError || solutionPrice === undefined
                      ? '비용 확인 필요'
                      : solutionIsFree
                        ? '이번 1회 무료'
                        : `${solutionPrice.toLocaleString('ko-KR')}P`}
                </span>
              </div>
              <p className="text-gray-8 font-caption-normal leading-relaxed">
                오답 문제에서 선생님 해설을 열기 전에 실제 차감 비용을 다시
                보여드려요.
              </p>
              {canOpenSolution ? (
                <Button
                  asChild
                  size="small"
                >
                  <Link href={PRIVATE.DASHBOARD.WRONG_ANSWERS}>
                    문제 보러 가기
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                >
                  {solutionCost.isError ? '비용 확인 후 이용' : '포인트 부족'}
                </Button>
              )}
            </article>

            <article className="border-gray-3 bg-gray-2 rounded-card gap-content-gap p-card-pad flex flex-col border">
              <div>
                <b className="text-gray-12 block text-sm">친구 도전장</b>
                <span className="text-gray-8 font-caption-heading mt-inline-gap-xs block">
                  서버 연결 전
                </span>
              </div>
              <p className="text-gray-8 font-caption-normal leading-relaxed">
                도전장 포인트 차감 거래 유형이 아직 없어 활성화하지 않았어요.
              </p>
              <Button
                variant="outlined"
                size="small"
                disabled
              >
                연결 전
              </Button>
            </article>
          </Card.Content>
        </Card>

        <Card data-testid="point-earning-actions">
          <Card.Header>
            <div>
              <Card.Title>포인트 모으기</Card.Title>
              <Card.Description>
                실제 학습 행동으로만 적립돼요.
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content>
            <EarningRow
              icon={<CheckCircle2 size={18} />}
              title="자력 정답"
              description="정답 해설을 보기 전에 스스로 맞히면 적립"
            />
            <EarningRow
              icon={<Flame size={18} />}
              title="연속 학습"
              description="학습 흐름을 이어가면 적립"
            />
            <EarningRow
              icon={<BookOpenCheck size={18} />}
              title="가입 보너스"
              description="처음 학습을 시작할 때 한 번 적립"
            />
          </Card.Content>
        </Card>
      </div>

      <Card aria-label="포인트 적립·사용 내역">
        <Card.Header>
          <div>
            <Card.Title>최근 적립·사용 내역</Card.Title>
            <Card.Description>
              {transactions.length === 0
                ? '내역 없음'
                : `전체 ${transactions.length}건`}
            </Card.Description>
          </div>
          {transactions.length > 6 && (
            <Button
              variant="ghost"
              size="xsmall"
              onClick={() => setShowAllTransactions((current) => !current)}
            >
              {showAllTransactions ? '최근 6건만' : '전체 내역'}
            </Button>
          )}
        </Card.Header>

        {transactions.length === 0 ? (
          <EmptyState
            title="아직 포인트 내역이 없어요"
            description="오답을 혼자 다시 풀거나 연속 학습을 시작하면 첫 포인트를 모을 수 있어요."
            icon={<Wallet size={24} />}
            action={
              <Button
                asChild
                size="small"
              >
                <Link href={PRIVATE.DASHBOARD.WRONG_ANSWERS}>
                  오답 다시 풀기
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col">
            {visibleTransactions.map((transaction, index) => (
              <TransactionRow
                key={`${transaction.regDate}-${transaction.type}-${index}`}
                transaction={transaction}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

const EarningRow = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="border-gray-3 min-h-row-min gap-content-gap flex items-center border-t py-3 first:border-t-0">
    <span className="bg-orange-1 text-orange-10 rounded-row flex size-9 shrink-0 items-center justify-center">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <b className="text-gray-12 block text-sm">{title}</b>
      <small className="text-gray-8 text-ui-choice block">{description}</small>
    </span>
    <StatusBadge
      variant="success"
      label="적립"
    />
  </div>
);
