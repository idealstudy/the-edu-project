import {
  type ChallengeInvite,
  type ChallengeInvitePreview,
  type ChallengeInviteResult,
  type CreateChallengeInvitePayload,
  type FriendRequestByPhonePayload,
  type FriendRequestPayload,
  type Friendship,
  type MemberSearchResult,
} from '@/entities/social/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { z } from 'zod';

import { domain } from './../core/social.domain';
import { dto, payload } from './social.dto';

/* ─────────────────────────────────────────────────────
 * DTO → Domain 변환
 * ────────────────────────────────────────────────────*/
const toFriendship = (raw: unknown): Friendship => {
  const parsed = dto.friendship.parse(raw);
  return domain.friendship.parse({
    ...parsed,
    regDate: parsed.regDate ?? null,
    requesterName: parsed.requesterName ?? null,
    requesterProfileImageUrl: parsed.requesterProfileImageUrl ?? null,
    addresseeName: parsed.addresseeName ?? null,
    addresseeProfileImageUrl: parsed.addresseeProfileImageUrl ?? null,
  });
};

const toChallengeInvite = (raw: unknown): ChallengeInvite => {
  const parsed = dto.challengeInvite.parse(raw);
  return domain.challengeInvite.parse({
    ...parsed,
    inviteeId: parsed.inviteeId ?? null,
    regDate: parsed.regDate ?? null,
    challengeTitle: parsed.challengeTitle ?? null,
    subject: parsed.subject ?? null,
    unitName: parsed.unitName ?? null,
    viewerCompleted: parsed.viewerCompleted ?? false,
    opponentName: parsed.opponentName ?? null,
  });
};

const toInvitePreview = (raw: unknown): ChallengeInvitePreview => {
  const parsed = dto.challengeInvitePreview.parse(raw);
  return domain.challengeInvitePreview.parse({
    ...parsed,
    subject: parsed.subject ?? null,
    difficulty: parsed.difficulty ?? null,
  });
};

const toAttemptSummary = (
  raw:
    | {
        isCorrect?: boolean | null;
        timeSpentSeconds?: number | null;
        solutionImageUrl?: string | null;
      }
    | null
    | undefined
) => {
  if (!raw) return null;
  return {
    isCorrect: raw.isCorrect ?? null,
    timeSpentSeconds: raw.timeSpentSeconds ?? null,
    solutionImageUrl: raw.solutionImageUrl ?? null,
  };
};

const toInviteResult = (raw: unknown): ChallengeInviteResult => {
  const parsed = dto.challengeInviteResult.parse(raw);
  return domain.challengeInviteResult.parse({
    ...parsed,
    myCorrect: parsed.myCorrect ?? null,
    opponentCorrect: parsed.opponentCorrect ?? null,
    myAttempt: toAttemptSummary(parsed.myAttempt),
    opponentAttempt: toAttemptSummary(parsed.opponentAttempt),
  });
};

const toMemberSearchResult = (raw: unknown): MemberSearchResult => {
  const parsed = dto.memberSearchResult.parse(raw);
  return domain.memberSearchResult.parse({
    ...parsed,
    nickname: parsed.nickname ?? null,
  });
};

/* ─────────────────────────────────────────────────────
 * 친구 API
 * ────────────────────────────────────────────────────*/
const searchMembers = async (q: string): Promise<MemberSearchResult[]> => {
  const params = payload.memberSearchQuery.parse({ q });
  const response = await api.private.get('/common/members/search', { params });
  const list = unwrapEnvelope(response, z.array(z.unknown()));
  return list.map(toMemberSearchResult);
};

const requestFriend = async (
  body: FriendRequestPayload
): Promise<Friendship> => {
  const validated = payload.friendRequest.parse(body);
  const response = await api.private.post('/common/friends', validated);
  return toFriendship(unwrapEnvelope(response, z.unknown()));
};

// 전화번호로 친구요청 — phoneNumber 를 String 그대로 전송(앞 0 보존).
const requestFriendByPhone = async (
  body: FriendRequestByPhonePayload
): Promise<Friendship> => {
  const validated = payload.friendRequestByPhone.parse(body);
  const response = await api.private.post(
    '/common/friends/by-phone',
    validated
  );
  return toFriendship(unwrapEnvelope(response, z.unknown()));
};

const acceptFriend = async (friendshipId: number): Promise<Friendship> => {
  const response = await api.private.post(
    `/common/friends/${friendshipId}/accept`
  );
  return toFriendship(unwrapEnvelope(response, z.unknown()));
};

const getMyFriends = async (): Promise<Friendship[]> => {
  const response = await api.private.get('/common/friends');
  const list = unwrapEnvelope(response, z.array(z.unknown()));
  return list.map(toFriendship);
};

/* ─────────────────────────────────────────────────────
 * 도전장 API
 * ────────────────────────────────────────────────────*/
const createInvite = async (
  body: CreateChallengeInvitePayload
): Promise<ChallengeInvite> => {
  const validated = payload.createChallengeInvite.parse(body);
  const response = await api.private.post(
    '/common/challenge-invites',
    validated
  );
  return toChallengeInvite(unwrapEnvelope(response, z.unknown()));
};

const getMyInvites = async (): Promise<ChallengeInvite[]> => {
  const response = await api.private.get('/common/challenge-invites/me');
  const list = unwrapEnvelope(response, z.array(z.unknown()));
  return list.map(toChallengeInvite);
};

const acceptInvite = async (token: string): Promise<ChallengeInvite> => {
  const response = await api.private.post(
    `/common/challenge-invites/${token}/accept`
  );
  return toChallengeInvite(unwrapEnvelope(response, z.unknown()));
};

const getInviteResult = async (
  token: string
): Promise<ChallengeInviteResult> => {
  const response = await api.private.get(
    `/common/challenge-invites/${token}/result`
  );
  return toInviteResult(unwrapEnvelope(response, z.unknown()));
};

/* ─────────────────────────────────────────────────────
 * 도전장 미리보기 (공개·비로그인)
 * ────────────────────────────────────────────────────*/
const getPublicInvitePreview = async (
  token: string
): Promise<ChallengeInvitePreview> => {
  const response = await api.public.get(`/public/challenge-invites/${token}`);
  return toInvitePreview(unwrapEnvelope(response, z.unknown()));
};

export const repository = {
  searchMembers,
  requestFriend,
  requestFriendByPhone,
  acceptFriend,
  getMyFriends,
  createInvite,
  getMyInvites,
  acceptInvite,
  getInviteResult,
  getPublicInvitePreview,
};
