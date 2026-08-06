'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { ChallengeShareButton } from '@/features/social';
import {
  useClaimGuestSessionMutation,
  usePublicInvitePreviewQuery,
} from '@/features/social/hooks';
import {
  SolutionDrawingPad,
  type Stroke,
  exportStrokesToDataURL,
  useDrawingUpload,
} from '@/shared/components/drawing';
import { BackButton, Button, Dialog } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { trackOcStart, trackOcSubmit } from '@/shared/lib/analytics';
import {
  Bot,
  ChevronDown,
  ChevronUp,
  ChevronsLeftRight,
  Pencil,
  X,
} from 'lucide-react';

import {
  useCoachOpeningQuery,
  useCreateChallengeReviewMutation,
  useFinishAiCoachingSessionMutation,
  useGuestGradeChallengeMutation,
  useMyOpenChallengeDetailQuery,
  useOpenChallengeDetailQuery,
  useStartChallengeAttemptMutation,
  useSubmitChallengeAnswerMutation,
} from '../../hooks/use-open-challenge';
import { SignupSheet } from '../guest/signup-sheet';
import { AiCoachPanel } from './ai-coach-panel';
import { ChallengeHistoryDialog } from './challenge-history-dialog';
import { ChallengeSolveSkeleton } from './challenge-solve-skeleton';
import { ChoiceList } from './choice-list';

type ChallengeSolveClientProps = {
  challengeId: string;
  isLoggedIn: boolean;
};

const RESULT_STORAGE_KEY_PREFIX = 'open-challenge-result';

// FDD F-14: 도전장 링크당 한 문제를 가입 없이 풀 수 있다.
const GUEST_FREE_LIMIT = 1;
const GUEST_SOLVED_COUNT_KEY = 'oc-guest-solved-count';

// AI 코치 패널 폭 — 고정 380px 대신 드래그 리사이즈 + 좁게/넓게 2단 토글을 함께 제공한다.
const AI_PANEL_WIDTH_KEY = 'oc-ai-panel-width';
const AI_PANEL_MIN_WIDTH = 300;
const AI_PANEL_MAX_WIDTH = 640;
const AI_PANEL_NARROW_WIDTH = 380;
const AI_PANEL_WIDE_WIDTH = 520;

const readAiPanelWidth = (): number => {
  if (typeof window === 'undefined') return AI_PANEL_NARROW_WIDTH;
  const raw = window.localStorage.getItem(AI_PANEL_WIDTH_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed)) return AI_PANEL_NARROW_WIDTH;
  return Math.min(Math.max(parsed, AI_PANEL_MIN_WIDTH), AI_PANEL_MAX_WIDTH);
};

const readGuestSolvedCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(GUEST_SOLVED_COUNT_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const bumpGuestSolvedCount = (): number => {
  const next = readGuestSolvedCount() + 1;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GUEST_SOLVED_COUNT_KEY, String(next));
  }
  return next;
};

