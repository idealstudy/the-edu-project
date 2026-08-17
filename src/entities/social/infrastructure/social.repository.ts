import {
  type ChallengeInvite,
  type ChallengeInvitePreview,
  type ChallengeInviteResult,
  type CreateChallengeInvitePayload,
  type CreateGuestSessionPayload,
  type FriendDuels,
  type FriendMastery,
  type FriendRequestByPhonePayload,
  type FriendRequestPayload,
  type FriendSummary,
  type FriendTurnSummary,
  type Friendship,
  type GuestClaim,
  type GuestSession,
  type MemberBlockResult,
  type MemberReportCreatePayload,
  type MemberReportResult,
  type MemberSearchResult,
  type Rematch,
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
    myTurn: parsed.myTurn,
    lastActivity: parsed.lastActivity,
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
    opponentSolvedAt: parsed.opponentSolvedAt ?? null,
  });
};

const toInvitePreview = (raw: unknown): ChallengeInvitePreview => {
  const parsed = dto.challengeInvitePreview.parse(raw);
  return domain.challengeInvitePreview.parse({
    ...parsed,
    subject: parsed.subject ?? null,
    difficulty: parsed.difficulty ?? null,
    inviterName: parsed.inviterName ?? null,
    sentAt: parsed.sentAt ?? null,
    receivedAt: parsed.receivedAt ?? null,
    opponentSolvedAt: parsed.opponentSolvedAt ?? null,
    opponentResultVisible: parsed.opponentResultVisible,
    lockedFieldCount: parsed.lockedFieldCount,
    lockReason: parsed.lockReason ?? null,
  });
};

const toAttemptSummary = (
  raw:
    | {
        isCorrect?: boolean | null;
        selectedAnswer?: string | null;
        timeSpentSeconds?: number | null;
        solvedAt?: string | null;
        solutionImageUrl?: string | null;
        solutionShared?: boolean;
        solutionWithdrawn?: boolean;
      }
    | null
    | undefined
) => {
  if (!raw) return null;
  return {
    isCorrect: raw.isCorrect ?? null,
    selectedAnswer: raw.selectedAnswer ?? null,
    timeSpentSeconds: raw.timeSpentSeconds ?? null,
    solvedAt: raw.solvedAt ?? null,
    solutionImageUrl: raw.solutionImageUrl ?? null,
    solutionShared: raw.solutionShared ?? false,
    solutionWithdrawn: raw.solutionWithdrawn ?? false,
  };
};

const toInviteResult = (raw: unknown): ChallengeInviteResult => {
  const parsed = dto.challengeInviteResult.parse(raw);
  return domain.challengeInviteResult.parse({
    ...parsed,
    opponentName: parsed.opponentName,
    viewerRole: parsed.viewerRole,
    openDuelCount: parsed.openDuelCount,
    headToHead: parsed.headToHead,
    myCorrect: parsed.myCorrect ?? null,
    opponentCorrect: parsed.opponentCorrect ?? null,
    outcome: parsed.outcome ?? null,
    myAttempt: toAttemptSummary(parsed.myAttempt),
    opponentAttempt: toAttemptSummary(parsed.opponentAttempt),
    divergence: parsed.divergence
      ? {
          hasData: parsed.divergence.hasData,
          wrongType: parsed.divergence.wrongType ?? null,
          reason: parsed.divergence.reason ?? null,
        }
      : null,
    context: parsed.context
      ? {
          inviterName: parsed.context.inviterName ?? null,
          sentAt: parsed.context.sentAt ?? null,
          opponentSolvedAt: parsed.context.opponentSolvedAt ?? null,
        }
      : null,
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

const getFriendTurnSummary = async (): Promise<FriendTurnSummary> => {
  const response = await api.private.get('/common/friends/turn-summary');
  return domain.friendTurnSummary.parse(
    unwrapEnvelope(response, dto.friendTurnSummary)
  );
};

const getFriendSummary = async (friendId: number): Promise<FriendSummary> => {
  const response = await api.private.get(`/common/friends/${friendId}/summary`);
  return domain.friendSummary.parse(
    unwrapEnvelope(response, dto.friendSummary)
  );
};

const getFriendMastery = async (friendId: number): Promise<FriendMastery> => {
  const response = await api.private.get(`/common/friends/${friendId}/mastery`);
  return domain.friendMastery.parse(
    unwrapEnvelope(response, dto.friendMastery)
  );
};

const getFriendDuels = async (
  friendId: number,
  cursor?: string
): Promise<FriendDuels> => {
  const response = await api.private.get(`/common/friends/${friendId}/duels`, {
    params: { cursor, size: 20 },
  });
  return domain.friendDuels.parse(unwrapEnvelope(response, dto.friendDuels));
};

/* ─────────────────────────────────────────────────────
 * 친구 차단 / 신고 API (F-18)
 * ────────────────────────────────────────────────────*/
const blockFriend = async (friendId: number): Promise<MemberBlockResult> => {
  const response = await api.private.post(`/common/friends/${friendId}/block`);
  return domain.memberBlockResult.parse(
    unwrapEnvelope(response, dto.memberBlockResult)
  );
};

const unblockFriend = async (friendId: number): Promise<MemberBlockResult> => {
  const response = await api.private.delete(
    `/common/friends/${friendId}/block`
  );
  return domain.memberBlockResult.parse(
    unwrapEnvelope(response, dto.memberBlockResult)
  );
};

// 서버는 재사용 안전한(멱등) 신고를 요구한다(api-contract §4.11) — 요청마다
// 새 키를 만들면 실수로 두 번 눌러도 서버가 같은 신고로 합쳐 준다.
const createIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const reportFriend = async (
  friendId: number,
  body: MemberReportCreatePayload,
  idempotencyKey: string = createIdempotencyKey()
): Promise<MemberReportResult> => {
  const validated = payload.memberReportCreate.parse(body);
  const response = await api.private.post(
    `/common/friends/${friendId}/reports`,
    validated,
    { headers: { 'Idempotency-Key': idempotencyKey } }
  );
  return domain.memberReportResult.parse(
    unwrapEnvelope(response, dto.memberReportResult)
  );
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

const createRematch = async (token: string): Promise<Rematch> => {
  const response = await api.private.post(
    `/common/challenge-invites/${token}/rematch`
  );
  return domain.rematch.parse(unwrapEnvelope(response, dto.rematch));
};

const createGuestSession = async (
  body: CreateGuestSessionPayload
): Promise<GuestSession> => {
  const validated = payload.createGuestSession.parse(body);
  const response = await api.private.post('/public/guest-sessions', validated);
  return domain.guestSession.parse(unwrapEnvelope(response, dto.guestSession));
};

const claimGuestSession = async (): Promise<GuestClaim> => {
  const response = await api.private.post('/common/guest-sessions/claim');
  return domain.guestClaim.parse(unwrapEnvelope(response, dto.guestClaim));
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
  getFriendTurnSummary,
  getFriendSummary,
  getFriendMastery,
  getFriendDuels,
  blockFriend,
  unblockFriend,
  reportFriend,
  createInvite,
  getMyInvites,
  acceptInvite,
  getInviteResult,
  createRematch,
  createGuestSession,
  claimGuestSession,
  getPublicInvitePreview,
};
