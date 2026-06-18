import { domain } from '@/entities/point/core';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Domain 추론 Type
 * ────────────────────────────────────────────────────*/
export type PointTransactionType = z.infer<typeof domain.transactionType>;
export type PointTransaction = z.infer<typeof domain.transaction>;
export type PointWalletDomain = z.infer<typeof domain.wallet>;

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 타임라인이 바로 쓰는 거래 (파생 플래그 포함)
 * ────────────────────────────────────────────────────*/
export type PointTransactionView = PointTransaction & {
  /** 적립 여부 (+오렌지 / −그레이) */
  earn: boolean;
  /** 사유 한글 라벨 */
  reasonLabel: string;
};

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 포인트 지갑 (잔액 + 거래 타임라인)
 * ────────────────────────────────────────────────────*/
export type PointWallet = {
  balance: number;
  transactions: PointTransactionView[];
};

/* ─────────────────────────────────────────────────────
 * 다음 해설 보기 비용/무료
 * ────────────────────────────────────────────────────*/
export type SolutionViewCost = {
  free: boolean;
  cost: number;
  freeRemaining: number;
};
