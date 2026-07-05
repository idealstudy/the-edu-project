import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 공통 스키마
 * ────────────────────────────────────────────────────*/
const IdSchema = z.union([z.string(), z.number()]).transform(String);
const QUESTION_TEXT_FALLBACK = '문제 이미지를 보고 답을 선택해 주세요.';

const NullableNumberSchema = z.number().nullable().optional();

const ChallengeSubjectDtoSchema = z
  .union([
    z.enum(['MATH', 'KOREAN', 'ENGLISH', 'SCIENCE']),
    z.enum(['math', 'korean', 'english', 'science']),
    z.string(),
  ])
  .optional()
  .default('math');

const AdminChallengeSubjectSchema = z.enum([
  'MATH',
  'KOREAN',
  'ENGLISH',
  'SCIENCE',
]);

const DifficultyDtoSchema = z
  .union([
    z.enum(['highest', 'high', 'middle', 'low']),
    z.enum(['최상', '상', '중', '하']),
    z.string(),
  ])
  .optional()
  .default('middle');

const AdminChallengeDifficultySchema = z.enum(['TOP', 'HIGH', 'MID', 'LOW']);

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 목록 / 상세 DTO (공개)
 * ────────────────────────────────────────────────────*/
const ChallengeListItemDtoSchema = z.object({
  id: IdSchema.optional(),
  challengeId: IdSchema.optional(),
  subject: ChallengeSubjectDtoSchema,
  difficulty: DifficultyDtoSchema,
  wrongAnswerRate: z.number().optional().default(0),
  title: z.string().optional().default('오픈챌린지 문제'),
  sourceText: z.string().optional().default('출처 정보'),
  questionText: z.string().nullable().optional(),
  questionImageUrl: z.string().nullable().optional().default(null),
  participantCount: z.number().optional().default(0),
  passRate: NullableNumberSchema,
});

/* ─────────────────────────────────────────────────────
 * 추천 오픈챌린지 DTO (공개)
 *  백엔드 RecommendedChallengeResponse: challengeId·subject·difficulty·
 *  wrongAnswerRate·sourceText·questionText·questionImageUrl·
 *  participantCount·recommendReason. (passRate 미제공)
 * ────────────────────────────────────────────────────*/
const RecommendedChallengeDtoSchema = z.object({
  id: IdSchema.optional(),
  challengeId: IdSchema.optional(),
  subject: ChallengeSubjectDtoSchema,
  difficulty: DifficultyDtoSchema,
  wrongAnswerRate: z.number().nullable().optional().default(0),
  sourceText: z.string().optional().default('출처 정보'),
  questionText: z.string().nullable().optional(),
  questionImageUrl: z.string().nullable().optional().default(null),
  participantCount: z.number().optional().default(0),
  recommendReason: z.string().optional().default('오답률 기반 추천'),
});

