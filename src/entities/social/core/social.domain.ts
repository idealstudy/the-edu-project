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
});

/* ─────────────────────────────────────────────────────
 * 도전장 결과 비교 (컨닝 가드 통과 후) Domain
 *  GET /api/common/challenge-invites/{token}/result
 * ────────────────────────────────────────────────────*/
const ChallengeInviteResultSchema = z.object({
  shareToken: z.string(),
  status: InviteStatusSchema,
  challengeId: z.number(),
  myCorrect: z.boolean().nullable(),
  opponentCorrect: z.boolean().nullable(),
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

export const domain = {
  friendshipState: FriendshipStateSchema,
  friendship: FriendshipSchema,
  inviteStatus: InviteStatusSchema,
  challengeInvite: ChallengeInviteSchema,
  challengeInvitePreview: ChallengeInvitePreviewSchema,
  challengeInviteResult: ChallengeInviteResultSchema,
  memberSearchResult: MemberSearchResultSchema,
};
