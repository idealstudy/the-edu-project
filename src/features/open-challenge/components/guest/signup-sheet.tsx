'use client';

import { useRouter } from 'next/navigation';

import { Button, Dialog } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { Check, X } from 'lucide-react';

type SignupSheetTrigger = 'limit-reached' | 'correct-answer';

type SignupSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trigger: SignupSheetTrigger;
  challengeId: string;
  /**
   * 무료 한도 도달(limit-reached) 시점의 방금 문제 정오 여부.
   * 정답 시엔 별도 'correct-answer' 트리거를 쓰므로 보통 undefined지만,
   * 한도 도달과 오답이 동시에 발생하면(예: 마지막 무료 문제를 틀림)
   * 모달이 정오 표시 없이 곧장 뜨는 비대칭을 막기 위해 넘겨받는다.
   */
  isCorrect?: boolean;
  guestToken?: string;
  inviteToken?: string;
};

const COPY: Record<SignupSheetTrigger, { title: string; subtitle: string }> = {
  'limit-reached': {
    title: '3초면 됩니다',
    subtitle:
      '가입하면 지금 이 자리에서 대결 결과가 열리고, 해설도 볼 수 있어요.',
  },
  'correct-answer': {
    title: '방금 문제, 맞혔어요!',
    subtitle:
      '가입하면 지금 이 자리에서 대결 결과가 열리고, 해설도 볼 수 있어요.',
  },
};

/* ─────────────────────────────────────────────────────
 * 게스트 가입 유도 시트 — 무료 한도 도달 / 정답 직후 순간 노출.
 * 정본: prototypes/mvp-e-입구플로우-v5.html §4(가입) 카피·손실회피 구조를 따른다.
 * 웹·태블릿은 중앙 모달, 모바일은 하단 시트로 보이도록 반응형 클래스만 다르게 준다.
 * ────────────────────────────────────────────────────*/
export const SignupSheet = ({
  isOpen,
  onOpenChange,
  trigger,
  challengeId,
  isCorrect,
  guestToken,
  inviteToken,
}: SignupSheetProps) => {
  const router = useRouter();
  const copy = COPY[trigger];
  // limit-reached 트리거에서만 방금 문제 정오를 상단에 먼저 알린다(오답 시 무표시 비대칭 방지).
  const showVerdict =
    trigger === 'limit-reached' && typeof isCorrect === 'boolean';

  const handleSignup = () => {
    const returnQuery = new URLSearchParams();
    if (guestToken) returnQuery.set('guestToken', guestToken);
    if (inviteToken) returnQuery.set('inviteToken', inviteToken);
    const returnPath = `${PUBLIC.OPEN_CHALLENGE.DETAIL(challengeId)}${returnQuery.size > 0 ? `?${returnQuery.toString()}` : ''}`;
    const from = encodeURIComponent(returnPath);
    router.push(`${PUBLIC.CORE.SIGNUP}?redirect=${from}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content
        data-testid="signup-sheet"
        className="fixed top-auto bottom-0 left-0 w-full max-w-full translate-x-0 translate-y-0 gap-5 rounded-t-[24px] rounded-b-none p-6 pb-8 text-center sm:top-1/2 sm:left-1/2 sm:max-w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
      >
        <Dialog.Header className="items-center">
          {showVerdict && (
            <p
              data-testid="signup-sheet-verdict"
              className={
                isCorrect
                  ? 'text-system-success flex items-center gap-1 text-sm font-bold'
                  : 'text-system-warning flex items-center gap-1 text-sm font-bold'
              }
            >
              {isCorrect ? (
                <Check
                  size={16}
                  aria-hidden
                />
              ) : (
                <X
                  size={16}
                  aria-hidden
                />
              )}
              {isCorrect
                ? '방금 문제, 맞혔어요!'
                : '아쉽게 틀렸어요 — 가입하면 왜 틀렸는지 알려드려요'}
            </p>
          )}
          <Dialog.Title className="text-text-main text-lg font-bold">
            {copy.title}
          </Dialog.Title>
          <Dialog.Description className="text-gray-8 text-sm leading-relaxed">
            {copy.subtitle}
          </Dialog.Description>
        </Dialog.Header>

        <div className="bg-orange-1 border-orange-3 my-4 rounded-xl border px-4 py-4 text-left">
          <p className="text-text-main text-sm font-bold">
            방금 쓴 손풀이와 풀이 기록이 그대로 옮겨가요.
          </p>
          <p className="text-text-sub1 mt-1 text-xs">
            다시 풀지 않아도 됩니다.
          </p>
        </div>

        <Dialog.Footer className="flex-col gap-2">
          <Button
            type="button"
            onClick={handleSignup}
            data-testid="signup-sheet-cta"
            className="w-full"
          >
            카카오로 3초 만에 시작하기
          </Button>
          <p className="text-gray-8 text-xs">
            가입하지 않고 나가도 됩니다. 게스트 기록은 7일 뒤 만료돼요.
          </p>
          <Button
            type="button"
            variant="outlined"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            다음에 할게요
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
