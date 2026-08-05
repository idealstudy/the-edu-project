import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 과목 Domain
 * ────────────────────────────────────────────────────*/
const ChallengeSubjectSchema = z.enum(['MATH', 'KOREAN', 'ENGLISH', 'SCIENCE']);

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 목록 / 상세 Domain
 * ────────────────────────────────────────────────────*/
const ChallengeListItemSchema = z.object({
  id: z.string(),
  subject: ChallengeSubjectSchema,
  difficulty: z.enum(['TOP', 'HIGH', 'MID', 'LOW']),
  title: z.string(),
  sourceText: z.string(),
  questionImageUrl: z.string().nullable(),
  passRate: z.number().nullable(),
  participantCount: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 추천 오픈챌린지 Domain (오답률·등급 기반)
 *  GET /api/public/challenges/recommended
 *  - 리스트 카드와 메타는 동일하되 추천 사유(recommendReason)와
 *    오답률(wrongAnswerRate)을 추가로 노출한다. (passRate 미제공)
 * ────────────────────────────────────────────────────*/
const RecommendedChallengeSchema = z.object({
  id: z.string(),
  subject: ChallengeSubjectSchema,
  difficulty: z.enum(['TOP', 'HIGH', 'MID', 'LOW']),
  title: z.string(),
  sourceText: z.string(),
  questionImageUrl: z.string().nullable(),
  wrongAnswerRate: z.number(),
  participantCount: z.number(),
  recommendReason: z.string(),
});

const ChallengeDetailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  topic: z.string(),
  questionNumber: z.number(),
  questionText: z.string(),
  questionImageUrl: z.string().nullable(),
  choices: z.array(z.string()),
  passRate: z.number().nullable(),
  wrongAnswerRate: z.number(),
  participantCount: z.number(),
  isAiSupported: z.boolean(),
  points: z.number().nullable(),
  examRoundCode: z.string().nullable(),
  wrongAnswerRateSource: z.enum(['EXTERNAL', 'INTERNAL', 'ESTIMATED']),
  units: z.array(
    z.object({
      nodeId: z.number(),
      displayName: z.string(),
      subjectName: z.string(),
      isPrimary: z.boolean(),
      examScope: z.string(),
    })
  ),
});

const CoachOpeningSchema = z.object({
  challengeId: z.string(),
  message: z.string(),
  templateCode: z.enum(['T1', 'T2', 'T3', 'T4', 'T5']),
  progressionStep: z.number(),
  usedFields: z.record(z.string(), z.unknown()),
});

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 풀이 결과 Domain
 * ────────────────────────────────────────────────────*/

/**
 * 표시용 투영 보상 델타 (D1 옵션 A).
 * dto transform 결과를 그대로 통과시킨다.
 */
const RewardDeltaSchema = z
  .object({
    pointDelta: z.number(),
    pointBalance: z.number(),
    streakKept: z.boolean(),
    streakDays: z.number(),
    expDelta: z.number(),
    expBefore: z.number(),
    level: z.number(),
    leveledUp: z.boolean(),
    treeNodeName: z.string().nullable(),
    masteryBefore: z.number(),
    masteryAfter: z.number(),
    conquered: z.boolean(),
  })
  .nullable();

const ChallengeAnswerResultSchema = z.object({
  isCorrect: z.boolean(),
  correctAnswer: z.string(),
  participantCount: z.number(),
  passRate: z.number().nullable(),
  reward: RewardDeltaSchema.optional(),
  // 결과화면 해설 섹션 표시 전용 시드 해설(마크다운). 판정에는 영향 없음.
  solutionText: z.string().nullable().optional(),
});

/* ─────────────────────────────────────────────────────
 * 정답 해설 Domain
 *  열람 시 포인트 −30 차감 + 약점 지도 제외(usedSolutionView).
 * ────────────────────────────────────────────────────*/
const ChallengeSolutionSchema = z.object({
  content: z.string(),
  correctAnswer: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 풀이 유형 Domain (텍스트 / 손글씨 드로잉)
 * ────────────────────────────────────────────────────*/
const SolutionTypeSchema = z.enum(['TEXT', 'DRAWING']);

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 리뷰 Domain
 *  - solutionType=DRAWING이면 drawingImageUrl(presigned)로 손글씨 스냅샷을 노출.
 * ────────────────────────────────────────────────────*/
const ChallengeReviewSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  subject: z.string(),
  content: z.string(),
  solutionType: SolutionTypeSchema,
  drawingImageUrl: z.string().nullable(),
  recommendCount: z.number(),
  isBest: z.boolean(),
  isRecommendedByMe: z.boolean(),
  isCorrect: z.boolean().nullable(),
  authorNickname: z.string(),
  isMine: z.boolean(),
});

const NextChallengeSchema = ChallengeListItemSchema;

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 랭킹 Domain
 * ────────────────────────────────────────────────────*/
const UserRankingSchema = z.object({
  userId: z.string().optional(),
  nickname: z.string(),
  streakDays: z.number(),
  challengeCount: z.number(),
  correctRate: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 마이페이지 오픈챌린지 Domain
 * ────────────────────────────────────────────────────*/
const MyChallengeListItemSchema = z.object({
  challengeId: z.string(),
  subject: ChallengeSubjectSchema,
  difficulty: z.enum(['TOP', 'HIGH', 'MID', 'LOW']),
  status: z.enum(['IN_PROGRESS', 'AI_COACHING', 'UNRESOLVED', 'COMPLETED']),
  sourceText: z.string(),
  questionText: z.string(),
  questionImageUrl: z.string().nullable(),
  isCorrect: z.boolean().nullable(),
  usedAi: z.boolean(),
  completedAt: z.string().nullable(),
});

const MyChallengeAttemptSchema = z.object({
  attemptId: z.string(),
  status: z.enum(['IN_PROGRESS', 'AI_COACHING', 'UNRESOLVED', 'COMPLETED']),
  isCorrect: z.boolean().nullable(),
  selectedAnswer: z.string().nullable(),
  usedAi: z.boolean(),
  maxUsedHintStep: z.number().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

const MyChallengeReviewSchema = z.object({
  reviewId: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  recommendCount: z.number(),
});

const MyChallengeDetailSchema = z.object({
  challengeId: z.string(),
  attempts: z.array(MyChallengeAttemptSchema),
  reviews: z.array(MyChallengeReviewSchema),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const domain = {
  subject: ChallengeSubjectSchema,
  solutionType: SolutionTypeSchema,
  listItem: ChallengeListItemSchema,
  recommended: RecommendedChallengeSchema,
  detail: ChallengeDetailSchema,
  coachOpening: CoachOpeningSchema,
  answerResult: ChallengeAnswerResultSchema,
  rewardDelta: RewardDeltaSchema,
  solution: ChallengeSolutionSchema,
  review: ChallengeReviewSchema,
  nextChallenge: NextChallengeSchema,
  ranking: UserRankingSchema,
  myChallengeListItem: MyChallengeListItemSchema,
  myChallengeDetail: MyChallengeDetailSchema,
};