const ChallengeDetailDtoSchema = ChallengeListItemDtoSchema.extend({
  topic: z.string().optional(),
  questionNumber: z.number().optional().default(1),
  questionText: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? QUESTION_TEXT_FALLBACK),
  questionMediaId: z.string().nullable().optional().default(null),
  choices: z.array(z.string()).default([]),
  correctAnswer: z.string().optional(),
  type: z.string().nullable().optional(),
  aiSupported: z.boolean().optional(),
  isAiSupported: z.boolean().optional().default(true),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const AttemptDtoSchema = z.object({
  attemptId: IdSchema,
  status: z.string(),
});

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 풀이 결과 DTO
 * ────────────────────────────────────────────────────*/

/**
 * 표시용 투영 보상 델타 (D1 옵션 A).
 * 백엔드 RewardDelta record 와 1:1 매핑. 구버전 백엔드 대비 nullable·optional 허용.
 */
const RewardDeltaDtoSchema = z
  .object({
    pointDelta: z.number().default(0),
    pointBalance: z.number().default(0),
    streakKept: z.boolean().default(false),
    streakDays: z.number().default(0),
    expDelta: z.number().optional().default(0),
    expBefore: z.number().optional().default(0),
    level: z.number().optional().default(1),
    leveledUp: z.boolean().optional().default(false),
    treeNodeName: z.string().nullable().optional().default(null),
    masteryBefore: z.number().default(0),
    masteryAfter: z.number().default(0),
    conquered: z.boolean().default(false),
  })
  .nullable()
  .optional();

const AnswerResultDtoSchema = z
  .object({
    isCorrect: z.boolean().optional(),
    correct: z.boolean().optional(),
    correctAnswer: z.string(),
    participantCount: z.number(),
    passRate: z.number().nullable().optional(),
    reward: RewardDeltaDtoSchema,
  })
  .transform((value) => ({
    isCorrect: value.isCorrect ?? value.correct ?? false,
    correctAnswer: value.correctAnswer,
    participantCount: value.participantCount,
    passRate: value.passRate ?? null,
    reward: value.reward ?? null,
  }));

/* ─────────────────────────────────────────────────────
 * 정답 해설 DTO (백엔드 SolutionResponse)
 *  - 조회 시 백엔드가 usedSolutionView=true 처리 + 포인트 −30 차감.
 *  - 백엔드 필드는 solutionText(마크다운/KaTeX·이미지 해설) — 이를 content 로 매핑한다.
 * ────────────────────────────────────────────────────*/
const SolutionDtoSchema = z
  .object({
    // 백엔드 SolutionResponse 의 실제 필드명.
    solutionText: z.string().nullable().optional(),
    correctAnswer: z.string().nullable().optional(),
  })
  .transform((value) => ({
    content: value.solutionText ?? '',
    correctAnswer: value.correctAnswer ?? null,
  }));

/* ─────────────────────────────────────────────────────
 * 풀이 유형 (텍스트 / 손글씨 드로잉)
 * ────────────────────────────────────────────────────*/
const SolutionTypeDtoSchema = z
  .union([z.enum(['TEXT', 'DRAWING']), z.string()])
  .optional()
  .default('TEXT');

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 리뷰 DTO
 *  - solutionType: TEXT(글) | DRAWING(손글씨 캔버스 스냅샷)
 *  - drawingImageUrl: presigned 조회 URL (DRAWING일 때만 채워짐)
 *  - content: TEXT면 본문, DRAWING이면 보조 메모(비어 있을 수 있음)
 * ────────────────────────────────────────────────────*/
const ChallengeReviewDtoSchema = z.object({
  id: IdSchema.optional(),
  reviewId: IdSchema.optional(),
  nickname: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? '익명'),
  subject: z.string().optional().default('수학'),
  content: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? ''),
  solutionType: SolutionTypeDtoSchema,
  drawingImageUrl: z.string().nullable().optional().default(null),
  recommendCount: z.number().optional().default(0),
  isBest: z.boolean().optional(),
  best: z.boolean().optional(),
  isRecommendedByMe: z.boolean().optional(),
  recommendedByMe: z.boolean().optional().default(false),
});

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 랭킹 DTO
 * ────────────────────────────────────────────────────*/
const UserRankingDtoSchema = z.object({
  userId: IdSchema.optional(),
  nickname: z.string(),
  streakDays: z.number(),
  challengeCount: z.number(),
  correctRate: z.number(),
});

const MyChallengeResultFilterSchema = z.enum(['ALL', 'CORRECT', 'WRONG']);

/* ─────────────────────────────────────────────────────
 * 내 문제 상태 필터 (최신 attempt 상태 기준)
 *  ALL=전체 / IN_PROGRESS=시도 중 / UNRESOLVED=미해결 / COMPLETED=완료
 * ────────────────────────────────────────────────────*/
const MyChallengeStatusFilterSchema = z.enum([
  'ALL',
  'IN_PROGRESS',
  'UNRESOLVED',
  'COMPLETED',
]);

/* 항목별 최신 attempt 상태 (AI_COACHING은 진행 중으로 취급) */
const MyChallengeItemStatusSchema = z
  .enum(['IN_PROGRESS', 'AI_COACHING', 'UNRESOLVED', 'COMPLETED'])
  .optional()
  .default('COMPLETED');

/* ─────────────────────────────────────────────────────
 * 마이페이지 오픈챌린지 DTO
 *  status=최신 attempt 상태, completedAt=완료가 아니면 null.
 * ────────────────────────────────────────────────────*/
const MyChallengeListItemDtoSchema = z.object({
  challengeId: IdSchema,
  subject: ChallengeSubjectDtoSchema,
  difficulty: AdminChallengeDifficultySchema,
  status: MyChallengeItemStatusSchema,
  sourceText: z.string().optional().default('출처 정보'),
  questionText: z.string().nullable().optional(),
  questionImageUrl: z.string().nullable().optional().default(null),
  isCorrect: z.boolean().nullable(),
  usedAi: z.boolean().optional().default(false),
  completedAt: z.string().nullable().optional().default(null),
});

