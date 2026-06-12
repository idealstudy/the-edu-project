'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Button, StatusBadge, showBottomToast } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { Swords } from 'lucide-react';

import { useMyChallengeInvitesQuery } from '../../hooks';
import { inviteStatusLabel } from '../../lib/labels';
import { ChallengeResultDialog } from './challenge-result-dialog';

const STATUS_VARIANT = {
  OPEN: 'default',
  ACCEPTED: 'primary',
  COMPLETED: 'success',
} as const;

/* ─────────────────────────────────────────────────────
 * 내 도전 기록 — 내가 보낸 도전장 목록 + 상태/링크 복사
 * ────────────────────────────────────────────────────*/
export const MyChallengeInvites = () => {
  const { data: invites, isLoading, isError, refetch } =
    useMyChallengeInvitesQuery();
  const [resultToken, setResultToken] = useState<string | null>(null);

  const handleCopy = async (token: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}${PUBLIC.CORE.INVITE.CHALLENGE(token)}`;
    try {
      await navigator.clipboard.writeText(url);
      showBottomToast('도전장 링크를 복사했어요.');
    } catch {
      showBottomToast('복사에 실패했어요.');
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-body1-heading text-text-main">내 도전 기록</h2>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-line-line2 bg-gray-1 h-16 animate-pulse rounded-[12px] border"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="border-line-line2 flex flex-col items-center gap-3 rounded-[12px] border bg-white p-8 text-center">
          <p className="font-body2-normal text-text-sub1">
            도전 기록을 불러오지 못했어요.
          </p>
          <Button
            variant="outlined"
            size="small"
            onClick={() => refetch()}
          >
            다시 시도
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {invites && invites.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="border-line-line2 flex items-center justify-between gap-3 rounded-[12px] border bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-orange-1 text-key-color-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                      <Swords size={18} />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <Link
                        href={PUBLIC.OPEN_CHALLENGE.DETAIL(
                          String(invite.challengeId)
                        )}
                        className="font-body2-heading text-text-main hover:text-key-color-primary truncate"
                      >
                        챌린지 #{invite.challengeId}
                      </Link>
                      <span className="font-caption-normal text-text-sub2">
                        {invite.regDate?.slice(0, 10) ?? '도전장 발송'}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      variant={STATUS_VARIANT[invite.status]}
                      label={inviteStatusLabel(invite.status)}
                    />
                    {invite.status === 'COMPLETED' ? (
                      <Button
                        size="xsmall"
                        onClick={() => setResultToken(invite.shareToken)}
                      >
                        결과 보기
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="xsmall"
                        onClick={() => handleCopy(invite.shareToken)}
                      >
                        링크 복사
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border-line-line2 flex flex-col items-center gap-2 rounded-[12px] border border-dashed bg-white p-8 text-center">
              <p className="font-body2-heading text-text-main">
                아직 보낸 도전장이 없어요
              </p>
              <p className="font-caption-normal text-text-sub2 text-balance">
                문제를 풀고 결과 화면에서 친구에게 도전장을 보내보세요.
              </p>
            </div>
          )}
        </>
      )}

      {resultToken && (
        <ChallengeResultDialog
          token={resultToken}
          isOpen={resultToken !== null}
          onOpenChange={(open) => {
            if (!open) setResultToken(null);
          }}
        />
      )}
    </section>
  );
};
