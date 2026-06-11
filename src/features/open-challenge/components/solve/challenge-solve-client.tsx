'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  SolutionDrawingPad,
  type Stroke,
  useDrawingUpload,
} from '@/shared/components/drawing';
import {
  TextEditor,
  type TextEditorValue,
  initialTextEditorValue,
  prepareContentForSave,
} from '@/shared/components/editor';
import { BackButton, Button, Dialog } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn, extractText } from '@/shared/lib';
import { Bot, ChevronDown, ChevronUp, Pencil, PenLine, X } from 'lucide-react';

import {
  useCreateChallengeReviewMutation,
  useFinishAiCoachingSessionMutation,
  useMyOpenChallengeDetailQuery,
  useOpenChallengeDetailQuery,
  useStartChallengeAttemptMutation,
  useSubmitChallengeAnswerMutation,
} from '../../hooks/use-open-challenge';
import { AiCoachPanel } from './ai-coach-panel';
import { ChallengeHistoryDialog } from './challenge-history-dialog';
import { ChallengeSolveSkeleton } from './challenge-solve-skeleton';
import { ChoiceList } from './choice-list';
import { SolutionPanel } from './solution-panel';

type ChallengeSolveClientProps = {
  challengeId: string;
  isLoggedIn: boolean;
};

const RESULT_STORAGE_KEY_PREFIX = 'open-challenge-result';
const DRAFT_KEY_PREFIX = 'open-challenge-draft';

