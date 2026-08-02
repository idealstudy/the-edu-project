import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 레벨 응답 DTO (백엔드 UserLevelResponse)
 *  - 누락 필드는 안전 기본값으로 채워 화면이 깨지지 않게 한다.
 * ────────────────────────────────────────────────────*/
const UserLevelDtoSchema = z.object({
  level: z.number().optional().default(1),
  exp: z.number().optional().default(0),
  expToNextLevel: z.number().optional().default(0),
  progressPercent: z.number().optional().default(0),
});

/* ─────────────────────────────────────────────────────
 * 뱃지 조건 유형 DTO
 *  - 미정의 유형도 안전하게 흘려보내기 위해 string 허용.
 * ────────────────────────────────────────────────────*/
const BadgeConditionTypeDtoSchema = z
  .union([
    z.enum(['FIRST_CORRECT', 'SOLVE_COUNT', 'STREAK', 'NODE_MASTERED']),
    z.string(),
  ])
  .optional()
  .default('FIRST_CORRECT');

/* ─────────────────────────────────────────────────────
 * 뱃지 1건 DTO (백엔드 BadgeCatalogResponse)
 * ────────────────────────────────────────────────────*/
const BadgeDtoSchema = z.object({
  id: z.number().optional().default(0),
  code: z.string().optional().default(''),
  name: z.string().optional().default(''),
  description: z.string().optional().default(''),
  conditionType: BadgeConditionTypeDtoSchema,
  threshold: z.number().nullable().optional().default(null),
  icon: z
    .string()
    .nullable()
    .optional()
    .default('')
    .transform((v) => v ?? ''),
  earned: z.boolean().optional().default(false),
  earnedAt: z.string().nullable().optional().default(null),
});

/* ─────────────────────────────────────────────────────
 * 뱃지 카탈로그 DTO (배열)
 * ────────────────────────────────────────────────────*/
const BadgeCatalogDtoSchema = z.array(BadgeDtoSchema).optional().default([]);

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  userLevel: UserLevelDtoSchema,
  badge: BadgeDtoSchema,
  badgeCatalog: BadgeCatalogDtoSchema,
};
