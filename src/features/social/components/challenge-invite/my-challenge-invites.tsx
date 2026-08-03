'use client';

import { useState } from 'react';

import Link from 'next/link';

import { type ChallengeInvite } from '@/entities/social';
import { Button, StatusBadge } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { Swords } from 'lucide-react';

import { useMyChallengeInvitesQuery } from '../../hooks';
import { inviteStatusLabel, subjectLabel } from '../../lib/labels';
import { ChallengeResultDialog } from './challenge-result-dialog';
import { ChallengeShareButton } from './challenge-share-button';

const STATUS_VARIANT = {
  OPEN: 'default',
  ACCEPTED: 'primary',
  COMPLETED: 'success',
} as const;

/**
 * 목록 한 행의 제목: 백엔드가 내려준 문제 제목이 있으면 그걸, 없으면(과거 데이터
 * 등 R-06 배선 이전) 내부 번호 노출을 피해 완곡한 표현으로 폴백한다.
 */
const inviteTitle = (invite: ChallengeInvite): string => {
  if (invite.challengeTitle) return invite.challengeTitle;
  return '문제 도전장';
};

const inviteMeta = (invite: ChallengeInvite): string => {
  const parts = [subjectLabel(invite.subject), invite.unitName].filter(
    (part): part is string => !!part
  );
  return parts.length > 0
    ? parts.join(' · ')
    : (invite.regDate?.slice(0, 10) ?? '도전장 발송');
};

/**
 * 한 행의 주 동작 버튼. 상태에 따라 라벨/동작만 바뀌고, 개수(1개)와 위치는
 * 모든 상태에서 고정한다(2026-08 배치: "수락됨/대기중 UI가 안 맞아 일관성
 * 깨짐" 지적 반영). 링크 복사 등 보조 동작은 공유 다이얼로그 내부로 옮겼다.
 */
const PrimaryAction = ({
  invite,
  onViewResult,
}: {
  invite: ChallengeInvite;
  onViewResult: (token: string) => void;
}) => {
  if (invite.status === 'OPEN') {
    // 이미 OPEN 도전장이 있으면 백엔드가 idempotent 하게 같은 shareToken 을
    // 재사용한다. 다시 눌러도 새 레코드가 쌓이지 않는다. 링크 복사는 다이얼로그
    // 안에서 제공된다(2026-08 배치: "보내기 버튼과 링크가 왜 두개" 지적 반영).
    return (
      <ChallengeShareButton
        challengeId={invite.challengeId}
        variant="primary"
        size="xsmall"
        label="공유하기"
      />
    );
  }

  // ACCEPTED / COMPLETED: 내(조회자)가 이 문제를 아직 안 풀었으면 "결과 보기"를
  // 눌러도 서버가 컨닝 가드로 정당하게 막는다. 그 전에 "먼저 풀기"로 유도한다.
  if (!invite.viewerCompleted) {
    return (
      <Button
        size="xsmall"
        variant="primary"
        asChild
      >
        <Link href={PUBLIC.OPEN_CHALLENGE.DETAIL(invite.challengeId)}>
          먼저 풀기
        </Link>
      </Button>
    );
  }

  return (
    <Button
      size="xsmall"
      onClick={() => onViewResult(invite.shareToken)}
    >
      결과 보기
    </Button>
  );
};

/* ─────────────────────────────────────────────────────
 * 내 도전 기록. 내가 보낸/받은 도전장 목록 + 상태별 주 동작 1개
 * ────────────────────────────────────────────────────*/
export const MyChallengeInvites = () => {
  const {
    data: invites,
    isLoading,
    isError,
    refetch,
  } = useMyChallengeInvitesQuery();
  const [resultInvite, setResultInvite] = useState<ChallengeInvite | null>(
    null
  );

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
                        {inviteTitle(invite)}
                      </Link>
                      <span className="font-caption-normal text-text-sub2 truncate">
                        {inviteMeta(invite)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      variant={STATUS_VARIANT[invite.status]}
                      label={inviteStatusLabel(invite.status)}
                    />
                    <PrimaryAction
                      invite={invite}
                      onViewResult={() => setResultInvite(invite)}
                    />
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

      {resultInvite && (
        <ChallengeResultDialog
          token={resultInvite.shareToken}
          challengeId={resultInvite.challengeId}
          isOpen={resultInvite !== null}
          onOpenChange={(open) => {
            if (!open) setResultInvite(null);
          }}
        />
      )}
    </section>
  );
};
