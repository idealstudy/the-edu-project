import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 공통
 * ────────────────────────────────────────────────────*/
const NullableString = z.string().nullable().optional();

/* ─────────────────────────────────────────────────────
 * 친구 DTO (FriendshipResponse)
 * ────────────────────────────────────────────────────*/
const FriendshipDtoSchema = z.object({
  id: z.number(),
  requesterId: z.number(),
  addresseeId: z.number(),
  state: z.enum(['PENDING', 'ACCEPTED']),
  regDate: NullableString,
  requesterName: NullableString,
  requesterProfileImageUrl: NullableString,
  addresseeName: NullableString,
  addresseeProfileImageUrl: NullableString,
  myTurn: z.boolean().optional(),
  lastActivity: z
    .object({
      occurredAt: z.string(),
      // 서버가 활동 종류를 먼저 추가해도 친구 목록 전체를 깨뜨리지 않는다.
      // 사용자에게 보여줄 수 있는 값인지는 표시 계층의 허용 목록이 결정한다.
      type: z.string(),
    })
    .nullable()
    .optional(),
});

/* ─────────────────────────────────────────────────────
 * 도전장 DTO (ChallengeInviteResponse)
 * ────────────────────────────────────────────────────*/
const ChallengeInviteDtoSchema = z.object({
  id: z.number(),
  inviterId: z.number(),
  challengeId: z.number(),
  shareToken: z.string(),
  inviteeId: z.number().nullable().optional(),
  status: z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']),
  regDate: NullableString,
  // R-06/R-07: 과거(백엔드 배포 전) 응답 호환을 위해 optional 로 받아 repository
  // 단에서 안전한 기본값(null/false)으로 채운다.
  challengeTitle: NullableString,
  subject: NullableString,
  unitName: NullableString,
  viewerCompleted: z.boolean().nullable().optional(),
  // R-08: 조회자 기준 상대방 표시 이름. 과거 응답 호환을 위해 optional.
  opponentName: NullableString,
  opponentSolvedAt: NullableString,
});

/* ─────────────────────────────────────────────────────
 * 도전장 미리보기 DTO (ChallengeInvitePreviewResponse)
 * ────────────────────────────────────────────────────*/
const ChallengeInvitePreviewDtoSchema = z.object({
  shareToken: z.string(),
  status: z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']),
  challengeId: z.number(),
  challengeTitle: z.string(),
  subject: NullableString,
  difficulty: NullableString,
  inviterName: NullableString,
  sentAt: NullableString,
  receivedAt: NullableString,
  opponentSolvedAt: NullableString,
  opponentResultVisible: z.boolean().optional().default(false),
  lockedFieldCount: z.number().int().nonnegative().optional().default(0),
  lockReason: NullableString,
});

/* ─────────────────────────────────────────────────────
 * 도전장 결과 비교 DTO (ChallengeInviteResultResponse)
 * ────────────────────────────────────────────────────*/
const AttemptSummaryDtoSchema = z.object({
  isCorrect: z.boolean().nullable().optional(),
  selectedAnswer: NullableString,
  timeSpentSeconds: z.number().nullable().optional(),
  solvedAt: NullableString,
  solutionImageUrl: NullableString,
  solutionShared: z.boolean().optional().default(false),
  solutionWithdrawn: z.boolean().optional().default(false),
});

const ChallengeInviteResultDtoSchema = z.object({
  shareToken: z.string(),
  status: z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']),
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
  outcome: z
    .enum(['WIN', 'LOSE', 'BOTH_WRONG', 'BOTH_CORRECT'])
    .nullable()
    .optional(),
  myCorrect: z.boolean().nullable().optional(),
  opponentCorrect: z.boolean().nullable().optional(),
  myAttempt: AttemptSummaryDtoSchema.nullable().optional(),
  opponentAttempt: AttemptSummaryDtoSchema.nullable().optional(),
  divergence: z
    .object({
      hasData: z.boolean(),
      wrongType: NullableString,
      reason: NullableString,
    })
    .nullable()
    .optional(),
  context: z
    .object({
      inviterName: NullableString,
      sentAt: NullableString,
      opponentSolvedAt: NullableString,
    })
    .nullable()
    .optional(),
});

const FriendTurnSummaryDtoSchema = z.object({
  myTurnCount: z.number().int().nonnegative(),
  oldest: z
    .object({
      shareToken: z.string(),
      opponentName: z.string().nullable(),
      challengeTitle: z.string().nullable(),
      receivedAt: z.string(),
    })
    .nullable(),
});

