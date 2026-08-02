'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Button, StatusBadge, showBottomToast } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { Link2, Swords } from 'lucide-react';

import { useMyChallengeInvitesQuery } from '../../hooks';
import { inviteStatusLabel } from '../../lib/labels';
import { ChallengeResultDialog } from './challenge-result-dialog';
import { ChallengeShareButton } from './challenge-share-button';

const STATUS_VARIANT = {
  OPEN: 'default',
  ACCEPTED: 'primary',
  COMPLETED: 'success',
} as const;

/* ─────────────────────────────────────────────────────
 * 내 도전 기록 — 내가 보낸 도전장 목록 + 상태/링크 복사
 * ────────────────────────────────────────────────────*/
export const MyChallengeInvites = () => {
  const {
    data: invites,
    isLoading,
    isError,
    refetch,
  } = useMyChallengeInvitesQuery();
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
                    {invite.status === 'ACCEPTED' ||
                    invite.status === 'COMPLETED' ? (
                      <>
                        {/* 수락됨/완료 — 양측 결과가 존재할 수 있으므로 "결과 보기"가
                            주 동작(4-C 비교 화면 진입). ACCEPTED는 상대가 아직
                            안 풀었을 수 있어 다이얼로그 내부에서 진행 상태를 보여준다. */}
                        <Button
                          size="xsmall"
                          onClick={() => setResultToken(invite.shareToken)}
                        >
                          결과 보기
                        </Button>
                        {/* 재도전 유도 — 같은 챌린지에 새 도전장(idempotent) 발급 */}
                        <ChallengeShareButton
                          challengeId={invite.challengeId}
                          variant="outlined"
                          size="xsmall"
                          label="다시 도전"
                        />
                      </>
                    ) : (
                      <>
                        {/* 진행 중인 도전장은 "도전장 보내기"가 주 동작(공유 다이얼로그) —
                            같은 챌린지에 이미 OPEN 도전장이 있으면 백엔드가 idempotent 하게
                            기존 shareToken 을 그대로 재사용해 새 레코드가 쌓이지 않는다. */}
                        <ChallengeShareButton
                          challengeId={invite.challengeId}
                          variant="primary"
                          size="xsmall"
                          label="도전장 보내기"
                        />
                        {/* 링크 복사는 보조 동작으로 격하 — 아이콘 버튼 */}
                        <Button
                          variant="outlined"
                          size="xsmall"
                          aria-label="도전장 링크 복사"
                          className="px-2"
                          onClick={() => handleCopy(invite.shareToken)}
                        >
                          <Link2 size={16} />
                        </Button>
                      </>
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
