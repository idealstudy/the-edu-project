import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 공통 스키마
 * ────────────────────────────────────────────────────*/
const NullableIdSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform((v) => (v === null || v === undefined ? null : String(v)));

/* ─────────────────────────────────────────────────────
 * 포인트 거래 유형 DTO (백엔드 PointTransactionType)
 *  - 알 수 없는 유형은 안전하게 차감 외 분기에서 처리되도록 string 허용.
 * ────────────────────────────────────────────────────*/
const PointTransactionTypeDtoSchema = z
  .union([
    z.enum(['EARN_CORRECT', 'EARN_STREAK', 'EARN_SIGNUP', 'SPEND_SOLUTION']),
    z.string(),
  ])
  .optional()
  .default('EARN_CORRECT');

/* ─────────────────────────────────────────────────────
 * 포인트 거래 1건 DTO (백엔드 PointTransactionResponse)
 * ────────────────────────────────────────────────────*/
const PointTransactionDtoSchema = z.object({
  amount: z.number().optional().default(0),
  type: PointTransactionTypeDtoSchema,
  reason: z.string().optional().default(''),
  refId: NullableIdSchema,
  regDate: z.string().optional().default(''),
});

/* ─────────────────────────────────────────────────────
 * 포인트 지갑 DTO (백엔드 PointWalletResponse)
 * ────────────────────────────────────────────────────*/
const PointWalletDtoSchema = z.object({
  balance: z.number().optional().default(0),
  transactions: z.array(PointTransactionDtoSchema).optional().default([]),
});

/* ─────────────────────────────────────────────────────
 * 다음 해설 비용/무료 DTO (백엔드 SolutionViewCostResponse)
 *  - free=true 면 다음 해설 보기 무료(cost=0, freeRemaining>0).
 * ────────────────────────────────────────────────────*/
const SolutionViewCostDtoSchema = z.object({
  free: z.boolean().optional().default(false),
  cost: z.number().optional().default(0),
  freeRemaining: z.number().optional().default(0),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  transaction: PointTransactionDtoSchema,
  wallet: PointWalletDtoSchema,
  solutionViewCost: SolutionViewCostDtoSchema,
};
