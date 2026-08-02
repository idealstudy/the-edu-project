import { domain } from '@/entities/open-challenge/core';
import {
  type AdminChallengeDetail,
  type AdminChallengeDifficulty,
  type AdminChallengePayload,
  type AiCoachingEnums,
  type AiCoachingMessage,
  type AiCoachingMessageResponse,
  type AiCoachingPreference,
  type AiCoachingPreferencePayload,
  type AiCoachingSession,
  type ChallengeAttempt,
  type ChallengeDetail,
  type ChallengeListItem,
  type ChallengeListParams,
  type ChallengeReview,
  type ChallengeReviewSort,
  type ChallengeSolution,
  type CreateAiCoachingSessionPayload,
  type CreateChallengeReviewPayload,
  type MyChallengeDetail,
  type MyChallengeListItem,
  type MyChallengeListParams,
  type NextChallenge,
  type RecommendedChallengeItem,
  type RecommendedChallengeParams,
  type SendAiCoachingMessagePayload,
  type StartChallengeAttemptPayload,
  type SubmitChallengeAnswerPayload,
  type SubmitChallengeFeedbackPayload,
  type UserRanking,
} from '@/entities/open-challenge/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { z } from 'zod';

import { dto, payload } from './open-challenge.dto';

/* ─────────────────────────────────────────────────────
 * 변환 상수 / Helper
 * ────────────────────────────────────────────────────*/
const SUBJECT_LABELS = {
  MATH: '수학',
  KOREAN: '국어',
  ENGLISH: '영어',
  SCIENCE: '탐구',
} as const;

const toSubject = (subject: string): keyof typeof SUBJECT_LABELS => {
  switch (subject.toLowerCase()) {
    case 'korean':
      return 'KOREAN';
    case 'english':
      return 'ENGLISH';
    case 'science':
      return 'SCIENCE';
    case 'math':
    default:
      return 'MATH';
  }
};

const toAdminDifficulty = (difficulty: string): AdminChallengeDifficulty => {
  switch (difficulty.toUpperCase()) {
    case 'TOP':
    case 'HIGHEST':
    case '최상':
      return 'TOP';
    case 'HIGH':
    case '상':
      return 'HIGH';
    case 'LOW':
    case '하':
      return 'LOW';
    case 'MID':
    case 'MIDDLE':
    case '중':
    default:
      return 'MID';
  }
};

const toApiParams = (params: ChallengeListParams) => ({
  subject:
    !params.subject || params.subject === 'ALL' ? undefined : params.subject,
  difficulty:
    !params.difficulty || params.difficulty === 'ALL'
      ? undefined
      : {
          highest: 'TOP',
          high: 'HIGH',
          middle: 'MID',
          low: 'LOW',
        }[params.difficulty],
  sort:
    params.sort === 'latest'
      ? 'LATEST'
      : params.sort === 'popular'
        ? 'POPULAR'
        : undefined,
  page: params.page,
  size: params.size,
});

/* ─────────────────────────────────────────────────────
 * DTO → Domain 변환
 * ────────────────────────────────────────────────────*/
const toListItem = (raw: unknown): ChallengeListItem => {
  const parsed = dto.listItem.parse(raw);
  const id = parsed.id ?? parsed.challengeId;

  if (!id) {
    throw new Error('Challenge id is missing.');
  }

  return domain.listItem.parse({
    id,
    subject: toSubject(parsed.subject),
    difficulty: toAdminDifficulty(parsed.difficulty),
    title: parsed.questionText ?? parsed.title,
    sourceText: parsed.sourceText,
    questionImageUrl: parsed.questionImageUrl,
    passRate: parsed.passRate,
    participantCount: parsed.participantCount,
  });
};

const toRecommended = (raw: unknown): RecommendedChallengeItem => {
  const parsed = dto.recommended.parse(raw);
  const id = parsed.id ?? parsed.challengeId;

  if (!id) {
    throw new Error('Challenge id is missing.');
  }

  return domain.recommended.parse({
    id,
    subject: toSubject(parsed.subject),
    difficulty: toAdminDifficulty(parsed.difficulty),
    title: parsed.questionText ?? parsed.sourceText,
    sourceText: parsed.sourceText,
    questionImageUrl: parsed.questionImageUrl,
    wrongAnswerRate: parsed.wrongAnswerRate ?? 0,
    participantCount: parsed.participantCount,
    recommendReason: parsed.recommendReason,
  });
};

