'use client';

import { type ChallengeInviteResult } from '@/entities/social';
import { Button } from '@/shared/components/ui';
import { Dialog } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib';
import { Check, Swords, X } from 'lucide-react';

import { useInviteResultQuery } from '../../hooks';

/* ─────────────────────────────────────────────────────
 * 도전장 결과 비교 — 나 vs 상대 정답 여부 + 승패.
 *  - 컨닝 가드: status === COMPLETED 일 때만 결과 노출.
 *  - 둘 다 정답=무승부 / 한쪽만=승·패 / 둘 다 오답=무승부(아쉬움).
 *  - 톤: 재미·격려.
 * ────────────────────────────────────────────────────*/
type Outcome = 'WIN' | 'LOSE' | 'DRAW';

const resolveOutcome = (result: ChallengeInviteResult): Outcome => {
  const me = result.myCorrect ?? false;
  const opponent = result.opponentCorrect ?? false;
  if (me === opponent) return 'DRAW';
  return me ? 'WIN' : 'LOSE';
};

const OUTCOME_COPY: Record<Outcome, { title: string; sub: string }> = {
  WIN: { title: '승리했어요! 🎉', sub: '실력으로 멋지게 이겼어요.' },
  LOSE: {
    title: '아쉽게 졌어요',
    sub: '다음 도전에선 꼭 설욕해봐요. 다시 도전!',
  },
  DRAW: { title: '무승부예요', sub: '막상막하! 다음 문제로 다시 겨뤄봐요.' },
};

export const ChallengeResultDialog = ({
  token,
  isOpen,
  onOpenChange,
}: {
  token: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useInviteResultQuery(token, { enabled: isOpen });

  const isPending = !!result && result.status !== 'COMPLETED';

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content className="w-[420px] items-center gap-0 p-7 text-center">
        <span className="bg-orange-1 text-key-color-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <Swords size={26} />
        </span>

        {isLoading && (
          <>
            <Dialog.Title className="font-body1-heading text-text-main">
              결과를 불러오는 중이에요…
            </Dialog.Title>
            <div className="bg-gray-1 mt-5 h-24 w-full animate-pulse rounded-[12px]" />
          </>
        )}

        {isError && (
          <>
            <Dialog.Title className="font-body1-heading text-text-main mb-2">
              결과를 불러오지 못했어요
            </Dialog.Title>
            <Dialog.Description className="font-body2-normal text-text-sub1">
              잠시 후 다시 시도해 주세요.
            </Dialog.Description>
            <Dialog.Footer className="mt-6 w-full">
              <Button
                variant="outlined"
                size="large"
                className="w-full"
                onClick={() => refetch()}
              >
                다시 시도
              </Button>
            </Dialog.Footer>
          </>
        )}

        {!isLoading && !isError && result && isPending && (
          <>
            <Dialog.Title className="font-body1-heading text-text-main mb-2">
              아직 진행 중이에요
            </Dialog.Title>
            <Dialog.Description className="font-body2-normal text-text-sub1 text-balance">
              나와 상대가 모두 문제를 풀어야 결과를 볼 수 있어요. 조금만 기다려
              주세요!
            </Dialog.Description>
            <Dialog.Footer className="mt-6 w-full">
              <Dialog.Close asChild>
                <Button
                  variant="outlined"
                  size="large"
                  className="w-full"
                >
                  닫기
                </Button>
              </Dialog.Close>
            </Dialog.Footer>
          </>
        )}

        {!isLoading && !isError && result && !isPending && (
          <ResultBody result={result} />
        )}
      </Dialog.Content>
    </Dialog>
  );
};

const ResultBody = ({ result }: { result: ChallengeInviteResult }) => {
  const outcome = resolveOutcome(result);
  const copy = OUTCOME_COPY[outcome];

  return (
    <>
      <Dialog.Title className="font-headline1-heading text-text-main mb-1">
        {copy.title}
      </Dialog.Title>
      <Dialog.Description className="font-body2-normal text-text-sub1 text-balance">
        {copy.sub}
      </Dialog.Description>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <ResultCell
          label="나"
          correct={result.myCorrect ?? false}
          highlight={outcome === 'WIN'}
        />
        <ResultCell
          label="상대"
          correct={result.opponentCorrect ?? false}
          highlight={outcome === 'LOSE'}
        />
      </div>

      <Dialog.Footer className="mt-6 w-full">
        <Dialog.Close asChild>
          <Button
            variant="primary"
            size="large"
            className="w-full"
          >
            확인
          </Button>
        </Dialog.Close>
      </Dialog.Footer>
    </>
  );
};

const ResultCell = ({
  label,
  correct,
  highlight,
}: {
  label: string;
  correct: boolean;
  highlight: boolean;
}) => (
  <div
    className={cn(
      'border-line-line2 flex flex-col items-center gap-2 rounded-[12px] border p-4',
      highlight && 'border-key-color-primary bg-orange-1'
    )}
  >
    <span className="font-caption-heading text-text-sub2">{label}</span>
    <span
      className={cn(
        'flex size-12 items-center justify-center rounded-full',
        correct ? 'bg-system-success/10 text-system-success' : 'bg-gray-1 text-text-sub2'
      )}
    >
      {correct ? <Check size={26} /> : <X size={26} />}
    </span>
    <span
      className={cn(
        'font-label-heading',
        correct ? 'text-system-success' : 'text-text-sub2'
      )}
    >
      {correct ? '정답' : '오답'}
    </span>
  </div>
);
