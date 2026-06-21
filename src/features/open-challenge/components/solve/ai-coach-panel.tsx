'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { type AiCoachingPreference } from '@/entities/open-challenge';
import { useSolutionViewCostQuery } from '@/features/point/hooks/use-point';
import { type Stroke, useDrawingUpload } from '@/shared/components/drawing';
import { Button, Dialog } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { katex } from '@mdit/plugin-katex';
import { renderToString } from 'katex';
import {
  BookOpenCheck,
  Bot,
  PenLine,
  RotateCcw,
  Send,
  Settings,
  TriangleAlert,
} from 'lucide-react';
import MarkdownIt from 'markdown-it';

import {
  useAbandonAiCoachingSessionMutation,
  useAiCoachingPreferenceEnumsQuery,
  useChallengeSolutionMutation,
  useCreateAiCoachingSessionMutation,
  useMyAiCoachingPreferenceQuery,
  useSendAiCoachingMessageMutation,
  useStartChallengeAttemptMutation,
  useUpdateMyAiCoachingPreferenceMutation,
} from '../../hooks/use-open-challenge';
import {
  type AiCoachSettingOption,
  type AiCoachSettings,
  AiCoachSettingsDialog,
} from './ai-coach-settings-dialog';

type AiCoachProgressStep = 'concept' | 'approach' | 'hint' | 'final';
type AiCoachMessageRole = 'ai' | 'user';
type AiCoachStatus =
  | 'READY'
  | 'COACHING'
  | 'WAITING_ANSWER'
  | 'GUIDE_TO_PROBLEM'
  | 'FINISHED'
  | 'ABANDONED';

type AiCoachMessage = {
  id: string;
  role: AiCoachMessageRole;
  content: string;
  timestamp: string;
  step?: AiCoachProgressStep;
  // 'solution' 메시지는 손글씨 스타일(노트 톤)로 렌더한다.
  kind?: 'solution';
};

type AiCoachPanelProps = {
  challengeId: string;
  attemptId: string | null;
  isLoggedIn: boolean;
  onAttemptCreated: (attemptId: string) => void;
  onAttemptCleared: () => void;
  onSessionChange?: (sessionId: string | null) => void;
  // 학생이 풀이 공간에 쓴 손글씨 strokes — 메시지 전송 시 스냅샷을 업로드해
  // AI 가 "현재 풀이"를 보고 코칭하도록 넘긴다.
  drawingStrokes?: Stroke[];
};

const MAX_COMMENT_LENGTH = 200;

const AI_COACH_INITIAL_MESSAGE =
  '좋아요. 정답을 바로 고르기보다, 먼저 문제에서 무엇을 묻는지 같이 정리해볼게요.';

const SOLUTION_COST = 30;

// 칩 클릭 시 보내는 템플릿 메시지 — 백엔드 progression(progressionStep)이 단계 답변을 싣는다.
const CONCEPT_PROMPT = '이 문제 개념부터 알려줘';
const HINT_PROMPT = '다음 힌트 줘';

const MARKDOWN_SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true, mathMl: true },
} as const;

const KATEX_INLINE_OPTIONS = {
  displayMode: false,
  throwOnError: false,
} as const;

const MATH_CODE_PATTERN =
  /(?:\\(?:frac|sqrt|sum|int|lim|left|right|cdot|times|pm)|[A-Za-z0-9)]\s*\^\s*(?:[A-Za-z0-9]|\{[^}]+\})|[A-Za-z]\s*=\s*[-+*/()A-Za-z0-9\s^]+|[+\-*/]\s*[A-Za-z0-9(\\])/;

const KOREAN_POSTPOSITION_STRONG_PATTERN =
  /^\*\*([^*\n]+[)\]}])\*\*(?=[가-힣])/;
const SUPERSCRIPT_BRACED_PATTERN = /^\^\{([^{}\n]+)\}/;
const SUPERSCRIPT_SIMPLE_PATTERN = /^\^([+-]?(?:\d+|[A-Za-z]+))/;

const applyKoreanPostpositionStrongRule = (markdown: MarkdownIt) => {
  markdown.inline.ruler.before(
    'emphasis',
    'korean_postposition_strong',
    (state, silent) => {
      const match = state.src
        .slice(state.pos)
        .match(KOREAN_POSTPOSITION_STRONG_PATTERN);

      if (!match) return false;
      if (silent) return true;

      const fullMatch = match[0];
      const strongText = match[1];

      if (!fullMatch || !strongText) return false;

      state.push('strong_open', 'strong', 1);
      const textToken = state.push('text', '', 0);
      textToken.content = strongText;
      state.push('strong_close', 'strong', -1);
      state.pos += fullMatch.length;

      return true;
    }
  );
};

