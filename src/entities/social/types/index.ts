import { domain } from '@/entities/social/core';
import { payload } from '@/entities/social/infrastructure/social.dto';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Frontend Type — 친구 / 도전장
 * ────────────────────────────────────────────────────*/
export type FriendshipState = z.infer<typeof domain.friendshipState>;
export type Friendship = z.infer<typeof domain.friendship>;

export type InviteStatus = z.infer<typeof domain.inviteStatus>;
export type ChallengeInvite = z.infer<typeof domain.challengeInvite>;
export type ChallengeInvitePreview = z.infer<
  typeof domain.challengeInvitePreview
>;
export type ChallengeInviteResult = z.infer<
  typeof domain.challengeInviteResult
>;
export type FriendTurnSummary = z.infer<typeof domain.friendTurnSummary>;
export type FriendMastery = z.infer<typeof domain.friendMastery>;
export type FriendSummary = z.infer<typeof domain.friendSummary>;
export type FriendDuels = z.infer<typeof domain.friendDuels>;
export type Rematch = z.infer<typeof domain.rematch>;
export type GuestSession = z.infer<typeof domain.guestSession>;
export type GuestClaim = z.infer<typeof domain.guestClaim>;

export type MemberSearchResult = z.infer<typeof domain.memberSearchResult>;

export type MemberBlockResult = z.infer<typeof domain.memberBlockResult>;
export type MemberReportReason = z.infer<typeof domain.memberReportReason>;
export type MemberReportStatus = z.infer<typeof domain.memberReportStatus>;
export type MemberReportResult = z.infer<typeof domain.memberReportResult>;

/* ─────────────────────────────────────────────────────
 * Payload Type
 * ────────────────────────────────────────────────────*/
export type FriendRequestPayload = z.infer<typeof payload.friendRequest>;
export type FriendRequestByPhonePayload = z.infer<
  typeof payload.friendRequestByPhone
>;
export type CreateChallengeInvitePayload = z.infer<
  typeof payload.createChallengeInvite
>;
export type CreateGuestSessionPayload = z.infer<
  typeof payload.createGuestSession
>;
export type MemberSearchQuery = z.infer<typeof payload.memberSearchQuery>;
export type MemberReportCreatePayload = z.infer<
  typeof payload.memberReportCreate
>;
