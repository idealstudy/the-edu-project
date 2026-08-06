'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { type ChallengeInviteResult } from '@/entities/social';
import { Button } from '@/shared/components/ui';
import { Dialog } from '@/shared/components/ui/dialog';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { trackVersusView } from '@/shared/lib/analytics';
import {
  extractErrorCode,
  extractErrorMessage,
} from '@/shared/lib/bff/utils.message';
import { AxiosError } from 'axios';
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
  challengeId,
  isOpen,
  onOpenChange,
}: {
  token: string;
  /** 컨닝 가드에 막혔을 때 "먼저 풀기"로 보낼 문제 상세 경로 계산용. */
  challengeId?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    data: result,
    error,
    isLoading,
    isError,
    refetch,
  } = useInviteResultQuery(token, { enabled: isOpen });

  const isPending = !!result && result.status !== 'COMPLETED';

  // 컨닝 가드(CUNNING_GUARD_BLOCKED): 내가 아직 문제를 안 풀어서 결과 조회가
  // 막힌 정상적인 상황이다. "결과를 불러오지 못했어요"라는 무관한 문구로 덮지 않고
  // 서버가 준 사유를 그대로 보여준 뒤, 문제 풀이로 보내는 게 맞는 동작이다.
  // 내부 에러 코드는 화면에 노출하지 않는다.
  const isCunningGuardBlocked =
    error instanceof AxiosError &&
    extractErrorCode(error.response?.data) === 'CUNNING_GUARD_BLOCKED';
  const cunningGuardMessage =
    (error instanceof AxiosError
      ? extractErrorMessage(error.response?.data)
      : undefined) ?? '아직 문제를 풀지 않아서 상대방 결과를 볼 수 없어요.';

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

        {isError && isCunningGuardBlocked && (
          <>
            <Dialog.Title className="font-body1-heading text-text-main mb-2">
              아직 결과를 볼 수 없어요
            </Dialog.Title>
            <Dialog.Description className="font-body2-normal text-text-sub1 text-balance">
              {cunningGuardMessage}
            </Dialog.Description>
            <Dialog.Footer className="mt-6 flex w-full gap-2">
              <Dialog.Close asChild>
                <Button
                  variant="outlined"
                  size="large"
                  className="flex-1"
                >
                  닫기
                </Button>
              </Dialog.Close>
              {challengeId != null && (
                <Button
                  variant="primary"
                  size="large"
                  className="flex-1"
                  asChild
                >
                  <Link href={PUBLIC.OPEN_CHALLENGE.DETAIL(challengeId)}>
                    문제 풀러 가기
                  </Link>
                </Button>
              )}
            </Dialog.Footer>
          </>
        )}

        {isError && !isCunningGuardBlocked && (
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

  // D2 계측: versus_view — 결과 다이얼로그 마운트 시 1회
  // is_inviter: ChallengeInviteResult에 inviterId 미포함 → false 기본값(수신자 관점)
  useEffect(() => {
    trackVersusView({ outcome, is_inviter: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          timeSpentSeconds={result.myAttempt?.timeSpentSeconds ?? null}
          solutionImageUrl={result.myAttempt?.solutionImageUrl ?? null}
        />
        <ResultCell
          label="상대"
          correct={result.opponentCorrect ?? false}
          highlight={outcome === 'LOSE'}
          timeSpentSeconds={result.opponentAttempt?.timeSpentSeconds ?? null}
          solutionImageUrl={result.opponentAttempt?.solutionImageUrl ?? null}
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

/**
 * 소요시간(초)을 "1분 30초" 형태로 포맷한다. null 이면 표시하지 않는다.
 */
const formatTimeSpent = (seconds: number | null): string | null => {
  if (seconds == null || seconds < 0) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}초`;
  return `${minutes}분 ${rest}초`;
};

const ResultCell = ({
  label,
  correct,
  highlight,
  timeSpentSeconds,
  solutionImageUrl,
}: {
  label: string;
  correct: boolean;
  highlight: boolean;
  timeSpentSeconds?: number | null;
  solutionImageUrl?: string | null;
}) => {
  const timeLabel = formatTimeSpent(timeSpentSeconds ?? null);

  return (
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
          correct
            ? 'bg-system-success/10 text-system-success'
            : 'bg-gray-1 text-text-sub2'
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
      {timeLabel && (
        <span className="font-caption-normal text-text-sub2 tabular-nums">
          {timeLabel}
        </span>
      )}
      {solutionImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, next/image 도메인 미등록
        <img
          src={solutionImageUrl}
          alt={`${label} 풀이 이미지`}
          className="border-line-line2 mt-1 h-16 w-full rounded-[8px] border object-cover"
        />
      )}
    </div>
  );
};
