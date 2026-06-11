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
const ChallengeInviteResultDtoSchema = z.object({
  shareToken: z.string(),
  status: z.enum(['OPEN', 'ACCEPTED', 'COMPLETED']),
  challengeId: z.number(),
  myCorrect: z.boolean().nullable().optional(),
  opponentCorrect: z.boolean().nullable().optional(),
});

export const dto = {
  friendship: FriendshipDtoSchema,
  challengeInvite: ChallengeInviteDtoSchema,
  challengeInvitePreview: ChallengeInvitePreviewDtoSchema,
  challengeInviteResult: ChallengeInviteResultDtoSchema,
};

/* ─────────────────────────────────────────────────────
 * Payload (요청 바디)
 * ────────────────────────────────────────────────────*/
const FriendRequestPayloadSchema = z.object({
  addresseeId: z.number(),
});

const CreateChallengeInvitePayloadSchema = z.object({
  challengeId: z.number(),
});

export const payload = {
  friendRequest: FriendRequestPayloadSchema,
  createChallengeInvite: CreateChallengeInvitePayloadSchema,
};
