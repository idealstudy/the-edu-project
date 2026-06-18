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
export type ChallengeInviteResult = z.infer<typeof domain.challengeInviteResult>;

export type MemberSearchResult = z.infer<typeof domain.memberSearchResult>;

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
export type MemberSearchQuery = z.infer<typeof payload.memberSearchQuery>;
