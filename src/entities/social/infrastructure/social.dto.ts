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
});

/* ─────────────────────────────────────────────────────
 * 도전장 결과 비교 DTO (ChallengeInviteResultResponse)
 * ────────────────────────────────────────────────────*/
const AttemptSummaryDtoSchema = z.object({
  isCorrect: z.boolean().nullable().optional(),
  timeSpentSeconds: z.number().nullable().optional(),
  solutionImageUrl: NullableString,
});

const ChallengeInviteResultDtoSchema = z.object({
  shareToken: z.string(),
  status: z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']),
  challengeId: z.number(),
  myCorrect: z.boolean().nullable().optional(),
  opponentCorrect: z.boolean().nullable().optional(),
  myAttempt: AttemptSummaryDtoSchema.nullable().optional(),
  opponentAttempt: AttemptSummaryDtoSchema.nullable().optional(),
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

const MemberSearchQuerySchema = z.object({
  q: z.string().trim().min(1),
});

export const payload = {
  friendRequest: FriendRequestPayloadSchema,
  friendRequestByPhone: FriendRequestByPhonePayloadSchema,
  createChallengeInvite: CreateChallengeInvitePayloadSchema,
  memberSearchQuery: MemberSearchQuerySchema,
};
