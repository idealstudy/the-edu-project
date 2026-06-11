import {
  type ChallengeListParams,
  type MyChallengeListParams,
  type RecommendedChallengeParams,
} from '../types';

/* ─────────────────────────────────────────────────────
 * Query Key 파라미터 정규화
 * ────────────────────────────────────────────────────*/
const normalizeListParams = (params: ChallengeListParams = {}) => ({
  subject: params.subject ?? 'ALL',
  difficulty: params.difficulty ?? 'ALL',
  sort: params.sort ?? 'latest',
  page: params.page ?? 0,
  size: params.size ?? 20,
});

const normalizeRecommendedParams = (params: RecommendedChallengeParams = {}) => ({
  grade: params.grade ?? null,
  subject: params.subject ?? 'ALL',
});

const normalizeMyChallengeListParams = (
  params: MyChallengeListParams = {}
) => ({
  status: params.status ?? 'ALL',
  result: params.result ?? 'ALL',
  page: params.page ?? 0,
  size: params.size ?? 10,
});

/* ─────────────────────────────────────────────────────
 * Query Keys
 * ────────────────────────────────────────────────────*/
export const openChallengeKeys = {
  all: ['open-challenge'] as const,
  list: (params: ChallengeListParams = {}) =>
    [...openChallengeKeys.all, 'list', normalizeListParams(params)] as const,
  recommended: (params: RecommendedChallengeParams = {}) =>
    [
      ...openChallengeKeys.all,
      'recommended',
      normalizeRecommendedParams(params),
    ] as const,
  detail: (id: string) => [...openChallengeKeys.all, 'detail', id] as const,
  next: (id: string) => [...openChallengeKeys.all, 'next', id] as const,
  reviewsBase: (challengeId: string) =>
    [...openChallengeKeys.all, 'reviews', challengeId] as const,
  reviews: (challengeId: string, sort = 'recommend') =>
    [...openChallengeKeys.reviewsBase(challengeId), sort] as const,
  ranking: () => [...openChallengeKeys.all, 'ranking'] as const,
  myList: (params: MyChallengeListParams = {}) =>
    [
      ...openChallengeKeys.all,
      'my-list',
      normalizeMyChallengeListParams(params),
    ] as const,
  myDetail: (challengeId: string) =>
    [...openChallengeKeys.all, 'my-detail', challengeId] as const,
  adminList: (params: ChallengeListParams = {}) =>
    [
      ...openChallengeKeys.all,
      'admin-list',
      normalizeListParams(params),
    ] as const,
  adminDetail: (id: string) =>
    [...openChallengeKeys.all, 'admin-detail', id] as const,
  aiCoachingEnums: () =>
    [...openChallengeKeys.all, 'ai-coaching-enums'] as const,
  aiCoachingPreference: () =>
    [...openChallengeKeys.all, 'ai-coaching-preference', 'me'] as const,
  aiCoachingMessages: (sessionId: string) =>
    [...openChallengeKeys.all, 'ai-coaching-messages', sessionId] as const,
  solution: (attemptId: string) =>
    [...openChallengeKeys.all, 'solution', attemptId] as const,
};
