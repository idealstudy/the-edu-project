import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 레벨(성장 지표) Domain
 *  - level: 현재 레벨
 *  - exp: 누적 경험치(전체)
 *  - expToNextLevel: 다음 레벨까지 남은 경험치
 *  - progressPercent: 현재 레벨 내 진행률(0~100)
 *  레벨은 "꾸준히 성장한 흔적" — 소모 화폐인 포인트와 다른 축이다.
 *  (포인트를 써도 레벨은 내려가지 않는다.)
 * ────────────────────────────────────────────────────*/
const UserLevelSchema = z.object({
  level: z.number(),
  exp: z.number(),
  expToNextLevel: z.number(),
  progressPercent: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 뱃지 획득 조건 유형 Domain (백엔드 BadgeConditionType)
 *  - FIRST_CORRECT : 최초 정답 1회
 *  - SOLVE_COUNT   : 누적 완료 문제 수(threshold 이상)
 *  - STREAK        : 연속 풀이 일수(threshold 이상)
 *  - NODE_MASTERED : 단원 노드 마스터
 * ────────────────────────────────────────────────────*/
const BadgeConditionTypeSchema = z.enum([
  'FIRST_CORRECT',
  'SOLVE_COUNT',
  'STREAK',
  'NODE_MASTERED',
]);

/* ─────────────────────────────────────────────────────
 * 뱃지 1건 Domain (보유/미보유 카탈로그 공통)
 *  - earned: 보유 여부(true=컬러 / false=회색)
 *  - earnedAt: 획득 시각(미보유면 null)
 *  - threshold: 조건 임계값(없을 수 있음)
 * ────────────────────────────────────────────────────*/
const BadgeSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  conditionType: BadgeConditionTypeSchema,
  threshold: z.number().nullable(),
  icon: z.string(),
  earned: z.boolean(),
  earnedAt: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 조건 유형 → 사람이 읽는 조건 라벨 헬퍼
 *  미보유 뱃지에 "어떻게 얻는지"를 보여 주기 위함.
 * ────────────────────────────────────────────────────*/
const toConditionLabel = (
  type: z.infer<typeof BadgeConditionTypeSchema>,
  threshold: number | null
): string => {
  switch (type) {
    case 'FIRST_CORRECT':
      return '첫 정답을 맞히면 획득';
    case 'SOLVE_COUNT':
      return `문제 ${threshold ?? 0}개를 완료하면 획득`;
    case 'STREAK':
      return `${threshold ?? 0}일 연속 풀이하면 획득`;
    case 'NODE_MASTERED':
      return '단원 하나를 정복하면 획득';
    default:
      return '조건을 달성하면 획득';
  }
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const domain = {
  userLevel: UserLevelSchema,
  badge: BadgeSchema,
  badgeConditionType: BadgeConditionTypeSchema,
};

export const helpers = {
  toConditionLabel,
};