export const ChallengeSolveClient = ({
  challengeId,
  isLoggedIn,
}: ChallengeSolveClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken') ?? '';
  const hasGuestSession = searchParams.get('guestSession') === '1';
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // 풀이는 손글씨 전용 — 펜으로만 기록하며, 미입력 제출도 허용한다(보조 기록).
  const [drawingStrokes, setDrawingStrokes] = useState<Stroke[]>([]);
  const [isQuestionOpen, setIsQuestionOpen] = useState(true);
  const [isInviteContextOpen, setIsInviteContextOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isMobileAiOpen, setIsMobileAiOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aiAttemptId, setAiAttemptId] = useState<string | null>(null);
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);
  // 게스트 무료 풀이(클라 채점 맛보기) 상태
  const [guestGradeResult, setGuestGradeResult] = useState<boolean | null>(
    null
  );
  const [aiPanelWidth, setAiPanelWidth] = useState(AI_PANEL_NARROW_WIDTH);
  const isDraggingAiPanelRef = useRef(false);
  const [isSignupSheetOpen, setIsSignupSheetOpen] = useState(false);
  const [signupTrigger, setSignupTrigger] = useState<
    'limit-reached' | 'correct-answer'
  >('correct-answer');
  const choiceSectionRef = useRef<HTMLDivElement>(null);
  const hasClaimedGuestRef = useRef(false);
  // 계측 보조 refs (D2)
  const mountTimeRef = useRef(Date.now());
  const hasFiredStartRef = useRef(false);
  const solutionViewedRef = useRef(false);
  const messageCountRef = useRef(0);

  const {
    data: challenge,
    isLoading: isChallengeLoading,
    isError: isChallengeError,
  } = useOpenChallengeDetailQuery(challengeId);
  const { data: coachOpening } = useCoachOpeningQuery(challengeId);
  const { data: invitePreview } = usePublicInvitePreviewQuery(inviteToken, {
    enabled: inviteToken.length > 0,
  });
  const { data: challengeHistory } = useMyOpenChallengeDetailQuery(
    challengeId,
    { enabled: isLoggedIn }
  );
  const startAttemptMutation = useStartChallengeAttemptMutation();
  const submitAnswerMutation = useSubmitChallengeAnswerMutation(challengeId);
  const guestGradeMutation = useGuestGradeChallengeMutation(challengeId);
  const createReviewMutation = useCreateChallengeReviewMutation();
  const claimGuestSessionMutation = useClaimGuestSessionMutation();
  const finishAiCoachingSessionMutation = useFinishAiCoachingSessionMutation();
  const { uploadDrawingAsync, isUploading } = useDrawingUpload(
    'CHALLENGE_REVIEW_DRAWING'
  );
  const isSubmitting =
    startAttemptMutation.isPending ||
    submitAnswerMutation.isPending ||
    guestGradeMutation.isPending ||
    finishAiCoachingSessionMutation.isPending ||
    isUploading;
  const hasChallengeHistory =
    !!challengeHistory &&
    (challengeHistory.attempts.length > 0 ||
      challengeHistory.reviews.length > 0);

  // AI 코치 패널 폭 — 마지막으로 쓰던 값을 기억한다(브라우저별 저장).
  useEffect(() => {
    setAiPanelWidth(readAiPanelWidth());
  }, []);

  useEffect(() => {
    if (
      !isLoggedIn ||
      !hasGuestSession ||
      hasClaimedGuestRef.current ||
      claimGuestSessionMutation.isPending
    )
      return;
    hasClaimedGuestRef.current = true;
    claimGuestSessionMutation.mutate();
  }, [claimGuestSessionMutation, hasGuestSession, isLoggedIn]);

  const persistAiPanelWidth = (width: number) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AI_PANEL_WIDTH_KEY, String(width));
    }
  };

  const handleAiPanelResizeStart = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    isDraggingAiPanelRef.current = true;
    const startX = event.clientX;
    const startWidth = aiPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingAiPanelRef.current) return;
      const nextWidth = Math.min(
        Math.max(startWidth + (moveEvent.clientX - startX), AI_PANEL_MIN_WIDTH),
        AI_PANEL_MAX_WIDTH
      );
      setAiPanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      isDraggingAiPanelRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setAiPanelWidth((current) => {
        persistAiPanelWidth(current);
        return current;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleToggleAiPanelWidth = () => {
    setAiPanelWidth((current) => {
      const next =
        current >= (AI_PANEL_NARROW_WIDTH + AI_PANEL_WIDE_WIDTH) / 2
          ? AI_PANEL_NARROW_WIDTH
          : AI_PANEL_WIDE_WIDTH;
      persistAiPanelWidth(next);
      return next;
    });
  };

  // oc_start: 문제 데이터가 처음 로드됐을 때 1회 발화
  useEffect(() => {
    if (!challenge || hasFiredStartRef.current) return;
    hasFiredStartRef.current = true;
    trackOcStart({
      problem_id: challengeId,
      src: searchParams.get('src') ?? 'direct',
    });
  }, [challenge, challengeId, searchParams]);

  const handleGuestSubmit = async () => {
    if (!selectedAnswer) {
      setSubmitError('답을 먼저 선택해 주세요.');
      choiceSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      choiceSectionRef.current?.focus();
      return;
    }

    try {
      const elapsedSeconds = Math.round(
        (Date.now() - mountTimeRef.current) / 1000
      );
      const { correct } = await guestGradeMutation.mutateAsync(
        hasGuestSession
          ? {
              selectedAnswer,
              elapsedSeconds,
              drawingData:
                drawingStrokes.length > 0
                  ? JSON.stringify(drawingStrokes)
                  : null,
            }
          : selectedAnswer
      );
      setGuestGradeResult(correct);

      trackOcSubmit({
        is_correct: correct,
        used_solution: false,
        hint_count: messageCountRef.current,
        elapsed: elapsedSeconds,
      });

      const solvedCount = bumpGuestSolvedCount();
      if (solvedCount >= GUEST_FREE_LIMIT) {
        setSignupTrigger('limit-reached');
        setIsSignupSheetOpen(true);
      } else if (correct) {
        setSignupTrigger('correct-answer');
        setIsSignupSheetOpen(true);
      }
    } catch {
      // mutation hook 내부 공통 에러 처리(handleApiError)로 위임한다.
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      await handleGuestSubmit();
      return;
    }

    if (!selectedAnswer) {
      setSubmitError('답을 먼저 선택해 주세요.');
      choiceSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      choiceSectionRef.current?.focus();
      return;
    }

    try {
      const attemptId =
        aiAttemptId ??
        (await startAttemptMutation.mutateAsync({ challengeId })).attemptId;

      if (aiSessionId) {
        try {
          await finishAiCoachingSessionMutation.mutateAsync(aiSessionId);
        } catch {
          // 세션 종료 실패가 답안 제출을 막지는 않도록 한다.
        }
        setAiSessionId(null);
      }

      const result = await submitAnswerMutation.mutateAsync({
        attemptId,
        params: { selectedAnswer },
      });

      // oc_submit 계측 (D2)
      trackOcSubmit({
        is_correct: result.isCorrect,
        used_solution: solutionViewedRef.current,
        hint_count: messageCountRef.current,
        elapsed: Math.round((Date.now() - mountTimeRef.current) / 1000),
      });

      // D-14: 정오와 무관하게 손글씨가 있으면 문제를 푼 사람들에게 공유한다.
      let drawingShareFailure:
        | { strokes: Stroke[]; mediaAssetId?: number }
        | undefined;
      if (drawingStrokes.length > 0) {
        let mediaAssetId: number | undefined;
        try {
          ({ mediaAssetId } = await uploadDrawingAsync(drawingStrokes));
          await createReviewMutation.mutateAsync({
            challengeId,
            attemptId,
            solutionType: 'DRAWING',
            content: '',
            drawingImageMediaId: mediaAssetId,
          });
        } catch {
          // 결과 화면 이동은 유지하되, 실패 사실과 재시도 정보를 결과에 넘긴다.
          drawingShareFailure = {
            strokes: drawingStrokes,
            mediaAssetId,
          };
        }
      }

      // 정답·오답·공유 여부와 무관하게, 내가 쓴 손글씨 풀이를 결과 화면 상단에 보여준다.
      let myDrawingDataUrl: string | undefined;
      if (drawingStrokes.length > 0) {
        try {
          myDrawingDataUrl = exportStrokesToDataURL(drawingStrokes);
        } catch {
          // 렌더 실패가 결과 화면 이동을 막지 않도록 한다.
        }
      }

      const storageKey = `${RESULT_STORAGE_KEY_PREFIX}:${challengeId}`;
      try {
        window.sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            ...result,
            attemptId,
            selectedAnswer,
            myDrawingDataUrl,
            drawingShareFailure,
          })
        );
      } catch {
        // 드로잉 dataURL 로 용량 초과 시, 드로잉 없이 결과만 저장한다.
        window.sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            ...result,
            attemptId,
            selectedAnswer,
            drawingShareFailure,
          })
        );
      }
      router.push(PUBLIC.OPEN_CHALLENGE.RESULT(challengeId));
    } catch {
      // mutation hook에서 공통 API 에러 처리를 수행한다.
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setSubmitError('');
    setGuestGradeResult(null);
  };

  const handleAiAttemptCleared = () => {
    setAiAttemptId(null);
    setAiSessionId(null);
  };

  if (isChallengeLoading) return <ChallengeSolveSkeleton />;

  if (isChallengeError || !challenge) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-body1-heading text-text-main">
          문제를 찾을 수 없어요.
        </p>
        <p className="text-gray-8 text-sm">
          링크가 잘못됐거나 삭제된 문제일 수 있어요.
        </p>
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.push(PUBLIC.OPEN_CHALLENGE.LIST)}
        >
          문제 목록으로 가기
        </Button>
      </div>
    );
  }

  // 아직 지원하지 않는 문제 유형(선택지 없음, 예: 주관식) — 직링크 진입 시 dead-end 방지.
  if (challenge.choices.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-body1-heading text-text-main">
          아직 지원하지 않는 문제 유형이에요.
        </p>
        <p className="text-gray-8 text-sm">다른 문제를 풀어보시겠어요?</p>
        <Button
          type="button"
          variant="outlined"
          onClick={() => router.push(PUBLIC.OPEN_CHALLENGE.LIST)}
        >
          다른 문제 풀러가기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--spacing-header-height,64px))] overflow-hidden">
      {/* AI 코치 — 모바일에서 숨김. 폭은 드래그 핸들 또는 좁게/넓게 토글로 조절한다. */}
      <aside
        className="border-line-line1 relative hidden shrink-0 border-r p-4 lg:block"
        style={{ width: aiPanelWidth }}
      >
        <button
          type="button"
          onClick={handleToggleAiPanelWidth}
          className="border-line-line1 text-gray-7 hover:bg-gray-1 absolute top-4 right-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border bg-white shadow-sm"
          aria-label="AI 코치 패널 폭 전환 (좁게/넓게)"
          data-testid="ai-panel-width-toggle"
        >
          <ChevronsLeftRight size={14} />
        </button>
        <AiCoachPanel
          challengeId={challengeId}
          attemptId={aiAttemptId}
          isLoggedIn={isLoggedIn}
          hasGuestSession={hasGuestSession}
          openingMessage={coachOpening?.message}
          onAttemptCreated={setAiAttemptId}
          onAttemptCleared={handleAiAttemptCleared}
          onSessionChange={setAiSessionId}
          drawingStrokes={drawingStrokes}
          onSolutionViewed={() => {
            solutionViewedRef.current = true;
          }}
          onMessageSent={() => {
            messageCountRef.current += 1;
          }}
        />
        {/* 드래그 리사이즈 핸들 */}
        <div
          onMouseDown={handleAiPanelResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="AI 코치 패널 폭 조절"
          data-testid="ai-panel-resize-handle"
          className="hover:bg-orange-3 absolute top-0 right-0 z-10 h-full w-1.5 -translate-x-1/2 cursor-col-resize"
        />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 문제 + 선택지 + 풀이 에디터 */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <BackButton />
            {isLoggedIn && (
              <ChallengeShareButton
                challengeId={Number(challengeId)}
                variant="outlined"
                size="small"
              />
            )}
          </div>

          <div className="text-gray-8 mb-3 flex min-w-0 items-center gap-2 text-sm">
            <span>{challenge.subject}</span>
            <span>›</span>
            <span className="text-text-main truncate font-semibold">
              {challenge.topic}
            </span>
          </div>

          {invitePreview && (
            <section className="border-orange-7 bg-orange-1 mb-5 rounded-r-xl border-l-4 px-4 py-3">
              <button
                type="button"
                onClick={() => setIsInviteContextOpen((open) => !open)}
                aria-expanded={isInviteContextOpen}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="text-orange-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-white font-bold">
                  {(invitePreview.inviterName ?? '친구').slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="text-text-main block text-sm">
                    {invitePreview.inviterName ?? '친구'}님이 보낸 도전
                  </strong>
                  <span className="text-text-sub1 block truncate text-xs">
                    {invitePreview.opponentSolvedAt
                      ? `상대는 ${new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(invitePreview.opponentSolvedAt))}에 풀었어요`
                      : '상대가 푸는 중이에요'}
                  </span>
                </span>
                <span className="text-orange-10 text-xs font-bold">
                  도전 기록 {isInviteContextOpen ? '접기' : '보기'}
                </span>
              </button>
              {isInviteContextOpen && (
                <div className="border-orange-3 mt-3 grid gap-2 border-t pt-3 text-xs sm:grid-cols-3">
                  <span className="text-text-sub1">
                    보낸 시각
                    <br />
                    <b className="text-text-main">
                      {invitePreview.sentAt
                        ? new Intl.DateTimeFormat('ko-KR', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(invitePreview.sentAt))
                        : '기록 없음'}
                    </b>
                  </span>
                  <span className="text-text-sub1">
                    상대 제출
                    <br />
                    <b className="text-text-main">
                      {invitePreview.opponentSolvedAt ? '제출 완료' : '푸는 중'}
                    </b>
                  </span>
                  <span className="text-text-sub1">
                    잠긴 기록
                    <br />
                    <b className="text-text-main">
                      {invitePreview.lockedFieldCount}개
                    </b>
                  </span>
                  {invitePreview.lockReason && (
                    <p className="text-text-sub1 sm:col-span-3">
                      {invitePreview.lockReason}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {hasChallengeHistory && (
            <div className="border-line-line1 bg-orange-1 mb-5 flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-text-main font-semibold">
                  전에 도전했던 문제예요.
                </p>
                <p className="text-gray-8 mt-1 text-sm">
                  이전 답안과 공유한 풀이를 다시 확인할 수 있어요.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsHistoryOpen(true)}
                className="h-9 shrink-0 px-4 text-sm"
              >
                도전 내역 보기
              </Button>
            </div>
          )}

          <div className="border-line-line1 mb-5 overflow-hidden rounded-xl border bg-white">
            <button
              type="button"
              onClick={() =>
                setIsQuestionOpen(
                  (previousIsQuestionOpen) => !previousIsQuestionOpen
                )
              }
              className="hover:bg-gray-1 flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
              aria-expanded={isQuestionOpen}
            >
              <div className="min-w-0">
                <p className="text-text-main truncate text-base font-bold">
                  {challenge.topic}
                </p>
              </div>
              {isQuestionOpen ? (
                <ChevronUp
                  size={20}
                  className="text-gray-7 shrink-0"
                />
              ) : (
                <ChevronDown
                  size={20}
                  className="text-gray-7 shrink-0"
                />
              )}
            </button>

            {isQuestionOpen && (
              <div className="border-line-line1 border-t px-5 py-5 sm:px-6">
                <p className="text-text-main text-lg leading-relaxed whitespace-pre-line">
                  {challenge.questionText}
                </p>
                {challenge.questionImageUrl && (
                  <div className="border-line-line2 bg-gray-1 mt-5 overflow-hidden rounded-lg border p-3">
                    <Image
                      src={challenge.questionImageUrl}
                      alt={`${challenge.topic} 문제 이미지`}
                      width={760}
                      height={420}
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            ref={choiceSectionRef}
            tabIndex={-1}
            className="mb-5 flex scroll-mt-6 flex-col gap-3 outline-none"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-body1-heading text-text-main">
                답을 직접 선택해 주세요
              </p>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setIsMobileAiOpen(true)}
                className="h-9 px-3 text-sm lg:hidden"
              >
                <Bot
                  size={16}
                  className="mr-1"
                />
                AI 힌트
              </Button>
            </div>
            <ChoiceList
              choices={challenge.choices}
              selected={selectedAnswer}
              onSelect={handleAnswerSelect}
            />
            {submitError && (
              <p className="text-system-warning text-sm font-semibold">
                {submitError}
              </p>
            )}
          </div>

          <div className="mb-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pencil
                size={18}
                className="text-orange-7"
              />
              <p className="font-body1-heading text-text-main">풀이 공간</p>
              <span className="text-gray-7 text-sm">
                펜으로 자유롭게 풀어보세요 (선택)
              </span>
            </div>

            <SolutionDrawingPad
              onStrokesChange={setDrawingStrokes}
              persistKey={`open-challenge-solve:${challengeId}`}
            />
            <div className="border-orange-3 bg-orange-1 text-text-main rounded-xl border px-4 py-3 text-sm leading-relaxed">
              이 손풀이는 이 문제를 푼 사람들에게 내 이름과 함께 보여요. 맞든
              틀리든 올라가고, 언제든 내릴 수 있어요.
            </div>
          </div>

          {!isLoggedIn && guestGradeResult !== null && (
            <div
              data-testid="guest-grade-result"
              className={
                guestGradeResult
                  ? 'border-orange-3 bg-orange-1 text-orange-8 rounded-xl border px-4 py-3 text-sm font-semibold'
                  : 'border-line-line1 bg-gray-1 text-text-main rounded-xl border px-4 py-3 text-sm font-semibold'
              }
            >
              {guestGradeResult ? '정답이에요! 🎉' : '아쉽지만 오답이에요.'}
              <span className="text-gray-8 mt-1 block text-xs font-normal">
                레벨·포인트·약점트리는 가입하면 이 결과부터 쌓여요.
              </span>
            </div>
          )}
        </div>

        {/* 하단 제출 바 */}
        <div className="border-line-line1 flex items-center justify-end gap-3 border-t bg-white px-4 py-2 sm:px-6">
          <Button
            type="button"
            variant="outlined"
            onClick={() => setIsMobileAiOpen(true)}
            className="mr-auto h-9 px-3 text-sm lg:hidden"
          >
            <Bot
              size={16}
              className="mr-1"
            />
            AI 힌트
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedAnswer ||
              isSubmitting ||
              (!isLoggedIn && guestGradeResult !== null)
            }
            data-testid="challenge-submit-button"
            className="h-9 px-5 text-sm"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={isMobileAiOpen}
        onOpenChange={setIsMobileAiOpen}
      >
        <Dialog.Content className="h-[82vh] w-full max-w-[calc(100%-2rem)] gap-3 p-4 sm:max-w-[480px]">
          <Dialog.Header>
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-text-main text-base font-bold">
                AI 힌트
              </Dialog.Title>
              <button
                type="button"
                onClick={() => setIsMobileAiOpen(false)}
                className="hover:bg-gray-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
                aria-label="AI 힌트 닫기"
              >
                <X
                  size={18}
                  className="text-gray-7"
                />
              </button>
            </div>
          </Dialog.Header>
          <Dialog.Body>
            <AiCoachPanel
              challengeId={challengeId}
              attemptId={aiAttemptId}
              isLoggedIn={isLoggedIn}
              hasGuestSession={hasGuestSession}
              openingMessage={coachOpening?.message}
              onAttemptCreated={setAiAttemptId}
              onAttemptCleared={handleAiAttemptCleared}
              onSessionChange={setAiSessionId}
              drawingStrokes={drawingStrokes}
              onSolutionViewed={() => {
                solutionViewedRef.current = true;
              }}
              onMessageSent={() => {
                messageCountRef.current += 1;
              }}
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>

      <ChallengeHistoryDialog
        challengeId={challengeId}
        challenge={challenge}
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />

      <SignupSheet
        isOpen={isSignupSheetOpen}
        onOpenChange={setIsSignupSheetOpen}
        trigger={signupTrigger}
        challengeId={challengeId}
        isCorrect={guestGradeResult ?? undefined}
        hasGuestSession={hasGuestSession}
        inviteToken={inviteToken || undefined}
      />

      <Dialog
        isOpen={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      >
        <Dialog.Content className="w-full max-w-[360px] gap-5 p-6 text-center">
          <Dialog.Header className="items-center">
            <div className="bg-orange-1 flex h-14 w-14 items-center justify-center rounded-full">
              <Bot
                size={28}
                className="text-orange-7"
              />
            </div>
            <Dialog.Title className="text-text-main text-lg font-bold">
              로그인이 필요해요
            </Dialog.Title>
            <Dialog.Description className="text-gray-8 text-sm leading-relaxed">
              문제를 풀고 기록을 남기려면 로그인이 필요해요.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer className="flex-col">
            <Button
              type="button"
              onClick={() => {
                // 복귀 파라미터는 redirect 로 통일(도전장 흐름과 동일 규약).
                const redirect = encodeURIComponent(
                  PUBLIC.OPEN_CHALLENGE.DETAIL(challengeId)
                );
                router.replace(`${PUBLIC.CORE.LOGIN}?redirect=${redirect}`);
              }}
              className="w-full"
            >
              로그인하기
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsLoginDialogOpen(false)}
              className="w-full"
            >
              계속 둘러보기
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
