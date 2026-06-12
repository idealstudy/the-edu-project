import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 포인트 거래 유형 Domain
 *  - EARN_CORRECT : 자력 정답 적립
 *  - EARN_STREAK  : 연속 학습(streak) 적립
 *  - EARN_SIGNUP  : 가입 보너스 적립
 *  - SPEND_SOLUTION : 정답 해설 열람 차감
 *  포인트는 "소모 화폐" — 적립해서 모으고, 해설 열람 등으로 쓴다.
 * ────────────────────────────────────────────────────*/
const PointTransactionTypeSchema = z.enum([
  'EARN_CORRECT',
  'EARN_STREAK',
  'EARN_SIGNUP',
  'SPEND_SOLUTION',
]);

/* ─────────────────────────────────────────────────────
 * 포인트 거래 1건 Domain
 *  - amount: 부호 있는 변동값(+적립 / −차감)
 *  - reason: 사유 코드(거래 유형과 보통 일치)
 *  - refId: 연관 리소스 식별자(예: attemptId) — 없을 수 있음
 *  - regDate: 발생 시각(ISO 문자열)
 * ────────────────────────────────────────────────────*/
const PointTransactionSchema = z.object({
  amount: z.number(),
  type: PointTransactionTypeSchema,
  reason: z.string(),
  refId: z.string().nullable(),
  regDate: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 포인트 지갑 Domain
 *  - balance: 현재 잔액(소모 가능 포인트)
 *  - transactions: 적립/차감 내역(최신순으로 정렬해 보여 준다)
 * ────────────────────────────────────────────────────*/
const PointWalletSchema = z.object({
  balance: z.number(),
  transactions: z.array(PointTransactionSchema),
});

/* ─────────────────────────────────────────────────────
 * 거래 유형 → 적립/차감 방향 헬퍼
 *  포인트=소모 화폐 축에서 +오렌지 / −그레이로 시각 구분.
 * ────────────────────────────────────────────────────*/
const isEarn = (
  type: z.infer<typeof PointTransactionTypeSchema>
): boolean => type.startsWith('EARN');

/* ─────────────────────────────────────────────────────
 * 거래 유형 → 사유 한글 라벨 헬퍼
 * ────────────────────────────────────────────────────*/
const REASON_LABELS: Record<
  z.infer<typeof PointTransactionTypeSchema>,
  string
> = {
  EARN_CORRECT: '자력 정답',
  EARN_STREAK: '연속 학습',
  EARN_SIGNUP: '가입 보너스',
  SPEND_SOLUTION: '정답 해설 열람',
};

const toReasonLabel = (
  type: z.infer<typeof PointTransactionTypeSchema>
): string => REASON_LABELS[type];

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const domain = {
  transactionType: PointTransactionTypeSchema,
  transaction: PointTransactionSchema,
  wallet: PointWalletSchema,
};

export const helpers = {
  isEarn,
  toReasonLabel,
};
