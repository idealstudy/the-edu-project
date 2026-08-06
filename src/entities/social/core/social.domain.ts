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
const AttemptSummarySchema = z.object({
  isCorrect: z.boolean().nullable(),
  timeSpentSeconds: z.number().nullable(),
  solutionImageUrl: z.string().nullable(),
});

const ChallengeInviteResultSchema = z.object({
  shareToken: z.string(),
  status: InviteStatusSchema,
  challengeId: z.number(),
  myCorrect: z.boolean().nullable(),
  opponentCorrect: z.boolean().nullable(),
  myAttempt: AttemptSummarySchema.nullable(),
  opponentAttempt: AttemptSummarySchema.nullable(),
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
  attemptSummary: AttemptSummarySchema,
  memberSearchResult: MemberSearchResultSchema,
};