const toDetail = (raw: unknown): ChallengeDetail => {
  const parsed = dto.detail.parse(raw);
  const subject = toSubject(parsed.subject);
  const id = parsed.id ?? parsed.challengeId;

  if (!id) {
    throw new Error('Challenge id is missing.');
  }

  return domain.detail.parse({
    id,
    subject: SUBJECT_LABELS[subject],
    topic: parsed.topic ?? parsed.sourceText ?? parsed.title,
    questionNumber: parsed.questionNumber,
    questionText: parsed.questionText,
    questionImageUrl: parsed.questionImageUrl,
    choices: parsed.choices,
    passRate: parsed.passRate,
    wrongAnswerRate: parsed.wrongAnswerRate,
    participantCount: parsed.participantCount,
    isAiSupported: parsed.isAiSupported ?? parsed.aiSupported ?? true,
  });
};

const toAdminDetail = (raw: unknown): AdminChallengeDetail => {
  const parsed = dto.detail.parse(raw);
  const id = parsed.id ?? parsed.challengeId;

  if (!id) {
    throw new Error('Challenge id is missing.');
  }

  return {
    id,
    subject: toSubject(parsed.subject),
    difficulty: toAdminDifficulty(parsed.difficulty),
    wrongAnswerRate: parsed.wrongAnswerRate,
    title: parsed.title,
    sourceText: parsed.sourceText,
    questionText: parsed.questionText,
    questionMediaId: parsed.questionMediaId,
    questionImageUrl: parsed.questionImageUrl,
    choices: parsed.choices,
    correctAnswer: parsed.correctAnswer ?? '',
    type: parsed.type ?? '',
    participantCount: parsed.participantCount,
    passRate: parsed.passRate ?? null,
  };
};

const toSolutionType = (value: string): 'TEXT' | 'DRAWING' =>
  value.toUpperCase() === 'DRAWING' ? 'DRAWING' : 'TEXT';

const toReview = (raw: unknown): ChallengeReview => {
  const parsed = dto.review.parse(raw);
  return domain.review.parse({
    id:
      parsed.id ??
      parsed.reviewId ??
      `${parsed.nickname}-${parsed.recommendCount}`,
    nickname: parsed.nickname,
    subject: parsed.subject,
    content: parsed.content,
    solutionType: toSolutionType(parsed.solutionType),
    drawingImageUrl: parsed.drawingImageUrl,
    recommendCount: parsed.recommendCount,
    isBest: parsed.isBest ?? parsed.best ?? false,
    isRecommendedByMe:
      parsed.isRecommendedByMe ?? parsed.recommendedByMe ?? false,
  });
};

const toMyChallengeListItem = (raw: unknown): MyChallengeListItem => {
  const parsed = dto.myChallengeListItem.parse(raw);

  return domain.myChallengeListItem.parse({
    challengeId: parsed.challengeId,
    subject: toSubject(parsed.subject),
    difficulty: parsed.difficulty,
    status: parsed.status,
    sourceText: parsed.sourceText,
    questionText: parsed.questionText ?? '문제 이미지를 보고 답을 선택했어요.',
    questionImageUrl: parsed.questionImageUrl,
    isCorrect: parsed.isCorrect,
    usedAi: parsed.usedAi,
    completedAt: parsed.completedAt,
  });
};

const toMyChallengeDetail = (raw: unknown): MyChallengeDetail => {
  const parsed = dto.myChallengeDetail.parse(raw);

  return domain.myChallengeDetail.parse({
    challengeId: parsed.challengeId,
    attempts: parsed.attempts.map((attempt) => ({
      ...attempt,
      maxUsedHintStep: attempt.maxUsedHintStep ?? null,
      startedAt: attempt.startedAt ?? null,
      completedAt: attempt.completedAt ?? null,
    })),
    reviews: parsed.reviews.map((review) => ({
      reviewId: review.reviewId,
      content: review.content,
      isActive: review.isActive ?? review.active ?? false,
      recommendCount: review.recommendCount,
    })),
  });
};

/* ─────────────────────────────────────────────────────
 * [READ] 오픈챌린지 목록 조회 (공개)
 * ────────────────────────────────────────────────────*/
