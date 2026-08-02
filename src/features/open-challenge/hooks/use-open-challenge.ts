import { useRouter } from 'next/navigation';

import { levelKeys } from '@/entities/level';
import {
  type AiCoachingPreferencePayload,
  type ChallengeListParams,
  type ChallengeReviewSort,
  type CreateAiCoachingSessionPayload,
  type CreateChallengeReviewPayload,
  type RecommendedChallengeParams,
  type SendAiCoachingMessagePayload,
  type StartChallengeAttemptPayload,
  type SubmitChallengeAnswerPayload,
  type SubmitChallengeFeedbackPayload,
  openChallengeKeys,
  repository,
} from '@/entities/open-challenge';
import { pointKeys } from '@/entities/point';
import { treeKeys } from '@/entities/tree';
import { PUBLIC } from '@/shared/constants';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyOpenChallengeError } from '@/shared/lib/errors/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 404(존재하지 않는 챌린지)는 재시도해도 결과가 바뀌지 않으므로 즉시 실패 처리한다.
// 그 외(네트워크/5xx)는 기본 재시도 정책을 유지한다.
const retryUnlessNotFound = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) return false;
  return failureCount < 3;
};

const ERROR_REDIRECT_DELAY_MS = 1500;

// 정답 제출 반영(포인트/레벨/약점트리)은 백엔드 AFTER_COMMIT 이벤트 핸들러가
// 커밋 이후 비동기로 처리한다. 응답이 오는 시점엔 아직 커밋 전일 수 있어
// 그 즉시 invalidate하면 "풀어도 안 변함"처럼 보이는 레이스가 생긴다.
// 커밋+이벤트 처리가 끝날 시간을 짧게 벌어준 뒤 invalidate한다.
const AFTER_COMMIT_INVALIDATE_DELAY_MS = 1200;

export const useOpenChallengeListQuery = (params: ChallengeListParams = {}) =>
  useQuery({
    queryKey: openChallengeKeys.list(params),
    queryFn: () => repository.getList(params),
  });

export const useRecommendedChallengesQuery = (
  params: RecommendedChallengeParams = {}
) =>
  useQuery({
    queryKey: openChallengeKeys.recommended(params),
    queryFn: () => repository.getRecommended(params),
  });

export const useOpenChallengeDetailQuery = (
  id: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: openChallengeKeys.detail(id),
    queryFn: () => repository.getDetail(id),
    enabled: (options?.enabled ?? true) && id.length > 0,
    retry: retryUnlessNotFound,
  });

export const useChallengeReviewsQuery = (
  challengeId: string,
  sort: ChallengeReviewSort = 'recommend',
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: openChallengeKeys.reviews(challengeId, sort),
    queryFn: () => repository.getReviews(challengeId, sort),
    enabled: (options?.enabled ?? true) && challengeId.length > 0,
  });

export const useNextChallengeQuery = (
  challengeId: string,
  options?: { enabled?: boolean; isGuest?: boolean }
) =>
  useQuery({
    queryKey: openChallengeKeys.next(challengeId, options?.isGuest ?? false),
    queryFn: () =>
      repository.getNextChallenge(challengeId, {
        isGuest: options?.isGuest ?? false,
      }),
    enabled: (options?.enabled ?? true) && challengeId.length > 0,
  });

export const useMyOpenChallengeDetailQuery = (
  challengeId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: openChallengeKeys.myDetail(challengeId),
    queryFn: () => repository.getMyDetail(challengeId),
    enabled: (options?.enabled ?? true) && challengeId.length > 0,
  });

export const useAiCoachingPreferenceEnumsQuery = (options?: {
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: openChallengeKeys.aiCoachingEnums(),
    queryFn: repository.getAiCoachingPreferenceEnums,
    enabled: options?.enabled,
  });

export const useMyAiCoachingPreferenceQuery = (options?: {
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: openChallengeKeys.aiCoachingPreference(),
    queryFn: repository.getMyAiCoachingPreference,
    enabled: options?.enabled,
  });

export const useAiCoachingMessagesQuery = (
  sessionId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: openChallengeKeys.aiCoachingMessages(sessionId),
    queryFn: () => repository.getAiCoachingMessages(sessionId),
    enabled: (options?.enabled ?? true) && sessionId.length > 0,
  });

