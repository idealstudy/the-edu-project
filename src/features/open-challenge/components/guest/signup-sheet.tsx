'use client';

import { useRouter } from 'next/navigation';

import { Button, Dialog } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

type SignupSheetTrigger = 'limit-reached' | 'correct-answer';

type SignupSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trigger: SignupSheetTrigger;
  challengeId: string;
};

const COPY: Record<
  SignupSheetTrigger,
  { title: string; subtitle: string }
> = {
  'limit-reached': {
    title: '여기까지가 게스트 체험',
    subtitle: '방금 채운 지도 한 칸과 포인트, 저장 안 하면 사라져요.',
  },
  'correct-answer': {
    title: '방금 문제, 맞혔어요!',
    subtitle: '가입하면 이 결과부터 레벨·약점 지도가 쌓여요.',
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
}: SignupSheetProps) => {
  const router = useRouter();
  const copy = COPY[trigger];

  const handleSignup = () => {
    const from = encodeURIComponent(PUBLIC.OPEN_CHALLENGE.DETAIL(challengeId));
    router.push(`${PUBLIC.CORE.SIGNUP}?redirect=${from}`);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content
        data-testid="signup-sheet"
        className="fixed bottom-0 top-auto left-0 w-full max-w-full translate-x-0 translate-y-0 gap-5 rounded-t-[24px] rounded-b-none p-6 pb-8 text-center sm:top-1/2 sm:left-1/2 sm:max-w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]"
      >
        <Dialog.Header className="items-center">
          <Dialog.Title className="text-text-main text-lg font-bold">
            {copy.title}
          </Dialog.Title>
          <Dialog.Description className="text-gray-8 text-sm leading-relaxed">
            {copy.subtitle}
          </Dialog.Description>
        </Dialog.Header>

        <div className="my-4 flex gap-2.5">
          <div className="bg-orange-1 border-orange-3 flex-1 rounded-xl border px-3 py-4 text-center">
            <p className="text-orange-7 text-lg font-extrabold">+10P</p>
            <p className="text-orange-12 mt-1 text-xs font-bold">
              모은 포인트
            </p>
          </div>
          <div className="bg-orange-1 border-orange-3 flex-1 rounded-xl border px-3 py-4 text-center">
            <p className="text-orange-7 text-lg font-extrabold">1칸</p>
            <p className="text-orange-12 mt-1 text-xs font-bold">
              채운 약점 지도
            </p>
          </div>
        </div>

        <p className="text-system-warning mb-3 text-xs font-bold">
          지금 나가면 이 진행이 초기화돼요
        </p>

        <Dialog.Footer className="flex-col gap-2">
          <Button
            type="button"
            onClick={handleSignup}
            data-testid="signup-sheet-cta"
            className="w-full"
          >
            💬 카카오로 10초 만에 저장
          </Button>
          <p className="text-gray-8 text-xs">
            이미 푼 문제·지도 그대로 이어져요 · <b>진행 손실 0</b>
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
