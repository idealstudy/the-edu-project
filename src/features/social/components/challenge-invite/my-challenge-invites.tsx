'use client';

import { useState } from 'react';

import Link from 'next/link';

import { type ChallengeInvite } from '@/entities/social';
import { Button, StatusBadge } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { ChevronDown, Swords } from 'lucide-react';

import { useMyChallengeInvitesQuery } from '../../hooks';
import { inviteStatusLabel, subjectLabel } from '../../lib/labels';
import { ChallengeShareButton } from './challenge-share-button';

const STATUS_VARIANT = {
  OPEN: 'default',
  ACCEPTED: 'primary',
  COMPLETED: 'success',
} as const;

/**
 * 문제(challengeId) 단위로 묶은 그룹. 회장 결정(2026-08-04): 목록의 단위를
 * "도전장"이 아니라 "문제"로 바꾼다. 같은 문제에 친구마다 별도로 걸린
 * 도전장들을 한 행으로 접어 넣는다. 도전장 생성 규칙(친구마다 별도 row)은
 * 서버 그대로 두고, 화면 표시만 바꾼다.
 */
type InviteGroup = {
  challengeId: number;
  invites: ChallengeInvite[]; // 최근 활동순 정렬(내림차순)
  latestDate: string | null;
  representativeStatus: ChallengeInvite['status'];
};

/** COMPLETED > ACCEPTED > OPEN. 묶인 대결 중 가장 진행된 상태를 대표값으로
 * 삼는다. "이 문제, 지금 어디까지 왔나"를 한눈에 보여주는 게 목적이라
 * 가장 진전된 상태가 대표하는 편이 대기중 하나 때문에 완료건이 묻히는 것보다
 * 유용하다고 판단했다. */
const STATUS_PROGRESS = {
  OPEN: 1,
  ACCEPTED: 2,
  COMPLETED: 3,
} as const;

const groupInvitesByChallenge = (invites: ChallengeInvite[]): InviteGroup[] => {
  const byChallengeId = new Map<number, ChallengeInvite[]>();
  for (const invite of invites) {
    const list = byChallengeId.get(invite.challengeId) ?? [];
    list.push(invite);
    byChallengeId.set(invite.challengeId, list);
  }

  const groups = Array.from(byChallengeId.entries()).map(
    ([challengeId, list]) => {
      const sorted = [...list].sort((a, b) =>
        (b.regDate ?? '').localeCompare(a.regDate ?? '')
      );
      const first = sorted[0] as ChallengeInvite;
      const representativeStatus = sorted.reduce<ChallengeInvite['status']>(
        (best, cur) =>
          STATUS_PROGRESS[cur.status] > STATUS_PROGRESS[best]
            ? cur.status
            : best,
        first.status
      );

      return {
        challengeId,
        invites: sorted,
        latestDate: first.regDate,
        representativeStatus,
      };
    }
  );

  groups.sort((a, b) => (b.latestDate ?? '').localeCompare(a.latestDate ?? ''));
  return groups;
};

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
 * 도전장 안쪽(개별 대결) 상대 표시. 백엔드가 조회자 기준 상대방 표시 이름
 * (opponentName, R-08)을 내려준다. 아직 상대가 정해지지 않았거나(수락 전)
 * 이름이 비어 있으면(과거 데이터 등) 내부 회원 번호 대신 완곡한 문구로
 * 폴백한다. 어떤 경우에도 "#숫자" 형태를 노출하지 않는다.
 */
const opponentLabel = (invite: ChallengeInvite): string => {
  if (invite.status === 'OPEN' || invite.inviteeId == null) {
    return '상대 대기 중';
  }
  return invite.opponentName ?? '상대 정보 없음';
};

/**
 * 한 행의 주 동작 버튼. 상태에 따라 라벨/동작만 바뀌고, 개수(1개)와 위치는
 * 모든 상태에서 고정한다(2026-08 배치: "수락됨/대기중 UI가 안 맞아 일관성
 * 깨짐" 지적 반영). 링크 복사 등 보조 동작은 공유 다이얼로그 내부로 옮겼다.
 */