export const ChallengeSolveClient = ({
  challengeId,
  isLoggedIn,
}: ChallengeSolveClientProps) => {
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [solutionMode, setSolutionMode] = useState<'TEXT' | 'DRAWING'>('TEXT');
  const [drawingStrokes, setDrawingStrokes] = useState<Stroke[]>([]);
  const [solutionContent, setSolutionContent] = useState<TextEditorValue>(
    initialTextEditorValue
  );
  const [isQuestionOpen, setIsQuestionOpen] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isMobileAiOpen, setIsMobileAiOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [aiAttemptId, setAiAttemptId] = useState<string | null>(null);
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);
  const choiceSectionRef = useRef<HTMLDivElement>(null);
  const draftKey = `${DRAFT_KEY_PREFIX}:${challengeId}`;

  useEffect(() => {
    const saved = sessionStorage.getItem(draftKey);
    if (saved) {
      setSolutionContent(JSON.parse(saved));
      sessionStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  const { data: challenge, isLoading: isChallengeLoading } =
    useOpenChallengeDetailQuery(challengeId);
  const { data: challengeHistory } = useMyOpenChallengeDetailQuery(
    challengeId,
    { enabled: isLoggedIn }
  );
  const startAttemptMutation = useStartChallengeAttemptMutation();
  const submitAnswerMutation = useSubmitChallengeAnswerMutation(challengeId);
  const createReviewMutation = useCreateChallengeReviewMutation();
  const finishAiCoachingSessionMutation = useFinishAiCoachingSessionMutation();
  const { uploadDrawingAsync, isUploading } = useDrawingUpload();
  const isSubmitting =
    startAttemptMutation.isPending ||
    submitAnswerMutation.isPending ||
    finishAiCoachingSessionMutation.isPending ||
    isUploading;
  const hasChallengeHistory =
    !!challengeHistory &&
    (challengeHistory.attempts.length > 0 ||
      challengeHistory.reviews.length > 0);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
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

      // 정답일 때만 풀이를 공유한다(기존 정책 유지).
      if (result.isCorrect) {
        if (solutionMode === 'DRAWING' && drawingStrokes.length > 0) {
          try {
            const { mediaId } = await uploadDrawingAsync(drawingStrokes);
            const { contentString } = prepareContentForSave(solutionContent);
            const hasMemo =
              extractText(JSON.stringify(solutionContent)).trim().length > 0;
            createReviewMutation.mutate({
              challengeId,
              attemptId,
              solutionType: 'DRAWING',
              content: hasMemo ? contentString : '',
              drawingImageMediaId: mediaId,
            });
          } catch {
            // 드로잉 업로드 실패가 결과 화면 이동을 막지 않도록 한다.
          }
        } else if (
          solutionMode === 'TEXT' &&
          extractText(JSON.stringify(solutionContent)).trim().length > 0
        ) {
          const { contentString } = prepareContentForSave(solutionContent);
          createReviewMutation.mutate({
            challengeId,
            attemptId,
            solutionType: 'TEXT',
            content: contentString,
          });
        }
      }

      window.sessionStorage.setItem(
        `${RESULT_STORAGE_KEY_PREFIX}:${challengeId}`,
        JSON.stringify({ ...result, attemptId })
      );
      router.push(PUBLIC.OPEN_CHALLENGE.RESULT(challengeId));
    } catch {
      // mutation hook에서 공통 API 에러 처리를 수행한다.
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setSubmitError('');
  };

  const handleAiAttemptCleared = () => {
    setAiAttemptId(null);
    setAiSessionId(null);
  };

  if (isChallengeLoading) return <ChallengeSolveSkeleton />;
  if (!challenge) return null;

  return (
    <div className="flex h-[calc(100vh-var(--spacing-header-height,64px))] overflow-hidden">
      {/* AI 코치 — 모바일에서 숨김 */}
      <aside className="border-line-line1 hidden w-[380px] shrink-0 border-r p-4 lg:block">
        <AiCoachPanel
          challengeId={challengeId}
          attemptId={aiAttemptId}
          isLoggedIn={isLoggedIn}
          onAttemptCreated={setAiAttemptId}
          onAttemptCleared={handleAiAttemptCleared}
          onSessionChange={setAiSessionId}
        />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 문제 + 선택지 + 풀이 에디터 */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
          <div className="mb-5">
            <BackButton />
          </div>

          <div className="text-gray-8 mb-3 flex min-w-0 items-center gap-2 text-sm">
            <span>{challenge.subject}</span>
            <span>›</span>
            <span className="text-text-main truncate font-semibold">
              {challenge.topic}
            </span>
          </div>

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

          <div className="mb-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Pencil
                  size={18}
                  className="text-orange-7"
                />
                <p className="font-body1-heading text-text-main">풀이 공간</p>
              </div>

              {/* 풀이 유형 토글 — 태블릿+펜슬은 손글씨 1순위 */}
              <div
                role="tablist"
                aria-label="풀이 유형 선택"
                className="border-line-line1 bg-gray-1 inline-flex items-center gap-1 rounded-full border p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={solutionMode === 'TEXT'}
                  onClick={() => setSolutionMode('TEXT')}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors',
                    solutionMode === 'TEXT'
                      ? 'bg-white text-orange-7 shadow-sm'
                      : 'text-gray-7'
                  )}
                >
                  <PenLine size={16} />글
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={solutionMode === 'DRAWING'}
                  onClick={() => setSolutionMode('DRAWING')}
                  className={cn(
                    'flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors',
                    solutionMode === 'DRAWING'
                      ? 'bg-white text-orange-7 shadow-sm'
                      : 'text-gray-7'
                  )}
                >
                  <Pencil size={16} />
                  손글씨
                </button>
              </div>
            </div>

            {solutionMode === 'TEXT' ? (
              <TextEditor
                value={solutionContent}
                onChange={setSolutionContent}
                placeholder="식, 풀이 과정, 떠오른 단서를 자유롭게 적어보세요."
                minHeight="420px"
                maxHeight="none"
                ariaLabel="오픈챌린지 풀이 입력"
              />
            ) : (
              <SolutionDrawingPad onStrokesChange={setDrawingStrokes} />
            )}
          </div>

          <div
            ref={choiceSectionRef}
            tabIndex={-1}
            className="flex scroll-mt-6 flex-col gap-3 outline-none"
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

          {/* 정답 해설 (코치보다 조용히 — 차감·트리 제외 경고 후 열람) */}
          <div className="mt-5">
            <SolutionPanel
              attemptId={aiAttemptId}
              isLoggedIn={isLoggedIn}
            />
          </div>
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
            disabled={!selectedAnswer || isSubmitting}
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
              onAttemptCreated={setAiAttemptId}
              onAttemptCleared={handleAiAttemptCleared}
              onSessionChange={setAiSessionId}
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
                sessionStorage.setItem(
                  draftKey,
                  JSON.stringify(solutionContent)
                );
                const from = encodeURIComponent(
                  PUBLIC.OPEN_CHALLENGE.DETAIL(challengeId)
                );
                router.replace(`${PUBLIC.CORE.LOGIN}?from=${from}`);
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