const applySuperscriptRule = (markdown: MarkdownIt) => {
  markdown.inline.ruler.after(
    'emphasis',
    'math_superscript',
    (state, silent) => {
      const { pos, src } = state;
      const previousChar = src.charAt(pos - 1);

      if (
        src.charCodeAt(pos) !== 0x5e ||
        pos === 0 ||
        /\s/.test(previousChar)
      ) {
        return false;
      }

      const remainingSource = src.slice(pos);
      const match =
        remainingSource.match(SUPERSCRIPT_BRACED_PATTERN) ??
        remainingSource.match(SUPERSCRIPT_SIMPLE_PATTERN);

      if (!match) return false;
      if (silent) return true;

      const fullMatch = match[0];
      const exponent = match[1];

      if (!fullMatch || !exponent) return false;

      state.push('sup_open', 'sup', 1);
      const textToken = state.push('text', '', 0);
      textToken.content = exponent;
      state.push('sup_close', 'sup', -1);
      state.pos += fullMatch.length;

      return true;
    }
  );
};

const markdownRenderer = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
});

applyKoreanPostpositionStrongRule(markdownRenderer);
applySuperscriptRule(markdownRenderer);
markdownRenderer.use(katex, {
  delimiters: 'all',
  mathFence: true,
});

const defaultCodeInlineRule = markdownRenderer.renderer.rules.code_inline;

markdownRenderer.renderer.rules.code_inline = (
  tokens,
  index,
  options,
  env,
  self
) => {
  const content = tokens[index]?.content ?? '';

  if (MATH_CODE_PATTERN.test(content)) {
    return renderToString(content, KATEX_INLINE_OPTIONS);
  }

  return defaultCodeInlineRule
    ? defaultCodeInlineRule(tokens, index, options, env, self)
    : self.renderToken(tokens, index, options);
};

const toSettings = (
  preference: NonNullable<AiCoachingPreference>
): AiCoachSettings => ({
  subject: '수학',
  learningStage:
    (preference.learningStage?.code as AiCoachSettings['learningStage']) ??
    'CONCEPT_FOCUSED',
  learningGoal:
    (preference.learningGoal?.code as AiCoachSettings['learningGoal']) ??
    'CSAT',
  difficultAreas: preference.difficultAreas.map(
    (area) => area.code as AiCoachSettings['difficultAreas'][number]
  ),
  customText: preference.customText ?? '',
  skipped: false,
});

const toPreferencePayload = (settings: AiCoachSettings) => ({
  learningStage: settings.learningStage,
  learningGoal: settings.learningGoal,
  difficultAreas: settings.difficultAreas,
  customText: settings.customText,
});

const toDialogOptions = <TValue extends string>(
  options?: { code: string; label: string }[]
): AiCoachSettingOption<TValue>[] | undefined =>
  options?.map((option) => ({
    value: option.code as TValue,
    label: option.label,
  }));

const toProgressStep = (
  progressionStep?: number | null
): AiCoachProgressStep | undefined => {
  switch (progressionStep) {
    case 1:
      return 'concept';
    case 2:
      return 'approach';
    case 3:
      return 'hint';
    case 4:
      return 'final';
    default:
      return undefined;
  }
};

const getDifficultAreaLabel = (
  area: AiCoachSettings['difficultAreas'][number]
) => {
  switch (area) {
    case 'CONCEPT':
      return '개념 이해';
    case 'INTERPRET':
      return '문제 해석';
    case 'APPLICATION':
      return '개념 적용';
    case 'CALCULATION':
      return '계산';
  }
};

const getIntroMessage = (settings: AiCoachSettings) => {
  if (settings.skipped) return AI_COACH_INITIAL_MESSAGE;

  const goalLabel =
    settings.learningGoal === 'CSAT' ? '수능형 접근' : '내신형 정확성';
  const stageLabel =
    settings.learningStage === 'CONCEPT_FOCUSED' ? '개념 설명' : '풀이 접근';
  const difficultAreaText =
    settings.difficultAreas.length > 0
      ? ` 특히 ${settings.difficultAreas
          .map(getDifficultAreaLabel)
          .join(', ')} 부분을 더 신경 쓸게요.`
      : '';

  return `${AI_COACH_INITIAL_MESSAGE}\n${stageLabel}과 ${goalLabel}에 맞춰 힌트를 줄게요.${difficultAreaText}`;
};