const PrimaryAction = ({ invite }: { invite: ChallengeInvite }) => {
  if (invite.status === 'OPEN') {
    // 이미 OPEN 도전장이 있으면 백엔드가 idempotent 하게 같은 shareToken 을
    // 재사용한다. 다시 눌러도 새 레코드가 쌓이지 않는다. 링크 복사는 다이얼로그
    // 안에서 제공된다(2026-08 배치: "보내기 버튼과 링크가 왜 두개" 지적 반영).
    return (
      <ChallengeShareButton
        challengeId={invite.challengeId}
        variant="primary"
        size="xsmall"
        label="링크 다시 보내기"
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

  if (invite.opponentSolvedAt == null) {
    return (
      <Button
        size="xsmall"
        variant="outlined"
        disabled
      >
        결과 기다리는 중
      </Button>
    );
  }

  return (
    // 팝업 대신 전용 결과 페이지로 이동한다(D-10-4). 화면 폭 상관없이 항상
    // 같은 경로 — 좁은 화면에서만 팝업을 유지하는 분기는 두지 않았다.
    // 이유: 팝업은 앱바+사이드바+도전 맥락 띠를 담을 자리가 없어 모바일에서도
    // 결국 전용 페이지가 더 읽기 좋고, 진입 지점이 2곳뿐이라 분기 유지비가
    // 이점보다 크다고 판단했다.
    <Button
      size="xsmall"
      asChild
    >
      <Link href={PRIVATE.FRIENDS.CHALLENGE_RESULT(invite.shareToken)}>
        결과 보기
      </Link>
    </Button>
  );
};

/**
 * 그룹 안쪽(펼쳤을 때) 한 도전장(=한 상대) 행.
 */
const InviteRow = ({ invite }: { invite: ChallengeInvite }) => (
  <div className="border-line-line2 bg-gray-1 rounded-row flex items-center justify-between gap-3 border px-3 py-2.5">
    <div className="flex min-w-0 flex-col">
      <span className="font-caption-heading text-text-main truncate">
        {opponentLabel(invite)}
      </span>
      <span className="font-caption-normal text-text-sub2 truncate">
        {invite.regDate?.slice(0, 10) ?? '날짜 미상'}
      </span>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <StatusBadge
        variant={STATUS_VARIANT[invite.status]}
        label={inviteStatusLabel(invite.status)}
      />
      <PrimaryAction invite={invite} />
    </div>
  </div>
);

/**
 * 문제 하나(=한 그룹) 행. 대결이 1건이면 굳이 접었다 펴는 UI를 두지 않고
 * 바로 상태 배지 + 주 동작 버튼을 노출한다(펼쳐도 안쪽에 같은 내용이 한 줄
 * 더 나오는 게 실익이 없고, "모든 행이 같은 구조" 원칙에도 이 편이 더
 * 부합한다고 판단). 대결이 2건 이상일 때만 펼치기 버튼을 둔다.
 */
const InviteGroupRow = ({
  group,
  expanded,
  onToggle,
}: {
  group: InviteGroup;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const representative =
    group.invites.find((i) => i.challengeTitle) ??
    (group.invites[0] as ChallengeInvite);
  const hasMultiple = group.invites.length > 1;
  const contentId = `challenge-invite-group-${group.challengeId}`;

  return (
    <li className="border-line-line2 rounded-card flex flex-col gap-3 border bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-orange-1 text-key-color-primary flex size-10 shrink-0 items-center justify-center rounded-full">
            <Swords size={18} />
          </span>
          <div className="flex min-w-0 flex-col">
            <Link
              href={PUBLIC.OPEN_CHALLENGE.DETAIL(String(group.challengeId))}
              className="font-body2-heading text-text-main hover:text-key-color-primary truncate"
            >
              {inviteTitle(representative)}
            </Link>
            <span className="font-caption-normal text-text-sub2 truncate">
              {inviteMeta(representative)}
              {hasMultiple ? ` · 대결 ${group.invites.length}건` : ''}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge
            variant={STATUS_VARIANT[group.representativeStatus]}
            label={inviteStatusLabel(group.representativeStatus)}
          />
          {hasMultiple ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={onToggle}
              className="border-line-line2 text-text-sub1 hover:bg-gray-scale-gray-1 rounded-button flex h-10 items-center gap-1 border px-3 text-sm"
            >
              {expanded ? '접기' : '보기'}
              <ChevronDown
                size={16}
                className={
                  expanded
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
                aria-hidden
              />
            </button>
          ) : (
            <PrimaryAction invite={representative} />
          )}
        </div>
      </div>

      {hasMultiple && expanded && (
        <div
          id={contentId}
          className="flex flex-col gap-2 pl-13"
        >
          {group.invites.map((invite) => (
            <InviteRow
              key={invite.id}
              invite={invite}
            />
          ))}
        </div>
      )}
    </li>
  );
};

/* ─────────────────────────────────────────────────────
 * 내 도전 기록. 문제(challengeId) 단위로 묶어 보여주고, 대결이 여럿이면
 * 펼쳐서 상대별 진행 상황을 본다.
 * ────────────────────────────────────────────────────*/
export const MyChallengeInvites = () => {
  const {
    data: invites,
    isLoading,
    isError,
    refetch,
  } = useMyChallengeInvitesQuery();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleGroup = (challengeId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(challengeId)) {
        next.delete(challengeId);
      } else {
        next.add(challengeId);
      }
      return next;
    });
  };

  const groups = invites ? groupInvitesByChallenge(invites) : [];
  const visibleGroups = showAll ? groups : groups.slice(0, 6);

  return (
    <section className="border-gray-3 bg-gray-white rounded-card p-card-pad flex flex-col gap-3 border">
      <h2 className="font-body1-heading text-text-main">내 도전 기록</h2>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-line-line2 bg-gray-1 rounded-card h-16 animate-pulse border"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="border-line-line2 rounded-card flex flex-col items-center gap-3 border bg-white p-8 text-center">
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
          {groups.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {visibleGroups.map((group) => (
                <InviteGroupRow
                  key={group.challengeId}
                  group={group}
                  expanded={expandedIds.has(group.challengeId)}
                  onToggle={() => toggleGroup(group.challengeId)}
                />
              ))}
            </ul>
          ) : (
            <div className="border-line-line2 rounded-card flex flex-col items-center gap-2 border border-dashed bg-white p-8 text-center">
              <p className="font-body2-heading text-text-main">
                아직 보낸 도전장이 없어요
              </p>
              <p className="font-caption-normal text-text-sub2 text-balance">
                문제를 풀고 결과 화면에서 친구에게 도전장을 보내보세요.
              </p>
            </div>
          )}
          {groups.length > 6 && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowAll((current) => !current)}
              className="self-end"
            >
              {showAll ? '최근 6건만 보기' : `전체 ${groups.length}건 보기`}
            </Button>
          )}
        </>
      )}
    </section>
  );
};
