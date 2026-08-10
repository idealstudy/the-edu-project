'use client';

import { useEffect, useState } from 'react';

import { Button, Dialog } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import {
  ChevronLeft,
  type LucideIcon,
  ShieldCheck,
  Swords,
  Trophy,
  UserPlus,
} from 'lucide-react';

const STORAGE_KEY = 'dedu:friends-tutorial-seen';

type TutorialStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: TutorialStep[] = [
  {
    icon: UserPlus,
    title: '1. 친구 추가하기',
    description:
      '친구의 회원 번호를 입력해 요청을 보내요. 상대가 수락하면 친구가 돼요.',
  },
  {
    icon: Swords,
    title: '2. 도전장 보내기',
    description:
      '같은 문제로 친구에게 도전장을 보내요. 친구도 똑같은 문제를 받게 돼요.',
  },
  {
    icon: ShieldCheck,
    title: '3. 각자 풀기 (컨닝가드)',
    description:
      '둘 다 풀기 전까지는 서로의 답과 풀이가 가려져요. 온전히 내 힘으로 풀어요.',
  },
  {
    icon: Trophy,
    title: '4. 결과 비교하기',
    description:
      '둘 다 제출하면 결과를 나란히 비교해요. 누가 더 제대로 풀었는지 확인해요.',
  },
];

type FriendsTutorialDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FriendsTutorialDialog = ({
  isOpen,
  onClose,
}: FriendsTutorialDialogProps) => {
  const [stepIndex, setStepIndex] = useState(0);

  // 닫을 때마다 처음 단계로 되돌려, 다시 열면 1단계부터 보이게 한다.
  useEffect(() => {
    if (!isOpen) setStepIndex(0);
  }, [isOpen]);

  const step = STEPS[stepIndex];
  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className="w-full max-w-105 gap-6 p-7">
        <Dialog.Header className="items-center text-center">
          <div className="bg-orange-1 flex h-20 w-20 items-center justify-center rounded-full">
            <StepIcon
              size={36}
              className="text-orange-7"
              aria-hidden
            />
          </div>
          <Dialog.Title className="text-text-main text-lg font-bold">
            {step.title}
          </Dialog.Title>
          <Dialog.Description className="text-gray-8 text-sm leading-relaxed text-balance">
            {step.description}
          </Dialog.Description>
        </Dialog.Header>

        {/* 진행 인디케이터 */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-2 rounded-full transition-all',
                index === stepIndex ? 'bg-orange-7 w-5' : 'bg-gray-3 w-2'
              )}
            />
          ))}
        </div>

        <Dialog.Footer className="flex-row items-center gap-2">
          {!isFirst && (
            <Button
              type="button"
              variant="outlined"
              onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              이전
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            className="flex-1"
          >
            {isLast ? '시작하기' : '다음'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────────
 * 친구 튜토리얼 런처
 *  - 첫 진입 시 자동 1회 노출(localStorage 플래그)
 *  - "튜토리얼 다시 보기" 버튼으로 언제든 재생
 * ────────────────────────────────────────────────────*/
export const FriendsTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setIsOpen(true);
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 자동 노출만 건너뛴다.
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // 저장 실패해도 닫기 동작은 유지.
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-orange-7 hover:text-orange-8 font-body2-normal w-fit cursor-pointer underline-offset-2 hover:underline"
      >
        같이 풀기 튜토리얼 다시 보기
      </button>

      <FriendsTutorialDialog
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
};
