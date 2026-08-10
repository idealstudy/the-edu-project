'use client';

import { useEffect, useRef } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useOpenChallengeDetailQuery } from '@/features/open-challenge/hooks/use-open-challenge';
import { useSession } from '@/providers';
import { Button, StatusBadge, showBottomToast } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { trackOcLand } from '@/shared/lib/analytics';
import { Swords } from 'lucide-react';

import {
  useAcceptChallengeInviteMutation,
  useCreateGuestSessionMutation,
  usePublicInvitePreviewQuery,
} from '../../hooks';
import {
  difficultyLabel,
  inviteStatusLabel,
  subjectLabel,
} from '../../lib/labels';

/* ─────────────────────────────────────────────────────
 * 도전장 공개 랜딩 (비로그인 진입 퍼널 F2)
 *  - 미리보기 조회 → 가입/로그인 유도 또는 (로그인 시) 수락
 * ────────────────────────────────────────────────────*/
export const ChallengeInviteLanding = ({ token }: { token: string }) => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const hasFiredLandRef = useRef(false);

  useEffect(() => {
    if (hasFiredLandRef.current) return;
    hasFiredLandRef.current = true;
    trackOcLand({ src: 'friend', entry_kind: 'friend' });
  }, []);

  const {
    data: preview,
    isLoading,
    isError,
  } = usePublicInvitePreviewQuery(token);
  const { mutate: accept, isPending: isAccepting } =
    useAcceptChallengeInviteMutation();
  const createGuestSession = useCreateGuestSessionMutation();
  const { data: challenge } = useOpenChallengeDetailQuery(
    String(preview?.challengeId ?? ''),
    { enabled: !!preview }
  );

  const handleAccept = () => {
    if (!preview) return;
    accept(token, {
      onSuccess: () =>
        router.push(
          `${PUBLIC.OPEN_CHALLENGE.DETAIL(String(preview.challengeId))}?inviteToken=${token}`
        ),
      onError: () =>
        showBottomToast(
          '도전장을 수락하지 못했어요. 잠시 후 다시 시도해 주세요.'
        ),
    });
  };

  const handleGuestStart = async () => {
    if (!preview) return;
    try {
      await createGuestSession.mutateAsync({
        challengeId: preview.challengeId,
        shareToken: token,
      });
      const query = new URLSearchParams({
        inviteToken: token,
        guestSession: '1',
      });
      router.push(
        `${PUBLIC.OPEN_CHALLENGE.DETAIL(preview.challengeId)}?${query.toString()}`
      );
    } catch {
      showBottomToast('도전을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-110">
        <div className="border-line-line2 bg-gray-1 rounded-section h-72 w-full animate-pulse border" />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="border-line-line2 rounded-section flex w-full max-w-110 flex-col items-center gap-4 border bg-white p-8 text-center">
        <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
          <Swords size={26} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-headline1-heading text-text-main text-balance">
            이 도전장은 닫혔어요
          </h1>
          <p className="font-body2-normal text-text-sub1 text-balance">
            보낸 사람이 취소했거나 기한이 지난 링크예요. 링크를 보내 준 친구에게
            다시 받아 보세요.
          </p>
        </div>
        <Button
          asChild
          size="small"
          className="w-full"
        >
          <Link href={PUBLIC.OPEN_CHALLENGE.LIST}>오픈챌린지 둘러보기</Link>
        </Button>
      </div>
    );
  }

  const difficulty = difficultyLabel(preview.difficulty);

  return (
    <div className="flex w-full max-w-140 flex-col gap-4">
      <div className="border-line-line2 grid grid-cols-4 overflow-hidden rounded-xl border bg-white text-center">
        {['열어보기', '풀어보기', '채점', '기록 남기기'].map((label, index) => (
          <div
            key={label}
            className={index === 0 ? 'bg-orange-1 px-2 py-3' : 'px-2 py-3'}
          >
            <span className="text-text-sub2 text-ui-compact block">
              {index + 1}단계
            </span>
            <strong
              className={
                index === 0
                  ? 'text-orange-10 text-xs'
                  : 'text-text-sub1 text-xs'
              }
            >
              {label}
            </strong>
          </div>
        ))}
      </div>

      <div className="border-line-line2 rounded-section flex flex-col gap-6 border bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
            <Swords size={26} />
          </span>
          <h1 className="font-headline1-heading text-text-main text-balance">
            {preview.inviterName ?? '친구'}님이 도전장을 보냈어요
          </h1>
          <p className="font-body2-normal text-text-sub1 text-balance">
            {preview.sentAt
              ? `${new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(preview.sentAt))}에 보냄`
              : '같은 문제를 풀고 누가 더 잘 푸는지 겨뤄봐요.'}
            {preview.opponentSolvedAt && ' · 상대는 이미 풀었어요'}
          </p>
        </div>

        <div className="border-line-line2 bg-gray-1 rounded-card flex flex-col gap-3 border p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              variant="primary"
              label={subjectLabel(preview.subject)}
            />
            {difficulty && (
              <StatusBadge
                variant="default"
                label={difficulty}
              />
            )}
            <StatusBadge
              variant="default"
              label={inviteStatusLabel(preview.status)}
            />
          </div>
          <p className="font-body1-heading text-text-main text-balance">
            {preview.challengeTitle}
          </p>
          {challenge && (
            <>
              <p className="text-text-main text-sm leading-relaxed whitespace-pre-line">
                {challenge.questionText}
              </p>
              <p className="text-text-sub2 text-xs">
                {challenge.wrongAnswerRateSource === 'ESTIMATED'
                  ? '오답률 추정값'
                  : `오답률 ${challenge.wrongAnswerRate}%`}
                {challenge.questionNumber
                  ? ` · ${challenge.questionNumber}번`
                  : ''}
              </p>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <Button
            size="medium"
            className="w-full"
            disabled={isAccepting}
            onClick={handleAccept}
          >
            {isAccepting ? '도전 받는 중…' : '도전 받기'}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              size="medium"
              className="w-full"
              disabled={createGuestSession.isPending}
              onClick={handleGuestStart}
            >
              {createGuestSession.isPending
                ? '도전 여는 중…'
                : '가입 없이 지금 풀어보기'}
            </Button>
            <Button
              asChild
              variant="outlined"
              size="medium"
              className="w-full"
            >
              <Link
                href={`${PUBLIC.CORE.LOGIN}?redirect=${encodeURIComponent(
                  PUBLIC.CORE.INVITE.CHALLENGE(token)
                )}`}
              >
                로그인
              </Link>
            </Button>
          </div>
        )}
        {!isAuthenticated && (
          <p className="text-text-sub2 text-center text-xs">
            한 문제는 가입 없이 그냥 풉니다. 답이 맞았는지도 바로 알려 드려요
          </p>
        )}
      </div>
    </div>
  );
};