const FriendMasteryDtoSchema = z.object({
  friendId: z.number(),
  units: z.array(
    z.object({
      nodeId: z.number(),
      displayName: z.string(),
      subjectName: z.string(),
      masteryScore: z.number().min(0).max(100),
    })
  ),
});

const FriendSummaryDtoSchema = z.object({
  friendId: z.number(),
  displayName: z.string(),
  relation: z.enum(['FRIEND', 'FRIEND_NO_DUEL', 'NOT_FRIEND']),
  record: z
    .object({
      win: z.number().int().nonnegative(),
      lose: z.number().int().nonnegative(),
      draw: z.number().int().nonnegative(),
      myTurn: z.number().int().nonnegative(),
    })
    .nullable(),
  brag: z
    .object({
      conqueredUnitCount: z.number().int().nonnegative(),
      badgeCount: z.number().int().nonnegative(),
      streakDays: z.number().int().nonnegative(),
      level: z.number().int().nonnegative(),
      solvedCount: z.number().int().nonnegative(),
    })
    .nullable(),
});

const FriendDuelItemDtoSchema = z.object({
  shareToken: z.string(),
  challengeId: z.number(),
  challengeTitle: z.string(),
  unitName: NullableString,
  status: z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']),
  viewerCompleted: z.boolean(),
  opponentSolvedAt: NullableString,
  outcome: z.enum(['WIN', 'LOSE', 'BOTH_WRONG', 'BOTH_CORRECT']).nullable(),
  sentAt: z.string(),
});

const FriendDuelsDtoSchema = z.object({
  items: z.array(FriendDuelItemDtoSchema),
  nextCursor: NullableString,
});

const RematchDtoSchema = z.object({
  shareToken: z.string(),
  challengeId: z.number(),
  challengeTitle: z.string(),
  unitName: z.string(),
  rematchOfShareToken: z.string(),
});

const GuestSessionDtoSchema = z.object({
  expiresAt: z.string(),
});

const GuestClaimDtoSchema = z.object({
  claimedAttemptCount: z.number().int().nonnegative(),
  inviteAccepted: z.boolean(),
  treeNodeUpdatedCount: z.number().int().nonnegative(),
});

/* ─────────────────────────────────────────────────────
 * 회원 검색 DTO (MemberSearchResult)
 *  GET /api/common/members/search?q=
 * ────────────────────────────────────────────────────*/
const MemberSearchResultDtoSchema = z.object({
  memberId: z.number(),
  name: z.string(),
  nickname: NullableString,
});

export const dto = {
  friendship: FriendshipDtoSchema,
  challengeInvite: ChallengeInviteDtoSchema,
  challengeInvitePreview: ChallengeInvitePreviewDtoSchema,
  challengeInviteResult: ChallengeInviteResultDtoSchema,
  friendTurnSummary: FriendTurnSummaryDtoSchema,
  friendMastery: FriendMasteryDtoSchema,
  friendSummary: FriendSummaryDtoSchema,
  friendDuels: FriendDuelsDtoSchema,
  rematch: RematchDtoSchema,
  guestSession: GuestSessionDtoSchema,
  guestClaim: GuestClaimDtoSchema,
  memberSearchResult: MemberSearchResultDtoSchema,
  memberSearchResults: z.array(MemberSearchResultDtoSchema),
};

/* ─────────────────────────────────────────────────────
 * Payload (요청 바디)
 * ────────────────────────────────────────────────────*/
const FriendRequestPayloadSchema = z.object({
  addresseeId: z.number(),
});

// 전화번호로 친구요청 — 숫자는 String 으로 유지(앞 0 보존). 하이픈은 백엔드/입력에서 정규화.
const FriendRequestByPhonePayloadSchema = z.object({
  phoneNumber: z.string().trim().min(1),
});

const CreateChallengeInvitePayloadSchema = z.object({
  challengeId: z.number(),
});

const CreateGuestSessionPayloadSchema = z.object({
  challengeId: z.number(),
  shareToken: z.string().optional(),
});

const MemberSearchQuerySchema = z.object({
  q: z.string().trim().min(1),
});

export const payload = {
  friendRequest: FriendRequestPayloadSchema,
  friendRequestByPhone: FriendRequestByPhonePayloadSchema,
  createChallengeInvite: CreateChallengeInvitePayloadSchema,
  createGuestSession: CreateGuestSessionPayloadSchema,
  memberSearchQuery: MemberSearchQuerySchema,
};