const getChallengeList = async (
  params: ChallengeListParams = {}
): Promise<ChallengeListItem[]> => {
  const response = await api.public.get('/public/challenges', {
    params: toApiParams(params),
  });
  const page = unwrapEnvelope(response, dto.listPage);
  return page.content.map(toListItem);
};

/* ─────────────────────────────────────────────────────
 * [READ] 추천 오픈챌린지 조회 (공개 · 오답률·등급 기반)
 *  GET /api/public/challenges/recommended?grade=&subject=
 *  - grade 미지정 시 백엔드가 오답률 내림차순으로 추천.
 *  - subject 'ALL'/미지정은 파라미터 생략(전체 과목).
 *  - 응답은 평면 배열(List<RecommendedChallengeResponse>).
 * ────────────────────────────────────────────────────*/
const getRecommendedChallenges = async (
  params: RecommendedChallengeParams = {}
): Promise<RecommendedChallengeItem[]> => {
  const response = await api.public.get('/public/challenges/recommended', {
    params: {
      grade: params.grade ?? undefined,
      subject:
        !params.subject || params.subject === 'ALL'
          ? undefined
          : params.subject,
    },
  });
  const list = unwrapEnvelope(response, dto.recommendedList);
  return list.map(toRecommended);
};

/* ─────────────────────────────────────────────────────
 * [READ] 관리자페이지 - 오픈챌린지 목록 조회
 * ────────────────────────────────────────────────────*/
const getAdminChallengeList = async (params: ChallengeListParams = {}) => {
  const response = await api.public.get('/public/challenges', {
    params: toApiParams(params),
  });
  const page = unwrapEnvelope(response, dto.listPage);

  return {
    ...page,
    content: page.content.map(toListItem),
  };
};

/* ─────────────────────────────────────────────────────
 * [READ] 오픈챌린지 상세 조회 (공개)
 * ────────────────────────────────────────────────────*/
const getChallengeDetail = async (id: string): Promise<ChallengeDetail> => {
  const response = await api.public.get(`/public/challenges/${id}`);
  const detail = unwrapEnvelope(response, dto.detail);
  return toDetail(detail);
};

/* ─────────────────────────────────────────────────────
 * [READ] 관리자페이지 - 오픈챌린지 상세 조회
 * ────────────────────────────────────────────────────*/
