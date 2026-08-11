'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { type ChallengeInviteResult } from '@/entities/social';
import { Button, Card } from '@/shared/components/ui';
import { Dialog } from '@/shared/components/ui/dialog';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { trackVersusView } from '@/shared/lib/analytics';
import {
  extractErrorCode,
  extractErrorMessage,
} from '@/shared/lib/bff/utils.message';
import { AxiosError } from 'axios';
import { Check, Swords, X } from 'lucide-react';

import { useCreateRematchMutation, useInviteResultQuery } from '../../hooks';

/* ─────────────────────────────────────────────────────
 * 도전장 결과 비교: 나 vs 상대 정답 여부 + 승패.
 *  - 컨닝 가드: status === COMPLETED 일 때만 결과 노출.
 *  - 둘 다 정답=무승부 / 한쪽만=승·패 / 둘 다 오답=무승부(아쉬움).
 *  - 톤: 재미·격려.
 * ────────────────────────────────────────────────────*/
type Outcome = NonNullable<ChallengeInviteResult['outcome']>;

const OUTCOME_COPY: Record<Outcome, { title: string; sub: string }> = {
  WIN: {
    title: '이겼어요',
    sub: '두 사람이 고른 답과 풀이가 어디서 갈렸는지 확인해 보세요.',
  },
  LOSE: {
    title: '졌어요. 어디서 갈렸는지 보고 가요',
    sub: '상대의 풀이와 내 풀이에서 달라진 줄을 먼저 확인해 보세요.',
  },
  BOTH_WRONG: {
    title: '둘 다 걸렸어요',
    sub: '같은 문제에서 둘 다 놓친 지점을 확인하고 함께 다시 풀어보세요.',
  },
  BOTH_CORRECT: {
    title: '둘 다 맞혔어요',
    sub: '서로 다른 풀이 순서를 비교하고 다음 문제로 이어가 보세요.',
  },
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
      <Dialog.Content className="w-105 items-center gap-0 p-7 text-center">
        <span className="bg-orange-1 text-key-color-primary mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <Swords size={26} />
        </span>

        {isLoading && (
          <>
            <Dialog.Title className="font-body1-heading text-text-main">
              결과를 불러오는 중이에요…
            </Dialog.Title>
            <div className="bg-gray-1 rounded-card mt-5 h-24 w-full animate-pulse" />
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
  const outcome = result.outcome;
  const rematch = useCreateRematchMutation();
  const rematchErrorCode =
    rematch.error instanceof AxiosError
      ? extractErrorCode(rematch.error.response?.data)
      : undefined;

  // D2 계측: versus_view. 결과 다이얼로그 마운트 시 1회
  // is_inviter: ChallengeInviteResult에 inviterId 미포함 → false 기본값(수신자 관점)
  useEffect(() => {
    if (!outcome) return;
    trackVersusView({
      outcome:
        outcome === 'BOTH_WRONG' || outcome === 'BOTH_CORRECT'
          ? 'DRAW'
          : outcome,
      is_inviter: false,
    });
  }, [outcome]);

  if (!outcome) return null;
  const copy = OUTCOME_COPY[outcome];

  return (
    <>
      <Dialog.Title className="font-headline1-heading text-text-main mb-1">
        {copy.title}
      </Dialog.Title>
      <Dialog.Description className="font-body2-normal text-text-sub1 text-balance">
        {copy.sub}
      </Dialog.Description>

      {outcome !== 'WIN' &&
        result.divergence?.hasData &&
        result.divergence.reason && (
          <Card className="bg-gray-1 text-text-main mt-5 w-full text-left text-sm">
            <strong className="block">갈린 지점</strong>
            <span className="text-text-sub1 mt-1 block">
              {result.divergence.reason}
            </span>
          </Card>
        )}

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <ResultCell
          label="나"
          correct={result.myCorrect ?? false}
          highlight={outcome === 'WIN'}
          timeSpentSeconds={result.myAttempt?.timeSpentSeconds ?? null}
          solutionImageUrl={result.myAttempt?.solutionImageUrl ?? null}
          selectedAnswer={result.myAttempt?.selectedAnswer ?? null}
          solvedAt={result.myAttempt?.solvedAt ?? null}
          solutionWithdrawn={result.myAttempt?.solutionWithdrawn ?? false}
        />
        <ResultCell
          label={result.context?.inviterName ?? '상대'}
          correct={result.opponentCorrect ?? false}
          highlight={false}
          timeSpentSeconds={result.opponentAttempt?.timeSpentSeconds ?? null}
          solutionImageUrl={result.opponentAttempt?.solutionImageUrl ?? null}
          selectedAnswer={result.opponentAttempt?.selectedAnswer ?? null}
          solvedAt={result.opponentAttempt?.solvedAt ?? null}
          solutionWithdrawn={result.opponentAttempt?.solutionWithdrawn ?? false}
        />
      </div>

      <Card className="bg-gray-1 mt-6 w-full text-left">
        <Card.Header>
          <div className="min-w-0">
            {/* 문구는 "지금 실제로 하는 일"만 말한다 (2026-08-11 코드리뷰 BLOCK 해소).
                원래 시안 문구는 "같은 함정이 있는 문제로 이어집니다" + 버튼 "이 유형 3문제" 였으나,
                같은 유형을 골라주는 추천 기능이 서버에 없어 링크가 무필터 전체 목록으로 갔다.
                = 화면이 하지 않는 일을 약속하는 상태. 시안을 따르는 것보다 거짓말을 없애는 게 먼저라
                문구를 실제 동작 수준으로 낮췄다. 같은 유형 추천은 별도 건으로 설계한다.
                복구 조건: 유형별 추천 API 가 생기면 시안 원문 문구로 되돌린다. */}
            <Card.Title>
              {result.myCorrect === false
                ? '지금은 문제를 더 풀어보는 게 낫습니다'
                : '다음 대결은 둘 다 약한 단원에서 이어집니다'}
            </Card.Title>
            <Card.Description className="mt-inline-gap">
              {result.myCorrect === false
                ? '다시 붙기를 누르면 같은 문제가 아니라 둘 다 약한 단원의 다른 문제로 이어집니다.'
                : '같은 문제는 다시 보내지 않고, 둘 다 약한 단원의 다른 문제를 고릅니다.'}
            </Card.Description>
          </div>
        </Card.Header>
        {rematch.data && (
          <Card.Content className="font-caption-normal text-text-sub1">
            선정 이유: 둘 다 약한 {rematch.data.unitName}에서{' '}
            {rematch.data.challengeTitle}을 골랐어요.
          </Card.Content>
        )}
        <Card.Footer className="flex-col sm:flex-row">
          {result.myCorrect === false ? (
            <Button
              variant="primary"
              size="large"
              className="w-full flex-1"
              asChild
            >
              {/* 무필터 전체 목록으로 간다. 라벨도 그렇게 말한다(위 주석 참조). */}
              <Link href={PUBLIC.OPEN_CHALLENGE.LIST}>문제 더 풀기</Link>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="large"
              className="w-full flex-1"
              disabled={rematch.isPending}
              onClick={() => rematch.mutate(result.shareToken)}
            >
              {rematch.isPending ? '문제 고르는 중…' : '다시 붙기'}
            </Button>
          )}
          {result.myCorrect === false ? (
            <Button
              variant="outlined"
              size="large"
              className="w-full flex-1"
              disabled={rematch.isPending}
              onClick={() => rematch.mutate(result.shareToken)}
            >
              {rematch.isPending ? '문제 고르는 중…' : '다시 붙기'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="large"
              className="w-full flex-1"
              asChild
            >
              <Link href={PUBLIC.OPEN_CHALLENGE.LIST}>다른 문제로</Link>
            </Button>
          )}
        </Card.Footer>
        <p className="font-caption-normal text-text-sub2 mt-content-gap">
          한 친구와 동시에 3건까지 열 수 있어요.
        </p>
      </Card>
      {rematchErrorCode === 'REMATCH_NO_CANDIDATE' && (
        <div className="border-line-line2 bg-gray-1 mt-3 w-full rounded-xl border px-4 py-3 text-left">
          <strong className="text-text-main text-sm">
            이 단원에서 둘 다 안 푼 문제가 없어요
          </strong>
          <p className="text-text-sub1 mt-1 text-xs">
            둘 다 정복 중인 다른 단원을 고르거나 혼자 다른 문제를 풀어보세요.
          </p>
          <Link
            href={PUBLIC.OPEN_CHALLENGE.LIST}
            className="text-orange-10 mt-2 inline-block text-xs font-bold"
          >
            다른 단원 문제 보기
          </Link>
        </div>
      )}
      {rematchErrorCode === 'INVITE_LIMIT_EXCEEDED' && (
        <div className="border-line-line2 bg-gray-1 mt-3 w-full rounded-xl border px-4 py-3 text-left">
          <strong className="text-text-main text-sm">
            이 친구와 열려 있는 대결이 3건이에요
          </strong>
          <p className="text-text-sub1 mt-1 text-xs">
            먼저 내 차례인 대결을 끝내면 다시 붙을 수 있어요.
          </p>
          <Link
            href={PRIVATE.FRIENDS.INDEX}
            className="text-orange-10 mt-2 inline-block text-xs font-bold"
          >
            내 차례인 대결 풀러 가기
          </Link>
        </div>
      )}
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
  selectedAnswer,
  solvedAt,
  solutionWithdrawn,
}: {
  label: string;
  correct: boolean;
  highlight: boolean;
  timeSpentSeconds?: number | null;
  solutionImageUrl?: string | null;
  selectedAnswer?: string | null;
  solvedAt?: string | null;
  solutionWithdrawn?: boolean;
}) => {
  const timeLabel = formatTimeSpent(timeSpentSeconds ?? null);

  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-2',
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
      {selectedAnswer && (
        <span className="font-caption-normal text-text-sub2">
          고른 답 {selectedAnswer}
        </span>
      )}
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
      {solvedAt && (
        <span className="font-caption-normal text-text-sub2">
          {new Intl.DateTimeFormat('ko-KR', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(solvedAt))}
          에 제출
        </span>
      )}
      {solutionWithdrawn && (
        <span className="bg-gray-1 text-text-sub1 mt-1 w-full rounded-lg px-2 py-4 text-xs">
          {label === '나' ? '내가 풀이를 내렸어요' : '상대가 풀이를 내렸어요'}
        </span>
      )}
      {!solutionWithdrawn && solutionImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, next/image 도메인 미등록
        <img
          src={solutionImageUrl}
          alt={`${label} 풀이 이미지`}
          className="border-line-line2 rounded-button mt-1 h-16 w-full border object-cover"
        />
      )}
    </Card>
  );
};