const MyChallengeAttemptDtoSchema = z.object({
  attemptId: IdSchema,
  status: z.enum(['IN_PROGRESS', 'AI_COACHING', 'UNRESOLVED', 'COMPLETED']),
  isCorrect: z.boolean().nullable(),
  selectedAnswer: z.string().nullable(),
  usedAi: z.boolean().optional().default(false),
  maxUsedHintStep: z.number().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

const MyChallengeReviewDtoSchema = z.object({
  reviewId: IdSchema,
  content: z.string(),
  isActive: z.boolean().optional(),
  active: z.boolean().optional(),
  recommendCount: z.number().optional().default(0),
});

const MyChallengeDetailDtoSchema = z.object({
  challengeId: IdSchema,
  attempts: z.array(MyChallengeAttemptDtoSchema),
  reviews: z.array(MyChallengeReviewDtoSchema),
});

/* ─────────────────────────────────────────────────────
 * AI 코칭 DTO
 * ────────────────────────────────────────────────────*/
const AiCoachingSessionStatusSchema = z.enum([
  'READY',
  'COACHING',
  'WAITING_ANSWER',
  'GUIDE_TO_PROBLEM',
  'FINISHED',
  'ABANDONED',
]);

const AiCoachingMessageRoleSchema = z.enum(['STUDENT', 'ASSISTANT', 'SYSTEM']);

const AiCoachingEnumOptionSchema = z.object({
  code: z.string(),
  label: z.string(),
});

const AiCoachingPreferenceSchema = z
  .object({
    learningStage: AiCoachingEnumOptionSchema.nullable().optional(),
    learningGoal: AiCoachingEnumOptionSchema.nullable().optional(),
    difficultAreas: z.array(AiCoachingEnumOptionSchema).optional().default([]),
    customText: z.string().nullable().optional(),
    modDate: z.string().nullable().optional(),
  })
  .nullable();

const AiCoachingEnumResponseSchema = z.object({
  learningStage: z.array(AiCoachingEnumOptionSchema),
  learningGoal: z.array(AiCoachingEnumOptionSchema),
  difficultArea: z.array(AiCoachingEnumOptionSchema),
});

const AiCoachingSessionSchema = z.object({
  sessionId: IdSchema,
  status: AiCoachingSessionStatusSchema,
  startedAt: z.string().nullable().optional(),
});

const AiCoachingMessageSchema = z.object({
  role: AiCoachingMessageRoleSchema,
  content: z.string(),
  progressionStep: z.number().nullable().optional(),
  regDate: z.string().nullable().optional(),
});

const AiCoachingMessageResponseSchema = z.object({
  sessionId: IdSchema,
  studentMessageId: IdSchema,
  assistantMessageId: IdSchema,
  reply: z.string(),
  progressionStep: z.number().nullable().optional(),
  status: AiCoachingSessionStatusSchema,
  maxUsedHintStep: z.number().nullable().optional(),
});

/* ─────────────────────────────────────────────────────
 * 페이지 응답 DTO
 * ────────────────────────────────────────────────────*/
const page = <Item extends z.ZodTypeAny>(item: Item) =>
  z.object({
    content: z.array(item),
    hasNext: z.boolean().optional().default(false),
  });

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 풀이 / 리뷰 Payload
 * ────────────────────────────────────────────────────*/
const StartAttemptPayloadSchema = z.object({
  challengeId: z.string().min(1),
});

const SubmitAnswerPayloadSchema = z.object({
  selectedAnswer: z.string().min(1),
});

/* ─────────────────────────────────────────────────────
 * 리뷰(풀이) 작성 Payload
 *  - solutionType=TEXT: content 필수.
 *  - solutionType=DRAWING: drawingImageMediaId 필수(스냅샷 업로드 후 media_id),
 *    drawingData(획 원본 JSON)는 선택, content는 보조 메모로 선택.
 *  백엔드: POST /api/common/challenge-reviews
 * ────────────────────────────────────────────────────*/
const CreateReviewPayloadSchema = z
  .object({
    challengeId: z.string().min(1),
    attemptId: z.string().min(1),
    solutionType: z.enum(['TEXT', 'DRAWING']).default('TEXT'),
    content: z.string().default(''),
    drawingData: z.string().nullable().optional(),
    drawingImageMediaId: z.string().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.solutionType === 'TEXT' && value.content.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '풀이 내용을 입력해 주세요.',
      });
    }
    if (value.solutionType === 'DRAWING' && !value.drawingImageMediaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['drawingImageMediaId'],
        message: '드로잉 이미지를 먼저 업로드해 주세요.',
      });
    }
  });

