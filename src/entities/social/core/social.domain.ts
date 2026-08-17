import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 친구 (Friendship) Domain
 *  GET/POST /api/common/friends
 *  - state: PENDING(요청·수락대기) | ACCEPTED(친구 성립)
 *  - 백엔드 응답엔 이름이 없어 id 기반으로 표현한다.
 * ────────────────────────────────────────────────────*/
const FriendshipStateSchema = z.enum(['PENDING', 'ACCEPTED']);

const FriendshipSchema = z.object({
  id: z.number(),
  requesterId: z.number(),
  addresseeId: z.number(),
  state: FriendshipStateSchema,
  regDate: z.string().nullable(),
  requesterName: z.string().nullable(),
  requesterProfileImageUrl: z.string().nullable(),
  addresseeName: z.string().nullable(),
  addresseeProfileImageUrl: z.string().nullable(),
  myTurn: z.boolean().optional(),
  lastActivity: z
    .object({
      occurredAt: z.string(),
      type: z.string(),
    })
    .nullable()
    .optional(),
});

/* ─────────────────────────────────────────────────────
 * 도전장 (ChallengeInvite) Domain
 *  POST/GET /api/common/challenge-invites
 *  - status: OPEN(링크 발급) | ACCEPTED(수락) | COMPLETED(완료)
 * ────────────────────────────────────────────────────*/
const InviteStatusSchema = z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']);

