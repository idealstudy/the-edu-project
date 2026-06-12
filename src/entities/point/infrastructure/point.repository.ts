import { domain, helpers } from '@/entities/point/core';
import {
  type PointTransactionType,
  type PointTransactionView,
  type PointWallet,
} from '@/entities/point/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './point.dto';

/* ─────────────────────────────────────────────────────
 * 거래 유형 정규화 (백엔드 string → Domain enum)
 *  - 미정의 적립/차감 유형은 부호로 추론(+적립 / −차감).
 * ────────────────────────────────────────────────────*/
const KNOWN_TYPES: PointTransactionType[] = [
  'EARN_CORRECT',
  'EARN_STREAK',
  'EARN_SIGNUP',
  'SPEND_SOLUTION',
];

const toTransactionType = (
  rawType: string,
  amount: number
): PointTransactionType => {
  const upper = rawType.toUpperCase();
  const matched = KNOWN_TYPES.find((type) => type === upper);
  if (matched) return matched;
  return amount < 0 ? 'SPEND_SOLUTION' : 'EARN_CORRECT';
};

/* ─────────────────────────────────────────────────────
 * DTO → UI-ready 변환
 *  - earn 플래그와 사유 한글 라벨을 미리 붙여 화면이 바로 쓰게 한다.
 * ────────────────────────────────────────────────────*/
const toTransactionView = (raw: unknown): PointTransactionView => {
  const parsed = dto.transaction.parse(raw);
  const type = toTransactionType(parsed.type, parsed.amount);

  const validated = domain.transaction.parse({
    amount: parsed.amount,
    type,
    reason: parsed.reason,
    refId: parsed.refId,
    regDate: parsed.regDate,
  });

  return {
    ...validated,
    earn: helpers.isEarn(type),
    reasonLabel: helpers.toReasonLabel(type),
  };
};

/* ─────────────────────────────────────────────────────
 * [READ] 내 포인트 지갑 조회 (잔액 + 적립/차감 내역)
 *  GET /api/common/points
 * ────────────────────────────────────────────────────*/
const getMyWallet = async (): Promise<PointWallet> => {
  const response = await api.private.get('/common/points');
  const data = unwrapEnvelope(response, dto.wallet);

  const transactions = data.transactions
    .map(toTransactionView)
    // 최신 거래가 위로 오도록 발생 시각 내림차순 정렬.
    .sort((a, b) => b.regDate.localeCompare(a.regDate));

  return {
    balance: data.balance,
    transactions,
  };
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  getMyWallet,
};