const SubmitFeedbackPayloadSchema = z.object({
  attemptId: z.string().min(1),
  rating: z.number().min(1).max(5).optional().nullable(),
  comment: z.string().optional(),
});

/* ─────────────────────────────────────────────────────
 * 관리자 오픈챌린지 Payload
 * ────────────────────────────────────────────────────*/
const AdminChallengePayloadSchema = z.object({
  subject: AdminChallengeSubjectSchema,
  difficulty: AdminChallengeDifficultySchema,
  wrongAnswerRate: z.number().min(0).max(100).nullable(),
  title: z.string().min(1),
  sourceText: z.string().min(1),
  questionText: z.string().nullable(),
  questionMediaId: z.string().nullable(),
  choices: z.array(z.string().min(1)).min(1),
  correctAnswer: z.string().min(1),
  type: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * AI 코칭 Payload
 * ────────────────────────────────────────────────────*/
const AiCoachingPreferencePayloadSchema = z.object({
  learningStage: z.string().nullable().optional(),
  learningGoal: z.string().nullable().optional(),
  difficultAreas: z.array(z.string()).optional(),
  customText: z.string().max(500).nullable().optional(),
});

const CreateAiCoachingSessionPayloadSchema = z.object({
  challengeAttemptId: z.string().min(1),
});

const SendAiCoachingMessagePayloadSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  // 학생 손글씨 풀이 스냅샷 media_id (선택) — 있으면 백엔드가 vision 으로 첨부해
  // "어디까지 맞고 어디서 막혔는지" 풀이 기반 코칭을 한다.
  studentSolutionImageMediaId: z.string().min(1).optional(),
  // 요청 의도 — '개념 보기'/'힌트 보기' 칩과 자유 채팅을 구분해 백엔드가 응답 전략을 바꾼다.
  intent: z.enum(['concept', 'hint', 'chat']).optional(),
});

const ChallengeIdResponseSchema = z.object({
  challengeId: IdSchema,
});

/* ─────────────────────────────────────────────────────
 * 스트릭 스냅샷 DTO (D-Home 동기 헤더용 — GET /api/common/me/streak)
 * ────────────────────────────────────────────────────*/
const StreakSnapshotDtoSchema = z.object({
  streakDays: z.number().optional().default(0),
  todayCompleted: z.boolean().optional().default(false),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  listItem: ChallengeListItemDtoSchema,
  list: z.array(ChallengeListItemDtoSchema),
  listPage: page(ChallengeListItemDtoSchema),
  recommended: RecommendedChallengeDtoSchema,
  recommendedList: z.array(RecommendedChallengeDtoSchema),
  detail: ChallengeDetailDtoSchema,
  attempt: AttemptDtoSchema,
  answerResult: AnswerResultDtoSchema,
  solution: SolutionDtoSchema,
  review: ChallengeReviewDtoSchema,
  reviews: z.array(ChallengeReviewDtoSchema),
  reviewPage: page(ChallengeReviewDtoSchema),
  ranking: UserRankingDtoSchema,
  rankings: z.array(UserRankingDtoSchema),
  rankingPage: page(UserRankingDtoSchema),
  myChallengeListItem: MyChallengeListItemDtoSchema,
  myChallengeListPage: page(MyChallengeListItemDtoSchema),
  myChallengeDetail: MyChallengeDetailDtoSchema,
  challengeId: ChallengeIdResponseSchema,
  aiCoachingEnums: AiCoachingEnumResponseSchema,
  aiCoachingPreference: AiCoachingPreferenceSchema,
  aiCoachingSession: AiCoachingSessionSchema,
  aiCoachingMessage: AiCoachingMessageSchema,
  aiCoachingMessages: z.array(AiCoachingMessageSchema),
  aiCoachingMessageResponse: AiCoachingMessageResponseSchema,
  streakSnapshot: StreakSnapshotDtoSchema,
};

export const payload = {
  startAttempt: StartAttemptPayloadSchema,
  submitAnswer: SubmitAnswerPayloadSchema,
  createReview: CreateReviewPayloadSchema,
  submitFeedback: SubmitFeedbackPayloadSchema,
  adminChallenge: AdminChallengePayloadSchema,
  aiCoachingPreference: AiCoachingPreferencePayloadSchema,
  createAiCoachingSession: CreateAiCoachingSessionPayloadSchema,
  sendAiCoachingMessage: SendAiCoachingMessagePayloadSchema,
};

export const params = {
  myChallengeResultFilter: MyChallengeResultFilterSchema,
  myChallengeStatusFilter: MyChallengeStatusFilterSchema,
};