export const useStartChallengeAttemptMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: StartChallengeAttemptPayload) =>
      repository.startAttempt(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openChallengeKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onContext: () =>
          setTimeout(
            () => router.replace(PUBLIC.OPEN_CHALLENGE.LIST),
            ERROR_REDIRECT_DELAY_MS
          ),
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useSubmitChallengeAnswerMutation = (challengeId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      attemptId,
      params,
    }: {
      attemptId: string;
      params: SubmitChallengeAnswerPayload;
    }) => repository.submitAnswer(attemptId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openChallengeKeys.all });
      queryClient.invalidateQueries({
        queryKey: openChallengeKeys.detail(challengeId),
      });
      // 정답 제출은 백엔드에서 포인트·레벨/뱃지·약점트리를 갱신(AFTER_COMMIT 이벤트 핸들러)하므로
      // 커밋+이벤트 처리가 끝날 시간을 벌어준 뒤 관련 캐시를 무효화한다(레이스 방지).
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: pointKeys.all });
        queryClient.invalidateQueries({ queryKey: levelKeys.all });
        queryClient.invalidateQueries({ queryKey: treeKeys.all });
      }, AFTER_COMMIT_INVALIDATE_DELAY_MS);
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onContext: () =>
          setTimeout(
            () => router.replace(PUBLIC.OPEN_CHALLENGE.LIST),
            ERROR_REDIRECT_DELAY_MS
          ),
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

/* ─────────────────────────────────────────────────────
 * 게스트 무료 채점 (맛보기) — attempt 생성 없이 O/X만 받는다.
 * 로그인 유저 attempt 흐름(useSubmitChallengeAnswerMutation)과 완전히 분리된 경로.
 * ────────────────────────────────────────────────────*/
export const useGuestGradeChallengeMutation = (challengeId: string) =>
  useMutation({
    mutationFn: (selectedAnswer: string) =>
      repository.gradeAsGuest(challengeId, selectedAnswer),
  });

/* ─────────────────────────────────────────────────────
 * 정답 해설 조회 — Mutation으로 모델링.
 *  호출 자체가 포인트 −30 차감 + usedSolutionView 처리(부수효과)이므로
 *  query 자동 refetch로 중복 차감되지 않도록 사용자가 명시 호출할 때만 실행한다.
 * ────────────────────────────────────────────────────*/
export const useChallengeSolutionMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (attemptId: string) => repository.getSolution(attemptId),
    onSuccess: () => {
      // 잔액·약점 트리가 바뀌므로 관련 캐시를 무효화한다.
      queryClient.invalidateQueries({ queryKey: pointKeys.all });
      queryClient.invalidateQueries({ queryKey: treeKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useCreateChallengeReviewMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: CreateChallengeReviewPayload) =>
      repository.createReview(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: openChallengeKeys.reviews(params.challengeId),
      });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useRecommendChallengeReviewMutation = (challengeId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (reviewId: string) => repository.recommendReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: openChallengeKeys.reviewsBase(challengeId),
      });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useCancelChallengeReviewRecommendMutation = (
  challengeId: string
) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (reviewId: string) =>
      repository.cancelReviewRecommend(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: openChallengeKeys.reviewsBase(challengeId),
      });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useSubmitChallengeFeedbackMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: SubmitChallengeFeedbackPayload) =>
      repository.submitFeedback(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openChallengeKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useUpdateMyAiCoachingPreferenceMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: AiCoachingPreferencePayload) =>
      repository.updateMyAiCoachingPreference(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: openChallengeKeys.aiCoachingPreference(),
      });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useCreateAiCoachingSessionMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: CreateAiCoachingSessionPayload) =>
      repository.createAiCoachingSession(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openChallengeKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useSendAiCoachingMessageMutation = (sessionId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (params: SendAiCoachingMessagePayload) =>
      repository.sendAiCoachingMessage(sessionId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: openChallengeKeys.aiCoachingMessages(sessionId),
      });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};

export const useFinishAiCoachingSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      repository.finishAiCoachingSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openChallengeKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {});
    },
  });
};

export const useAbandonAiCoachingSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      repository.abandonAiCoachingSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openChallengeKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyOpenChallengeError, {});
    },
  });
};
