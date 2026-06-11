'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from '@/providers';
import { Button, StatusBadge, showBottomToast } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { Swords } from 'lucide-react';

import {
  useAcceptChallengeInviteMutation,
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

  const { data: preview, isLoading, isError } =
    usePublicInvitePreviewQuery(token);
  const { mutate: accept, isPending: isAccepting } =
    useAcceptChallengeInviteMutation();

  const handleAccept = () => {
    if (!preview) return;
    accept(token, {
      onSuccess: () =>
        router.push(
          PUBLIC.OPEN_CHALLENGE.DETAIL(String(preview.challengeId))
        ),
      onError: () =>
        showBottomToast('도전장을 수락하지 못했어요. 잠시 후 다시 시도해 주세요.'),
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[440px]">
        <div className="border-line-line2 bg-gray-1 h-72 w-full animate-pulse rounded-[16px] border" />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="border-line-line2 flex w-full max-w-[440px] flex-col items-center gap-4 rounded-[16px] border bg-white p-8 text-center">
        <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
          <Swords size={26} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-headline1-heading text-text-main text-balance">
            도전장을 찾을 수 없어요
          </h1>
          <p className="font-body2-normal text-text-sub1 text-balance">
            링크가 만료되었거나 잘못된 도전장이에요.
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
    <div className="border-line-line2 flex w-full max-w-[440px] flex-col gap-6 rounded-[16px] border bg-white p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
          <Swords size={26} />
        </span>
        <h1 className="font-headline1-heading text-text-main text-balance">
          친구가 도전장을 보냈어요
        </h1>
        <p className="font-body2-normal text-text-sub1 text-balance">
          같은 문제를 풀고 누가 더 잘 푸는지 겨뤄봐요.
        </p>
      </div>

      <div className="border-line-line2 bg-gray-1 flex flex-col gap-3 rounded-[12px] border p-5">
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
            asChild
            size="medium"
            className="w-full"
          >
            <Link
              href={`${PUBLIC.CORE.SIGNUP}?redirect=${encodeURIComponent(
                PUBLIC.CORE.INVITE.CHALLENGE(token)
              )}`}
            >
              가입하고 도전 받기
            </Link>
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
    </div>
  );
};