const getProgressStepLabel = (step: AiCoachProgressStep) => {
  switch (step) {
    case 'concept':
      return '1단계 · 개념 이해';
    case 'approach':
      return '2단계 · 접근 방향';
    case 'hint':
      return '3단계 · 풀이 힌트';
    case 'final':
      return '4단계 · 답 직전 힌트';
  }
};

const getStatusLabel = (status: AiCoachStatus) => {
  switch (status) {
    case 'READY':
      return '시작 전';
    case 'COACHING':
      return '코칭 중';
    case 'WAITING_ANSWER':
      return '답변 대기';
    case 'GUIDE_TO_PROBLEM':
      return '답 선택 유도';
    case 'FINISHED':
      return '종료';
    case 'ABANDONED':
      return '중단';
  }
};

const MarkdownMessage = ({ content }: { content: string }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let isCurrent = true;

    const renderMarkdown = async () => {
      const { default: DOMPurify } = await import('dompurify');

      if (!isCurrent) return;

      setHtml(
        DOMPurify.sanitize(
          markdownRenderer.render(content),
          MARKDOWN_SANITIZE_OPTIONS
        )
      );
    };

    setHtml('');
    renderMarkdown();

    return () => {
      isCurrent = false;
    };
  }, [content]);

  return (
    <div
      className="ai-coach-markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const AiCoachPanel = ({
  challengeId,
  attemptId,
  isLoggedIn,
  onAttemptCreated,
  onAttemptCleared,
  onSessionChange,
  drawingStrokes = [],
}: AiCoachPanelProps) => {
  const [messages, setMessages] = useState<AiCoachMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [status, setStatus] = useState<AiCoachStatus>('READY');
  const [settings, setSettings] = useState<AiCoachSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isSolutionWarningOpen, setIsSolutionWarningOpen] = useState(false);
  const [hasViewedSolution, setHasViewedSolution] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const preferenceEnumsQuery = useAiCoachingPreferenceEnumsQuery({
    enabled: isLoggedIn,
  });
  const myPreferenceQuery = useMyAiCoachingPreferenceQuery({
    enabled: isLoggedIn,
  });
  const startAttemptMutation = useStartChallengeAttemptMutation();
  const updatePreferenceMutation = useUpdateMyAiCoachingPreferenceMutation();
  const createSessionMutation = useCreateAiCoachingSessionMutation();
  const sendMessageMutation = useSendAiCoachingMessageMutation(sessionId);
  const abandonSessionMutation = useAbandonAiCoachingSessionMutation();
  const solutionMutation = useChallengeSolutionMutation();
  const { uploadDrawingAsync } = useDrawingUpload();
  // 같은 strokes 를 중복 업로드하지 않도록 마지막 업로드 결과를 캐시한다.
  const lastDrawingUploadRef = useRef<{
    strokes: Stroke[];
    mediaId: string;
  } | null>(null);

  const hasLoadedSettings =
    !isLoggedIn || myPreferenceQuery.isFetched || myPreferenceQuery.isError;
  const isBusy =
    startAttemptMutation.isPending ||
    updatePreferenceMutation.isPending ||
    createSessionMutation.isPending ||
    sendMessageMutation.isPending ||
    abandonSessionMutation.isPending ||
    solutionMutation.isPending;
  const isSending = status === 'COACHING' || isBusy;
  // 풀이를 시작(attempt 생성)하고 로그인한 상태에서만, 아직 안 본 해설을 열 수 있다.
  const canViewSolution = isLoggedIn && !!attemptId && !hasViewedSolution;

  // 다음 해설 보기가 무료인지/얼마인지 — 버튼·다이얼로그 카피를 정직하게 표시.
  const solutionCostQuery = useSolutionViewCostQuery({ enabled: isLoggedIn });
  const isSolutionFree = solutionCostQuery.data?.free ?? false;
  const solutionCostP = solutionCostQuery.data?.cost ?? SOLUTION_COST;
  const solutionCostLabel = isSolutionFree ? '무료' : `−${solutionCostP}P`;

  useEffect(() => {
    if (myPreferenceQuery.data && !settings) {
      setSettings(toSettings(myPreferenceQuery.data));
    }
  }, [myPreferenceQuery.data, settings]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getTimestamp = () =>
    new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const createAiMessage = (
    content: string,
    step?: AiCoachProgressStep,
    kind?: AiCoachMessage['kind']
  ): AiCoachMessage => ({
    id: `ai-${Date.now()}-${Math.random()}`,
    role: 'ai',
    content,
    timestamp: getTimestamp(),
    step,
    kind,
  });

  const startCoach = async (nextSettings: AiCoachSettings) => {
    try {
      setSettings(nextSettings);
      if (!nextSettings.skipped) {
        await updatePreferenceMutation.mutateAsync(
          toPreferencePayload(nextSettings)
        );
      }

      const currentAttemptId =
        attemptId ??
        (
          await startAttemptMutation.mutateAsync({
            challengeId,
          })
        ).attemptId;

      if (!attemptId) {
        onAttemptCreated(currentAttemptId);
      }

      const session = await createSessionMutation.mutateAsync({
        challengeAttemptId: currentAttemptId,
      });

      setSessionId(session.sessionId);
      onSessionChange?.(session.sessionId);
      setMessages([createAiMessage(getIntroMessage(nextSettings))]);
      setStatus('WAITING_ANSWER');
      setIsSettingsOpen(false);
    } catch {
      // mutation hook에서 공통 API 에러 처리를 수행한다.
    }
  };

  const handleStartClick = () => {
    if (!hasLoadedSettings) return;
    if (!settings) {
      setIsSettingsOpen(true);
      return;
    }
    startCoach(settings);
  };

  const handleSkipSettings = () => {
    startCoach({
      subject: '수학',
      learningStage: 'CONCEPT_FOCUSED',
      learningGoal: 'CSAT',
      difficultAreas: [],
      customText: '',
      skipped: true,
    });
  };

  const handleSettingsSubmit = async (nextSettings: AiCoachSettings) => {
    if (status === 'READY') {
      await startCoach(nextSettings);
      return;
    }

    try {
      setSettings(nextSettings);
      await updatePreferenceMutation.mutateAsync(
        toPreferencePayload(nextSettings)
      );
      setIsSettingsOpen(false);
    } catch {
      // mutation hook에서 공통 API 에러 처리를 수행한다.
    }
  };

  // 현재 손글씨 풀이 스냅샷을 업로드해 media_id 를 얻는다(있을 때만).
  // 같은 strokes 면 이전 업로드를 재사용하고, 업로드 실패는 전송을 막지 않는다.
  const resolveSolutionMediaId = async (): Promise<string | undefined> => {
    if (drawingStrokes.length === 0) return undefined;
    if (lastDrawingUploadRef.current?.strokes === drawingStrokes) {
      return lastDrawingUploadRef.current.mediaId;
    }
    try {
      const { mediaId } = await uploadDrawingAsync(drawingStrokes);
      lastDrawingUploadRef.current = { strokes: drawingStrokes, mediaId };
      return mediaId;
    } catch {
      return undefined;
    }
  };

  const sendMessage = async (
    rawMessage: string,
    intent: 'concept' | 'hint' | 'chat' = 'chat'
  ) => {
    const trimmedMessage = rawMessage.trim();
    if (!trimmedMessage || status === 'READY' || isSending || !sessionId)
      return;
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmedMessage,
        timestamp: getTimestamp(),
      },
    ]);
    setStatus('COACHING');

    const studentSolutionImageMediaId = await resolveSolutionMediaId();

    sendMessageMutation.mutate(
      { message: trimmedMessage, studentSolutionImageMediaId, intent },
      {
        onSuccess: (response) => {
          setMessages((previousMessages) => [
            ...previousMessages,
            createAiMessage(
              response.reply,
              toProgressStep(response.progressionStep)
            ),
          ]);
          setStatus(response.status);
        },
        onError: () => {
          setMessages((previousMessages) => [
            ...previousMessages,
            createAiMessage(
              '지금은 AI 코치 응답을 불러오지 못했어요. 잠시 후 다시 보내주세요.'
            ),
          ]);
          setStatus('WAITING_ANSWER');
        },
      }
    );
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleConfirmViewSolution = () => {
    if (!attemptId) return;
    solutionMutation.mutate(attemptId, {
      onSuccess: (solution) => {
        setHasViewedSolution(true);
        setIsSolutionWarningOpen(false);
        const answerLine = solution.correctAnswer
          ? `**정답: ${solution.correctAnswer}**\n\n`
          : '';
        setMessages((previousMessages) => [
          ...previousMessages,
          createAiMessage(
            `${answerLine}${solution.content || '해설 본문이 준비되지 않았어요.'}`,
            undefined,
            'solution'
          ),
        ]);
      },
    });
  };

  const handleRestart = () => {
    if (sessionId && status !== 'FINISHED' && status !== 'ABANDONED') {
      abandonSessionMutation.mutate(sessionId);
    }
    setMessages([]);
    setSessionId('');
    onSessionChange?.(null);
    setStatus('READY');
    onAttemptCleared();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value.slice(0, MAX_COMMENT_LENGTH));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSendMessage();
  };

  const enumOptions = preferenceEnumsQuery.data;

  if (!isLoggedIn) {
    return (
      <div className="border-line-line1 flex h-full flex-col items-center justify-center gap-4 rounded-xl border bg-white p-8 text-center">
        <div className="bg-gray-1 flex h-16 w-16 items-center justify-center rounded-full">
          <Bot
            size={32}
            className="text-gray-7"
          />
        </div>
        <div>
          <p className="font-body1-heading text-text-main">AI 코치</p>
          <p className="text-gray-8 mt-1 text-sm">
            로그인하면 AI 코치와 함께
            <br />
            문제를 풀 수 있어요.
          </p>
        </div>
        <Button
          asChild
          className="w-full"
        >
          <Link href={PUBLIC.CORE.LOGIN}>로그인하기</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border-line-line1 flex h-full flex-col rounded-xl border bg-white">
        <div className="border-line-line1 flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                status === 'READY' ? 'bg-gray-5' : 'bg-orange-7'
              )}
            />
            <span className="font-body1-heading text-text-main">AI 코치</span>
            {status !== 'READY' && (
              <span className="text-gray-7 truncate text-xs">
                {getStatusLabel(status)}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:bg-gray-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
              aria-label="AI 코치 맞춤 설정 수정"
            >
              <Settings
                size={16}
                className="text-gray-7"
              />
            </button>
            {status !== 'READY' && (
              <button
                type="button"
                onClick={handleRestart}
                className="hover:bg-gray-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
                aria-label="AI 코치 다시 시작"
              >
                <RotateCcw
                  size={16}
                  className="text-gray-7"
                />
              </button>
            )}
          </div>
        </div>

        {status === 'READY' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
            <div className="bg-orange-1 flex h-16 w-16 items-center justify-center rounded-full">
              <Bot
                size={32}
                className="text-orange-7"
              />
            </div>
            <div>
              <p className="font-body1-heading text-text-main">
                막히는 지점부터 같이 생각해요
              </p>
              <p className="text-gray-8 mt-2 text-sm leading-relaxed">
                AI 코치는 정답을 알려주지 않고,
                <br />
                직접 답을 고를 수 있게 힌트를 나눠서 줘요.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleStartClick}
              disabled={!hasLoadedSettings || isBusy}
              className="w-full"
            >
              {isBusy ? 'AI 코치 준비 중...' : 'AI 힌트 받기'}
            </Button>
            {settings && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="text-orange-7 cursor-pointer text-sm font-semibold"
              >
                맞춤 설정 수정
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              ref={scrollAreaRef}
              className="ai-coach-conversation flex flex-1 flex-col gap-4 overflow-y-auto p-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user'
                      ? 'justify-end'
                      : 'items-start gap-2'
                  )}
                >
                  {message.role === 'ai' && (
                    <div className="bg-gray-1 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <Bot
                        size={16}
                        className="text-gray-7"
                      />
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex max-w-[80%] flex-col gap-1',
                      message.role === 'user' && 'items-end'
                    )}
                  >
                    {message.step && (
                      <span className="text-orange-7 text-xs font-semibold">
                        {getProgressStepLabel(message.step)}
                      </span>
                    )}
                    {message.kind === 'solution' && (
                      <span className="text-orange-7 flex items-center gap-1 text-xs font-semibold">
                        <PenLine size={13} />
                        손글씨 해설
                      </span>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        message.role === 'ai'
                          ? message.kind === 'solution'
                            ? 'ai-coach-handwriting border-orange-2 rounded-tl-none border bg-[#fffdf3]'
                            : 'ai-coach-handwriting text-text-main rounded-tl-none bg-[#fffdf6]'
                          : 'bg-orange-7 rounded-tr-none text-white'
                      )}
                    >
                      {message.role === 'ai' ? (
                        <>
                          <MarkdownMessage content={message.content} />
                          {/* 디에듀 로고 워터마크 — 손글씨 노트에 도장 찍듯 */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/logo.svg"
                            alt="디에듀"
                            className="ai-coach-logo"
                          />
                        </>
                      ) : (
                        <span className="whitespace-pre-line">
                          {message.content}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-6 text-xs">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 빠른 동작 칩 — 개념/힌트는 권장(쉽게), 정답 해설은 차감 명시(신중) */}
            <div className="flex flex-col gap-2 px-4 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => sendMessage(CONCEPT_PROMPT, 'concept')}
                  disabled={isSending}
                  className="border-orange-3 bg-orange-1 text-orange-7 hover:bg-orange-2 flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  개념 보기
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage(HINT_PROMPT, 'hint')}
                  disabled={isSending}
                  className="border-orange-3 bg-orange-1 text-orange-7 hover:bg-orange-2 flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  힌트 보기
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsSolutionWarningOpen(true)}
                disabled={!canViewSolution || isSending}
                className="text-gray-7 hover:bg-gray-1 flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <BookOpenCheck size={16} />
                {hasViewedSolution
                  ? '해설을 확인했어요'
                  : `정답 해설 보기 (${solutionCostLabel})`}
              </button>
            </div>

            <div className="border-line-line1 flex items-center gap-2 border-t px-4 py-3">
              <input
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={status === 'COACHING' || isBusy}
                placeholder={
                  status === 'COACHING'
                    ? 'AI 코치가 생각 중이에요...'
                    : '메시지를 입력하세요...'
                }
                className="placeholder:text-gray-6 flex-1 text-sm outline-none disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  !inputMessage.trim() || status === 'COACHING' || isBusy
                }
                className="bg-orange-7 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="AI 코치에게 메시지 보내기"
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      <AiCoachSettingsDialog
        isOpen={isSettingsOpen}
        initialSettings={settings}
        learningStageOptions={toDialogOptions(enumOptions?.learningStage)}
        learningGoalOptions={toDialogOptions(enumOptions?.learningGoal)}
        difficultAreaOptions={toDialogOptions(enumOptions?.difficultArea)}
        onClose={() => setIsSettingsOpen(false)}
        onSubmit={handleSettingsSubmit}
        onSkip={
          status === 'READY'
            ? handleSkipSettings
            : () => setIsSettingsOpen(false)
        }
      />

      {/* 정답 해설 — 차감·트리 제외 경고 후 열람(코치보다 조용히) */}
      <Dialog
        isOpen={isSolutionWarningOpen}
        onOpenChange={setIsSolutionWarningOpen}
      >
        <Dialog.Content className="w-full max-w-[380px] gap-5 p-6 text-center">
          <Dialog.Header className="items-center">
            <div className="bg-orange-1 flex h-14 w-14 items-center justify-center rounded-full">
              <TriangleAlert
                size={26}
                className="text-orange-7"
                aria-hidden
              />
            </div>
            <Dialog.Title className="text-text-main text-lg font-bold">
              해설을 볼까요?
            </Dialog.Title>
            <Dialog.Description className="text-gray-8 text-sm leading-relaxed">
              {isSolutionFree ? (
                <>
                  이번 해설은{' '}
                  <span className="text-orange-7 font-semibold">
                    무료
                  </span>
                  예요 (포인트 차감 없음). 단, 이 문제는 약점 지도에 채워지지
                  않아요. 그래도 볼까요?
                </>
              ) : (
                <>
                  해설을 보면{' '}
                  <span className="text-orange-7 font-semibold tabular-nums">
                    −{solutionCostP}P
                  </span>{' '}
                  차감되고, 이 문제는 약점 지도에 채워지지 않아요. 그래도 볼까요?
                </>
              )}
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer className="flex-col">
            <Button
              type="button"
              onClick={handleConfirmViewSolution}
              disabled={solutionMutation.isPending}
              className="w-full"
            >
              {solutionMutation.isPending
                ? '해설 불러오는 중...'
                : `해설 보기 (${solutionCostLabel})`}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsSolutionWarningOpen(false)}
              disabled={solutionMutation.isPending}
              className="w-full"
            >
              조금 더 풀어볼게요
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