const ChallengeInviteSchema = z.object({
  id: z.number(),
  inviterId: z.number(),
  challengeId: z.number(),
  shareToken: z.string(),
  inviteeId: z.number().nullable(),
  status: InviteStatusSchema,
  regDate: z.string().nullable(),
  // R-06(2026-08): 목록 조회에서만 채워지는 챌린지 표시용 필드. 단건 생성/수락
  // 응답 등에서는 백엔드가 null 로 내려준다. 프론트는 없으면 "챌린지 #id" 로 폴백.
  challengeTitle: z.string().nullable(),
  subject: z.string().nullable(),
  unitName: z.string().nullable(),
  // R-07(2026-08): 조회자(나)가 이 챌린지를 이미 완료했는지. false 이면 "결과 보기"
  // 대신 "먼저 풀기"를 노출해야 한다(안 그러면 서버가 컨닝 가드로 정당하게 막는다).
  viewerCompleted: z.boolean(),
  // R-08(2026-08): 조회자 기준 상대방 표시 이름(닉네임 우선). 상대가 아직 정해지지
  // 않았거나(수락 전) 과거 응답(필드 배선 이전)에는 없을 수 있어 optional + nullable
  // 로 받는다. 프론트는 없으면 "상대 대기 중" 등으로 폴백하고 내부 회원 번호를
  // 노출하지 않는다.
  opponentName: z.string().nullable().optional(),
  opponentSolvedAt: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 도전장 미리보기 (공개·비로그인) Domain
 *  GET /api/public/challenge-invites/{token}
 *  - 정답/해설 제외, 퍼널 랜딩용.
 * ────────────────────────────────────────────────────*/
const ChallengeInvitePreviewSchema = z.object({
  shareToken: z.string(),
  status: InviteStatusSchema,
  challengeId: z.number(),
  challengeTitle: z.string(),
  subject: z.string().nullable(),
  difficulty: z.string().nullable(),
  inviterName: z.string().nullable(),
  sentAt: z.string().nullable(),
  receivedAt: z.string().nullable(),
  opponentSolvedAt: z.string().nullable(),
  opponentResultVisible: z.boolean(),
  lockedFieldCount: z.number(),
  lockReason: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 도전장 결과 비교 (컨닝 가드 통과 후) Domain
 *  GET /api/common/challenge-invites/{token}/result
 * ────────────────────────────────────────────────────*/
const AttemptSummarySchema = z.object({
  isCorrect: z.boolean().nullable(),
  selectedAnswer: z.string().nullable(),
  timeSpentSeconds: z.number().nullable(),
  solvedAt: z.string().nullable(),
  solutionImageUrl: z.string().nullable(),
  solutionShared: z.boolean(),
  solutionWithdrawn: z.boolean(),
});

const ChallengeInviteResultSchema = z.object({
  shareToken: z.string(),
  status: InviteStatusSchema,
  challengeId: z.number(),
  opponentName: z.string().optional(),
  viewerRole: z.enum(['INVITER', 'INVITEE']).optional(),
  openDuelCount: z.number().int().nonnegative().optional(),
  headToHead: z
    .object({
      win: z.number().int().nonnegative(),
      lose: z.number().int().nonnegative(),
      draw: z.number().int().nonnegative(),
    })
    .optional(),
  outcome: z.enum(['WIN', 'LOSE', 'BOTH_WRONG', 'BOTH_CORRECT']).nullable(),
  myCorrect: z.boolean().nullable(),
  opponentCorrect: z.boolean().nullable(),
  myAttempt: AttemptSummarySchema.nullable(),
  opponentAttempt: AttemptSummarySchema.nullable(),
  divergence: z
    .object({
      hasData: z.boolean(),
      wrongType: z.string().nullable(),
      reason: z.string().nullable(),
    })
    .nullable(),
  context: z
    .object({
      inviterName: z.string().nullable(),
      sentAt: z.string().nullable(),
      opponentSolvedAt: z.string().nullable(),
    })
    .nullable(),
});

const FriendTurnSummarySchema = z.object({
  myTurnCount: z.number(),
  oldest: z
    .object({
      shareToken: z.string(),
      opponentName: z.string().nullable(),
      challengeTitle: z.string().nullable(),
      receivedAt: z.string(),
    })
    .nullable(),
});

const FriendMasterySchema = z.object({
  friendId: z.number(),
  units: z.array(
    z.object({
      nodeId: z.number(),
      displayName: z.string(),
      subjectName: z.string(),
      masteryScore: z.number(),
    })
  ),
});

const FriendSummarySchema = z.object({
  friendId: z.number(),
  displayName: z.string(),
  relation: z.enum(['FRIEND', 'FRIEND_NO_DUEL', 'NOT_FRIEND']),
  record: z
    .object({
      win: z.number(),
      lose: z.number(),
      draw: z.number(),
      myTurn: z.number(),
    })
    .nullable(),
  brag: z
    .object({
      conqueredUnitCount: z.number(),
      badgeCount: z.number(),
      streakDays: z.number(),
      level: z.number(),
      solvedCount: z.number(),
    })
    .nullable(),
});

const FriendDuelsSchema = z.object({
  items: z.array(
    z.object({
      shareToken: z.string(),
      challengeId: z.number(),
      challengeTitle: z.string(),
      unitName: z.string().nullable(),
      status: InviteStatusSchema,
      viewerCompleted: z.boolean(),
      opponentSolvedAt: z.string().nullable(),
      outcome: z.enum(['WIN', 'LOSE', 'BOTH_WRONG', 'BOTH_CORRECT']).nullable(),
      sentAt: z.string(),
    })
  ),
  nextCursor: z.string().nullable(),
});

const RematchSchema = z.object({
  shareToken: z.string(),
  challengeId: z.number(),
  challengeTitle: z.string(),
  unitName: z.string(),
  rematchOfShareToken: z.string(),
});

const GuestSessionSchema = z.object({
  expiresAt: z.string(),
});

const GuestClaimSchema = z.object({
  claimedAttemptCount: z.number(),
  inviteAccepted: z.boolean(),
  treeNodeUpdatedCount: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 회원 검색 결과 (친구 요청 대상 찾기) Domain
 *  GET /api/common/members/search?q=
 *  - 이름/닉네임으로 검색, 본인 제외 상위 N명.
 * ────────────────────────────────────────────────────*/
const MemberSearchResultSchema = z.object({
  memberId: z.number(),
  name: z.string(),
  nickname: z.string().nullable(),
});

/* ─────────────────────────────────────────────────────
 * 친구 차단 / 신고 (F-18) Domain
 *  POST·DELETE /api/common/friends/{friendId}/block
 *  POST /api/common/friends/{friendId}/reports
 * ────────────────────────────────────────────────────*/
const MemberBlockResultSchema = z.object({
  memberId: z.number(),
  blocked: z.boolean(),
  blockedAt: z.string().nullable(),
});

const MemberReportReasonSchema = z.enum([
  'HARASSMENT',
  'INAPPROPRIATE_PROFILE',
  'CHEATING_OR_FRAUD',
  'SPAM',
  'OTHER',
]);

const MemberReportStatusSchema = z.enum([
  'PENDING',
  'REVIEWING',
  'RESOLVED',
  'DISMISSED',
]);

const MemberReportResultSchema = z.object({
  reportId: z.number(),
  status: MemberReportStatusSchema,
  createdAt: z.string(),
});

export const domain = {
  friendshipState: FriendshipStateSchema,
  friendship: FriendshipSchema,
  inviteStatus: InviteStatusSchema,
  challengeInvite: ChallengeInviteSchema,
  challengeInvitePreview: ChallengeInvitePreviewSchema,
  challengeInviteResult: ChallengeInviteResultSchema,
  attemptSummary: AttemptSummarySchema,
  friendTurnSummary: FriendTurnSummarySchema,
  friendMastery: FriendMasterySchema,
  friendSummary: FriendSummarySchema,
  friendDuels: FriendDuelsSchema,
  rematch: RematchSchema,
  guestSession: GuestSessionSchema,
  guestClaim: GuestClaimSchema,
  memberSearchResult: MemberSearchResultSchema,
  memberBlockResult: MemberBlockResultSchema,
  memberReportReason: MemberReportReasonSchema,
  memberReportStatus: MemberReportStatusSchema,
  memberReportResult: MemberReportResultSchema,
};