const getAdminChallengeDetail = async (
  id: string
): Promise<AdminChallengeDetail> => {
  const response = await api.public.get(`/public/challenges/${id}`);
  const detail = unwrapEnvelope(response, dto.detail);
  return toAdminDetail(detail);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 관리자페이지 - 오픈챌린지 생성
 * ────────────────────────────────────────────────────*/
const createAdminChallenge = async (
  params: AdminChallengePayload
): Promise<string> => {
  const validated = payload.adminChallenge.parse(params);
  const response = await api.private.post('/admin/challenges', validated);
  const result = unwrapEnvelope(response, dto.challengeId);
  return result.challengeId;
};

/* ─────────────────────────────────────────────────────
 * [UPDATE] 관리자페이지 - 오픈챌린지 수정
 * ────────────────────────────────────────────────────*/
const updateAdminChallenge = async (
  id: string,
  params: AdminChallengePayload
): Promise<void> => {
  const validated = payload.adminChallenge.parse(params);
  await api.private.put(`/admin/challenges/${id}`, validated);
};

/* ─────────────────────────────────────────────────────
 * [PATCH] 관리자페이지 - 오픈챌린지 숨김 처리
 * ────────────────────────────────────────────────────*/
const hideAdminChallenge = async (id: string): Promise<void> => {
  await api.private.patch(`/admin/challenges/${id}/hide`);
};

/* ─────────────────────────────────────────────────────
 * [PATCH] 관리자페이지 - 오픈챌린지 노출 처리
 * ────────────────────────────────────────────────────*/
const showAdminChallenge = async (id: string): Promise<void> => {
  await api.private.patch(`/admin/challenges/${id}/show`);
};

/* ─────────────────────────────────────────────────────
 * [DELETE] 관리자페이지 - 오픈챌린지 삭제
 * ────────────────────────────────────────────────────*/
const deleteAdminChallenge = async (id: string): Promise<void> => {
  await api.private.delete(`/admin/challenges/${id}`);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 오픈챌린지 풀이 시작
 * ────────────────────────────────────────────────────*/
const startChallengeAttempt = async (
  params: StartChallengeAttemptPayload
): Promise<ChallengeAttempt> => {
  const validated = payload.startAttempt.parse(params);
  const response = await api.private.post(
    '/common/challenge-attempts',
    validated
  );
  return unwrapEnvelope(response, dto.attempt);
};

/* ─────────────────────────────────────────────────────
 * [PATCH] 오픈챌린지 정답 제출
 * ────────────────────────────────────────────────────*/
const submitChallengeAnswer = async (
  attemptId: string,
  params: SubmitChallengeAnswerPayload
) => {
  const validated = payload.submitAnswer.parse(params);
  const response = await api.private.patch(
    `/common/challenge-attempts/${attemptId}/answer`,
    validated
  );
  return domain.answerResult.parse(unwrapEnvelope(response, dto.answerResult));
};

/* ─────────────────────────────────────────────────────
 * [READ] 정답 해설 조회
 *  GET /api/common/challenge-attempts/{attemptId}/solution
 *  - 호출 시 백엔드가 usedSolutionView=true 처리 + 포인트 −30 차감(이벤트).
 *    → 차감 경고 Dialog 확인 후에만 호출해야 한다.
 * ────────────────────────────────────────────────────*/
const getChallengeSolution = async (
  attemptId: string
): Promise<ChallengeSolution> => {
  const response = await api.private.get(
    `/common/challenge-attempts/${attemptId}/solution`
  );
  return domain.solution.parse(unwrapEnvelope(response, dto.solution));
};

/* ─────────────────────────────────────────────────────
 * [READ] 오픈챌린지 리뷰 목록 조회
 * ────────────────────────────────────────────────────*/
const getChallengeReviews = async (
  challengeId: string,
  sort: ChallengeReviewSort = 'recommend'
): Promise<ChallengeReview[]> => {
  const response = await api.private.get(
    `/common/challenges/${challengeId}/reviews`,
    {
      params: { sort: sort === 'latest' ? 'LATEST' : 'RECOMMEND' },
    }
  );
  const page = unwrapEnvelope(response, dto.reviewPage);
  return page.content.map(toReview);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 오픈챌린지 리뷰 작성
 * ────────────────────────────────────────────────────*/
const createChallengeReview = async (
  params: CreateChallengeReviewPayload
): Promise<void> => {
  const validated = payload.createReview.parse(params);
  await api.private.post('/common/challenge-reviews', validated);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 오픈챌린지 리뷰 추천
 * ────────────────────────────────────────────────────*/
const recommendChallengeReview = async (reviewId: string): Promise<void> => {
  await api.private.post(`/common/challenge-reviews/${reviewId}/recommends`);
};

/* ─────────────────────────────────────────────────────
 * [DELETE] 오픈챌린지 리뷰 추천 취소
 * ────────────────────────────────────────────────────*/
const cancelChallengeReviewRecommend = async (
  reviewId: string
): Promise<void> => {
  await api.private.delete(`/common/challenge-reviews/${reviewId}/recommends`);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 오픈챌린지 피드백 제출
 * ────────────────────────────────────────────────────*/
const submitChallengeFeedback = async (
  params: SubmitChallengeFeedbackPayload
): Promise<void> => {
  const validated = payload.submitFeedback.parse(params);
  await api.private.post('/common/challenge-feedbacks', validated);
};

/* ─────────────────────────────────────────────────────
 * [READ] AI 코칭 선호도 선택지 조회
 * ────────────────────────────────────────────────────*/
const getAiCoachingPreferenceEnums = async (): Promise<AiCoachingEnums> => {
  const response = await api.private.get(
    '/common/ai-coaching-preferences/enums'
  );
  return unwrapEnvelope(response, dto.aiCoachingEnums);
};

/* ─────────────────────────────────────────────────────
 * [READ] 내 AI 코칭 선호도 조회
 * ────────────────────────────────────────────────────*/
const getMyAiCoachingPreference = async (): Promise<AiCoachingPreference> => {
  const response = await api.private.get('/common/ai-coaching-preferences/me');
  return unwrapEnvelope(response, dto.aiCoachingPreference);
};

/* ─────────────────────────────────────────────────────
 * [UPDATE] 내 AI 코칭 선호도 수정
 * ────────────────────────────────────────────────────*/
const updateMyAiCoachingPreference = async (
  params: AiCoachingPreferencePayload
): Promise<AiCoachingPreference> => {
  const validated = payload.aiCoachingPreference.parse(params);
  const response = await api.private.put(
    '/common/ai-coaching-preferences/me',
    validated
  );
  return unwrapEnvelope(response, dto.aiCoachingPreference);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] AI 코칭 세션 생성
 * ────────────────────────────────────────────────────*/
const createAiCoachingSession = async (
  params: CreateAiCoachingSessionPayload
): Promise<AiCoachingSession> => {
  const validated = payload.createAiCoachingSession.parse(params);
  const response = await api.private.post(
    '/common/ai-coaching-sessions',
    validated
  );
  return unwrapEnvelope(response, dto.aiCoachingSession);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] AI 코칭 메시지 전송
 * ────────────────────────────────────────────────────*/
const sendAiCoachingMessage = async (
  sessionId: string,
  params: SendAiCoachingMessagePayload
): Promise<AiCoachingMessageResponse> => {
  const validated = payload.sendAiCoachingMessage.parse(params);
  const response = await api.private.post(
    `/common/ai-coaching-sessions/${sessionId}/messages`,
    validated
  );
  return unwrapEnvelope(response, dto.aiCoachingMessageResponse);
};

/* ─────────────────────────────────────────────────────
 * [READ] AI 코칭 메시지 목록 조회
 * ────────────────────────────────────────────────────*/
const getAiCoachingMessages = async (
  sessionId: string
): Promise<AiCoachingMessage[]> => {
  const response = await api.private.get(
    `/common/ai-coaching-sessions/${sessionId}/messages`
  );
  return unwrapEnvelope(response, dto.aiCoachingMessages);
};

/* ─────────────────────────────────────────────────────
 * [PATCH] AI 코칭 세션 종료
 * ────────────────────────────────────────────────────*/
const finishAiCoachingSession = async (sessionId: string): Promise<void> => {
  await api.private.patch(`/common/ai-coaching-sessions/${sessionId}/finish`);
};

/* ─────────────────────────────────────────────────────
 * [PATCH] AI 코칭 세션 포기
 * ────────────────────────────────────────────────────*/
const abandonAiCoachingSession = async (sessionId: string): Promise<void> => {
  await api.private.patch(`/common/ai-coaching-sessions/${sessionId}/abandon`);
};

/* ─────────────────────────────────────────────────────
 * [READ] 오픈챌린지 랭킹 조회 (공개)
 * ────────────────────────────────────────────────────*/
const getChallengeRanking = async (): Promise<UserRanking[]> => {
  const response = await api.public.get('/public/challenge-rankings');
  const page = unwrapEnvelope(response, dto.rankingPage);
  return page.content.map((ranking) => domain.ranking.parse(ranking));
};

/* ─────────────────────────────────────────────────────
 * [READ] 마이페이지 - 내 오픈챌린지 목록 조회
 * ────────────────────────────────────────────────────*/
const getMyChallengeList = async (params: MyChallengeListParams = {}) => {
  const response = await api.private.get('/common/me/challenges', {
    params: {
      // status 미지정=ALL (하위호환: 완료 답안만 반환하던 기존 동작 유지)
      status: params.status ?? 'ALL',
      result: params.result ?? 'ALL',
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  });
  const page = unwrapEnvelope(response, dto.myChallengeListPage);

  return {
    ...page,
    content: page.content.map(toMyChallengeListItem),
  };
};

/* ─────────────────────────────────────────────────────
 * [READ] 마이페이지 - 내 오픈챌린지 상세 조회
 * ────────────────────────────────────────────────────*/
const getMyChallengeDetail = async (
  challengeId: string
): Promise<MyChallengeDetail> => {
  const response = await api.private.get(
    `/common/me/challenges/${challengeId}`
  );
  return toMyChallengeDetail(unwrapEnvelope(response, dto.myChallengeDetail));
};

/* ─────────────────────────────────────────────────────
 * [READ] 내 스트릭 스냅샷 조회 (D-Home 동기 헤더)
 *  GET /api/common/me/streak
 *  — user_ranking 레코드 없으면 { streakDays:0, todayCompleted:false }
 * ────────────────────────────────────────────────────*/
const getMyStreak = async () => {
  const response = await api.private.get('/common/me/streak');
  return unwrapEnvelope(response, dto.streakSnapshot);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 게스트 무료 채점 (맛보기) — O/X 만 반환, attempt·정답 미저장
 * ────────────────────────────────────────────────────*/
const gradeChallengeAsGuest = async (
  challengeId: string,
  selectedAnswer: string
): Promise<{ correct: boolean }> => {
  const response = await api.public.post(
    `/public/challenges/${challengeId}/grade`,
    { selectedAnswer }
  );
  return unwrapEnvelope(response, z.object({ correct: z.boolean() }));
};

/* ─────────────────────────────────────────────────────
 * [READ] 다음 오픈챌린지 조회
 *  추천 API(오답률·등급 기반) 결과를 우선 순환시키고, 로그인 사용자는
 *  이미 완료(COMPLETED)한 문제를 제외한다. 게스트는 현재 풀고 있는
 *  문제만 제외하고 추천 순서대로 진행한다. 추천 목록이 소진되면
 *  (전부 완료했거나 목록이 짧으면) 기존 인기순 목록으로 폴백한다.
 *  ※ 전용 "다음 문제" 백엔드 API는 신설하지 않고, 기존 추천 API +
 *    클라이언트 필터링으로 반복 문제를 해소한다(후속 과제: 백엔드
 *    전용 next API로 서버사이드 제외 처리).
 * ────────────────────────────────────────────────────*/
const toNextChallengeFromRecommended = (
  item: RecommendedChallengeItem
): NextChallenge => ({
  id: item.id,
  subject: item.subject,
  difficulty: item.difficulty,
  title: item.title,
  sourceText: item.sourceText,
  questionImageUrl: item.questionImageUrl,
  // 추천 API는 passRate 대신 wrongAnswerRate(오답률)를 제공한다 —
  // 통과율 근사치로 환산해 기존 NextChallengeCard(passRate 소비)를 재사용한다.
  passRate: Math.max(0, Math.round(100 - item.wrongAnswerRate)),
  participantCount: item.participantCount,
});

const getNextChallenge = async (
  currentChallengeId: string,
  options?: { isGuest?: boolean }
): Promise<NextChallenge | null> => {
  const recommended = await getRecommendedChallenges({});
  let candidates = recommended.filter((item) => item.id !== currentChallengeId);

  if (!options?.isGuest) {
    try {
      const completed = await getMyChallengeList({
        status: 'COMPLETED',
        size: 100,
      });
      const completedIds = new Set(
        completed.content.map((item) => item.challengeId)
      );
      candidates = candidates.filter((item) => !completedIds.has(item.id));
    } catch {
      // 완료 목록 조회 실패 시 필터 없이 추천 목록만으로 진행한다.
    }
  }

  const firstCandidate = candidates[0];
  if (firstCandidate) {
    return toNextChallengeFromRecommended(firstCandidate);
  }

  // 추천 목록 소진(전부 완료 또는 목록이 짧음) 시 기존 인기순 목록으로 폴백.
  const list = await getChallengeList({ subject: 'MATH', sort: 'popular' });
  return list.find((challenge) => challenge.id !== currentChallengeId) ?? null;
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  getList: getChallengeList,
  getRecommended: getRecommendedChallenges,
  getAdminList: getAdminChallengeList,
  getDetail: getChallengeDetail,
  getAdminDetail: getAdminChallengeDetail,
  createAdmin: createAdminChallenge,
  updateAdmin: updateAdminChallenge,
  hideAdmin: hideAdminChallenge,
  showAdmin: showAdminChallenge,
  deleteAdmin: deleteAdminChallenge,
  startAttempt: startChallengeAttempt,
  submitAnswer: submitChallengeAnswer,
  gradeAsGuest: gradeChallengeAsGuest,
  getSolution: getChallengeSolution,
  getReviews: getChallengeReviews,
  createReview: createChallengeReview,
  recommendReview: recommendChallengeReview,
  cancelReviewRecommend: cancelChallengeReviewRecommend,
  submitFeedback: submitChallengeFeedback,
  getRanking: getChallengeRanking,
  getMyList: getMyChallengeList,
  getMyDetail: getMyChallengeDetail,
  getNextChallenge,
  getMyStreak,
  getAiCoachingPreferenceEnums,
  getMyAiCoachingPreference,
  updateMyAiCoachingPreference,
  createAiCoachingSession,
  sendAiCoachingMessage,
  getAiCoachingMessages,
  finishAiCoachingSession,
  abandonAiCoachingSession,
};
