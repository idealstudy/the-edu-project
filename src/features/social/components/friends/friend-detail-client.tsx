'use client';

import { type ReactNode, useState } from 'react';

import Link from 'next/link';

import { type FriendDuels } from '@/entities/social';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { Button } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import {
  ArrowLeft,
  Flag,
  MoreHorizontal,
  ShieldCheck,
  Swords,
  Trophy,
  UserPlus,
} from 'lucide-react';

import {
  useFriendDuelsQuery,
  useFriendMasteryQuery,
  useFriendSummaryQuery,
} from '../../hooks';
import { ChallengeResultDialog } from '../challenge-invite/challenge-result-dialog';

type Duel = FriendDuels['items'][number];

const formatMinute = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const FriendDetailClient = ({ friendId }: { friendId: number }) => {
  const summary = useFriendSummaryQuery(friendId);
  const isFriend = summary.data?.relation !== 'NOT_FRIEND';
  const duels = useFriendDuelsQuery(friendId, undefined, { enabled: isFriend });
  const mastery = useFriendMasteryQuery(friendId, { enabled: isFriend });
  const myTree = useMyTreeQuery();
  const [resultToken, setResultToken] = useState<string | null>(null);

  if (summary.isLoading) return <DetailSkeleton />;
  if (summary.isError || !summary.data) {
    return <DetailError onRetry={() => summary.refetch()} />;
  }

  const friend = summary.data;
  const isStranger = friend.relation === 'NOT_FRIEND';

  return (
    <main className="bg-system-background min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-3">
        <Link
          href={PRIVATE.FRIENDS.INDEX}
          className="text-text-sub1 hover:text-text-main inline-flex w-fit items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft size={16} /> 친구 목록
        </Link>

        <section className="border-line-line1 flex flex-wrap items-center gap-4 rounded-xl border bg-white p-5">
          <span className="bg-orange-1 text-orange-10 flex size-12 items-center justify-center rounded-full text-lg font-extrabold">
            {friend.displayName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-headline1-heading text-text-main truncate">
              {friend.displayName}
            </h1>
            <p className="text-text-sub1 text-sm">
              {isStranger ? '아직 친구가 아니에요' : '친구와의 대결 기록'}
              {friend.brag
                ? ` · ${friend.brag.streakDays}일 연속 · Lv.${friend.brag.level}`
                : ''}
            </p>
          </div>
          <Button
            size="small"
            asChild
          >
            <Link href={PUBLIC.OPEN_CHALLENGE.LIST}>
              {isStranger ? '친구 요청 보내기' : '도전장 보내기'}
            </Link>
          </Button>
        </section>

        {isStranger ? (
          <LockedFriendDetail name={friend.displayName} />
        ) : (
          <>
            {friend.record && (
              <RecordBar
                name={friend.displayName}
                record={friend.record}
              />
            )}
            {friend.brag && <BragBar brag={friend.brag} />}
            <DuelHistory
              friendName={friend.displayName}
              items={duels.data?.items ?? []}
              isLoading={duels.isLoading}
              isError={duels.isError}
              onResult={setResultToken}
            />
            {!mastery.isError && (
              <ConquestMap
                friendName={friend.displayName}
                friendUnits={mastery.data?.units ?? []}
                myNodes={
                  myTree.data?.groups.flatMap((group) => group.nodes) ?? []
                }
                isLoading={mastery.isLoading || myTree.isLoading}
              />
            )}
          </>
        )}
      </div>

      {resultToken && (
        <ChallengeResultDialog
          token={resultToken}
          isOpen
          onOpenChange={(open) => !open && setResultToken(null)}
        />
      )}
    </main>
  );
};

const RecordBar = ({
  name,
  record,
}: {
  name: string;
  record: { win: number; lose: number; draw: number; myTurn: number };
}) => (
  <section className="border-line-line1 grid grid-cols-4 overflow-hidden rounded-xl border bg-white">
    {[
      ['내가 이김', record.win],
      [`${name}이 이김`, record.lose],
      ['비김', record.draw],
      ['내 차례', record.myTurn],
    ].map(([label, value], index) => (
      <div
        key={String(label)}
        className={cn(
          'flex min-w-0 flex-col items-center gap-1 px-2 py-4 text-center',
          index > 0 && 'border-line-line1 border-l'
        )}
      >
        <strong className="text-text-main text-xl tabular-nums">{value}</strong>
        <span className="text-text-sub2 text-[11px] sm:text-xs">{label}</span>
      </div>
    ))}
  </section>
);

const BragBar = ({
  brag,
}: {
  brag: {
    conqueredUnitCount: number;
    badgeCount: number;
    streakDays: number;
    level: number;
    solvedCount: number;
  };
}) => (
  <section className="border-line-line1 flex flex-wrap items-center gap-2 rounded-xl border bg-white px-4 py-3">
    <span className="text-text-sub1 text-xs font-bold">자랑거리</span>
    <BragChip
      icon={<Trophy size={13} />}
      text={`정복한 단원 ${brag.conqueredUnitCount}`}
    />
    <BragChip
      icon={<ShieldCheck size={13} />}
      text={`뱃지 ${brag.badgeCount}개`}
    />
    <BragChip
      icon={<Flag size={13} />}
      text={`${brag.solvedCount}문제 풀이`}
    />
  </section>
);

const DuelHistory = ({
  friendName,
  items,
  isLoading,
  isError,
  onResult,
}: {
  friendName: string;
  items: Duel[];
  isLoading: boolean;
  isError: boolean;
  onResult: (token: string) => void;
}) => (
  <section className="border-line-line1 rounded-xl border bg-white p-5">
    <h2 className="font-body1-heading text-text-main mb-3">
      {friendName}님과 한 대결
    </h2>
    {isLoading && <div className="bg-gray-1 h-28 animate-pulse rounded-lg" />}
    {isError && (
      <p className="text-text-sub1 py-8 text-center text-sm">
        대결 기록을 불러오지 못했어요.
      </p>
    )}
    {!isLoading && !isError && items.length === 0 && (
      <div className="py-8 text-center">
        <p className="text-text-main font-bold">
          {friendName}님과는 아직 붙어본 적이 없어요
        </p>
        <p className="text-text-sub1 mt-1 text-sm">
          둘 다 정복 중인 단원에서 첫 문제를 보내보세요.
        </p>
      </div>
    )}
    <div className="divide-line-line1 divide-y">
      {items.map((duel) => (
        <DuelRow
          key={duel.shareToken}
          duel={duel}
          onResult={onResult}
        />
      ))}
    </div>
  </section>
);

const DuelRow = ({
  duel,
  onResult,
}: {
  duel: Duel;
  onResult: (token: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const action =
    duel.status === 'OPEN'
      ? {
          label: '링크 다시 보내기',
          href: PUBLIC.CORE.INVITE.CHALLENGE(duel.shareToken),
          disabled: false,
        }
      : !duel.viewerCompleted
        ? {
            label: '먼저 풀기',
            href: `${PUBLIC.OPEN_CHALLENGE.DETAIL(duel.challengeId)}?inviteToken=${duel.shareToken}`,
            disabled: false,
          }
        : duel.opponentSolvedAt == null
          ? { label: '결과 기다리는 중', href: '', disabled: true }
          : { label: '결과 보기', href: '', disabled: false };

  return (
    <div className="relative flex items-center gap-3 py-4">
      <span className="bg-gray-1 text-text-main flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {duel.outcome === 'WIN' ? (
          '승'
        ) : duel.outcome === 'LOSE' ? (
          '패'
        ) : duel.outcome ? (
          '무'
        ) : (
          <Swords size={15} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-text-main truncate text-sm font-bold">
          {duel.challengeTitle}
        </p>
        <p className="text-text-sub2 truncate text-xs">
          {formatMinute(duel.sentAt)}에 보냄
          {duel.opponentSolvedAt
            ? ` · 상대는 ${formatMinute(duel.opponentSolvedAt)}에 제출`
            : ''}
        </p>
      </div>
      {action.href ? (
        <Button
          asChild
          size="xsmall"
          variant="outlined"
        >
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : (
        <Button
          size="xsmall"
          variant="outlined"
          disabled={action.disabled}
          onClick={() => !action.disabled && onResult(duel.shareToken)}
        >
          {action.label}
        </Button>
      )}
      <button
        type="button"
        aria-label="대결 메뉴 열기"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        className="hover:bg-gray-1 flex size-9 items-center justify-center rounded-lg"
      >
        <MoreHorizontal size={18} />
      </button>
      {menuOpen && (
        <DuelMenu
          duel={duel}
          onResult={onResult}
        />
      )}
    </div>
  );
};

const DuelMenu = ({
  duel,
  onResult,
}: {
  duel: Duel;
  onResult: (token: string) => void;
}) => {
  const canViewResult = duel.viewerCompleted && duel.opponentSolvedAt !== null;
  const disabledItems = [
    '상대에게 알림 보내기',
    '보낸 도전장 취소하기',
    '목록에서 숨기기',
    '신고하기',
  ];
  return (
    <div className="border-line-line1 absolute top-14 right-0 z-20 w-56 rounded-xl border bg-white p-2 shadow-lg">
      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(
            `${window.location.origin}${PUBLIC.CORE.INVITE.CHALLENGE(duel.shareToken)}`
          )
        }
        className="hover:bg-gray-1 text-text-main block w-full rounded-lg px-3 py-2 text-left text-xs"
      >
        도전장 링크 복사하기
      </button>
      {canViewResult ? (
        <button
          type="button"
          onClick={() => onResult(duel.shareToken)}
          className="hover:bg-gray-1 text-text-main block w-full rounded-lg px-3 py-2 text-left text-xs"
        >
          이 대결 자세히
        </button>
      ) : (
        <Link
          href={PUBLIC.CORE.INVITE.CHALLENGE(duel.shareToken)}
          className="hover:bg-gray-1 text-text-main block rounded-lg px-3 py-2 text-xs"
        >
          이 대결 자세히
        </Link>
      )}
      <Link
        href={PUBLIC.OPEN_CHALLENGE.DETAIL(duel.challengeId)}
        className="hover:bg-gray-1 text-text-main block rounded-lg px-3 py-2 text-xs"
      >
        이 문제 혼자 다시 풀기
      </Link>
      {disabledItems.map((label) => (
        <button
          key={label}
          type="button"
          disabled
          className="text-text-inactive block w-full rounded-lg px-3 py-2 text-left text-xs"
        >
          {label} (지금은 안 됨)
        </button>
      ))}
    </div>
  );
};

const ConquestMap = ({
  friendName,
  friendUnits,
  myNodes,
  isLoading,
}: {
  friendName: string;
  friendUnits: Array<{
    nodeId: number;
    displayName: string;
    subjectName: string;
    masteryScore: number;
  }>;
  myNodes: Array<{ nodeId: string; masteryScore: number }>;
  isLoading: boolean;
}) => {
  const myScores = new Map(
    myNodes.map((node) => [Number(node.nodeId), node.masteryScore])
  );
  const sorted = [...friendUnits].sort((a, b) => {
    const aMe = myScores.get(a.nodeId) ?? 0;
    const bMe = myScores.get(b.nodeId) ?? 0;
    return Math.abs(a.masteryScore - aMe) - Math.abs(b.masteryScore - bMe);
  });

  return (
    <section className="border-line-line1 rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-body1-heading text-text-main">정복 지도</h2>
        <span className="text-text-sub2 text-xs">
          따라잡기 가까운 순 · 서로 친구일 때만 보여요
        </span>
      </div>
      {isLoading ? (
        <div className="bg-gray-1 h-32 animate-pulse rounded-lg" />
      ) : sorted.length === 0 ? (
        <p className="text-text-sub1 py-8 text-center text-sm">
          {friendName}님은 아직 푼 문제가 적어요. 비어 있는 것은 못한다는 뜻이
          아니라 아직 안 갔다는 뜻이에요.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {sorted.map((unit) => (
            <div key={unit.nodeId}>
              <p className="text-text-main mb-2 text-sm font-bold">
                {unit.subjectName} · {unit.displayName}
              </p>
              <MasteryBar
                name="나"
                score={myScores.get(unit.nodeId) ?? 0}
              />
              <MasteryBar
                name={friendName}
                score={unit.masteryScore}
                opponent
              />
            </div>
          ))}
        </div>
      )}
      <p className="bg-gray-1 text-text-sub1 mt-5 rounded-lg px-3 py-2 text-xs">
        틀린 문제 목록과 포인트, 학교와 학년은 서로 보이지 않습니다.
      </p>
    </section>
  );
};

const MasteryBar = ({
  name,
  score,
  opponent = false,
}: {
  name: string;
  score: number;
  opponent?: boolean;
}) => (
  <div className="mb-1 grid grid-cols-[72px_1fr_94px] items-center gap-2 text-xs">
    <span className="text-text-sub1 truncate">{name}</span>
    <span className="bg-gray-1 h-2 overflow-hidden rounded-full">
      <i
        className={cn(
          'block h-full rounded-full',
          score >= 80
            ? 'bg-system-success'
            : opponent
              ? 'bg-orange-3'
              : 'bg-orange-7'
        )}
        style={{ width: `${Math.max(score, 2)}%` }}
      />
    </span>
    <span className="text-text-sub2 text-right tabular-nums">
      {score >= 80 ? '정복 완료' : score > 0 ? '정복 중' : '아직 안 간 곳'}{' '}
      {score}%
    </span>
  </div>
);

const BragChip = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <span className="border-line-line2 text-text-main inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
    {icon}
    {text}
  </span>
);

const LockedFriendDetail = ({ name }: { name: string }) => (
  <section className="border-line-line1 flex flex-col items-center rounded-xl border bg-white px-6 py-12 text-center">
    <UserPlus
      className="text-orange-7"
      size={28}
    />
    <h2 className="text-text-main mt-3 font-bold">
      대결 기록은 친구가 되면 열려요
    </h2>
    <p className="text-text-sub1 mt-1 max-w-md text-sm">
      서로 수락한 사이에서만 주고받은 대결과 정복 지도를 봅니다. {name}님에게
      친구 요청을 보내보세요.
    </p>
  </section>
);

const DetailSkeleton = () => (
  <div className="mx-auto flex max-w-[960px] flex-col gap-3 px-4 py-8">
    <div className="bg-gray-1 h-28 animate-pulse rounded-xl" />
    <div className="bg-gray-1 h-64 animate-pulse rounded-xl" />
  </div>
);

const DetailError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
    <p className="text-text-main font-bold">친구 기록을 불러오지 못했어요.</p>
    <Button
      variant="outlined"
      onClick={onRetry}
    >
      다시 시도
    </Button>
  </div>
);
