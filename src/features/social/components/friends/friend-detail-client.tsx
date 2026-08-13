'use client';

import { type ReactNode, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { type FriendDuels } from '@/entities/social';
import { useRecommendedChallengesQuery } from '@/features/open-challenge/hooks/use-open-challenge';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { Button, showBottomToast } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { cn, withKoreanParticle } from '@/shared/lib';
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
  useRequestFriendMutation,
} from '../../hooks';
import { ChallengeShareButton } from '../challenge-invite/challenge-share-button';

type Duel = FriendDuels['items'][number];

const formatMinute = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const FriendDetailClient = ({ friendId }: { friendId: number }) => {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const challengeId = challengeIdParam ? Number(challengeIdParam) : null;
  const summary = useFriendSummaryQuery(friendId);
  const isFriend =
    summary.data?.relation === 'FRIEND' ||
    summary.data?.relation === 'FRIEND_NO_DUEL';
  const duels = useFriendDuelsQuery(friendId, undefined, { enabled: isFriend });
  const mastery = useFriendMasteryQuery(friendId, { enabled: isFriend });
  const myTree = useMyTreeQuery();
  const requestFriend = useRequestFriendMutation();

  if (summary.isLoading) return <DetailSkeleton />;
  if (summary.isError || !summary.data) {
    return <DetailError onRetry={() => summary.refetch()} />;
  }

  const friend = summary.data;
  const isStranger = friend.relation === 'NOT_FRIEND';

  return (
    <main className="bg-system-background min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-3">
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
          {isStranger ? (
            <Button
              size="small"
              disabled={requestFriend.isPending || requestFriend.isSuccess}
              onClick={() => requestFriend.mutate({ addresseeId: friendId })}
            >
              {requestFriend.isSuccess ? '친구 요청 보냄' : '친구 요청 보내기'}
            </Button>
          ) : challengeId != null && Number.isFinite(challengeId) ? (
            <ChallengeShareButton
              challengeId={challengeId}
              variant="primary"
              size="small"
              label="이 문제로 도전장 보내기"
            />
          ) : (
            <Button
              size="small"
              asChild
            >
              <Link href={PUBLIC.OPEN_CHALLENGE.LIST}>
                문제 골라 도전장 보내기
              </Link>
            </Button>
          )}
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
              onRetry={() => duels.refetch()}
            />
            <ConquestMap
              friendName={friend.displayName}
              friendUnits={mastery.data?.units ?? []}
              myNodes={
                myTree.data?.groups.flatMap((group) => group.nodes) ?? []
              }
              isLoading={mastery.isLoading || myTree.isLoading}
              friendError={mastery.isError}
              myTreeError={myTree.isError}
              onRetryFriend={() => mastery.refetch()}
              onRetryMine={() => myTree.refetch()}
            />
          </>
        )}
      </div>
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
      [`${withKoreanParticle(name, '이/가')} 이김`, record.lose],
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
        <span className="text-text-sub2 text-ui-choice sm:text-xs">
          {label}
        </span>
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
  onRetry,
}: {
  friendName: string;
  items: Duel[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) => {
  const [hiddenTokens, setHiddenTokens] = useState<Set<string>>(new Set());
  const visibleItems = items.filter(
    (item) => !hiddenTokens.has(item.shareToken)
  );

  const hideDuel = (shareToken: string) => {
    setHiddenTokens((current) => new Set(current).add(shareToken));
    showBottomToast('이 기기 목록에서 대결을 숨겼어요.');
  };

  return (
    <section className="border-line-line1 rounded-xl border bg-white p-5">
      <h2 className="font-body1-heading text-text-main mb-3">
        {withKoreanParticle(`${friendName}님`, '와/과')} 한 대결
      </h2>
      {isLoading && <div className="bg-gray-1 h-28 animate-pulse rounded-lg" />}
      {isError && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-text-sub1 text-sm">
            대결 기록을 불러오지 못했어요.
          </p>
          <Button
            variant="outlined"
            size="small"
            onClick={onRetry}
          >
            대결 기록 다시 시도
          </Button>
        </div>
      )}
      {!isLoading && !isError && visibleItems.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-text-main font-bold">
            {withKoreanParticle(`${friendName}님`, '와/과')}는 아직 붙어본 적이
            없어요
          </p>
          <p className="text-text-sub1 mt-1 text-sm">
            둘 다 정복 중인 단원에서 첫 문제를 보내보세요.
          </p>
        </div>
      )}
      <div className="divide-line-line1 divide-y">
        {visibleItems.map((duel) => (
          <DuelRow
            key={duel.shareToken}
            duel={duel}
            onHide={() => hideDuel(duel.shareToken)}
          />
        ))}
      </div>
    </section>
  );
};

const DuelRow = ({ duel, onHide }: { duel: Duel; onHide: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // "결과 보기"도 팝업이 아니라 전용 결과 페이지로 이동한다(D-10-4).
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
          : {
              label: '결과 보기',
              href: PRIVATE.FRIENDS.CHALLENGE_RESULT(duel.shareToken),
              disabled: false,
            };

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
        >
          {action.label}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="xsmall"
        aria-label="대결 메뉴 열기"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        className="hover:bg-gray-1 flex size-9 items-center justify-center rounded-lg"
      >
        <MoreHorizontal size={18} />
      </Button>
      {menuOpen && (
        <DuelMenu
          duel={duel}
          onHide={onHide}
        />
      )}
    </div>
  );
};

const DuelMenu = ({ duel, onHide }: { duel: Duel; onHide: () => void }) => {
  const canViewResult = duel.viewerCompleted && duel.opponentSolvedAt !== null;
  const canNotify =
    duel.status !== 'COMPLETED' &&
    duel.viewerCompleted &&
    duel.opponentSolvedAt == null;
  const canRequestCancellation = duel.status === 'OPEN';
  const inviteUrl = `${typeof window === 'undefined' ? '' : window.location.origin}${PUBLIC.CORE.INVITE.CHALLENGE(duel.shareToken)}`;

  const shareReminder = async () => {
    if (!canNotify) return;
    if (typeof navigator.share === 'function') {
      await navigator.share({
        title: '도전장을 다시 보냈어요',
        text: `${duel.challengeTitle}, 네 차례야.`,
        url: inviteUrl,
      });
      return;
    }
    await navigator.clipboard.writeText(inviteUrl);
    showBottomToast('상대에게 다시 보낼 링크를 복사했어요.');
  };

  return (
    <div className="border-line-line1 shadow-popover absolute top-14 right-0 z-20 w-56 rounded-xl border bg-white p-2">
      <Button
        type="button"
        variant="ghost"
        size="xsmall"
        onClick={() =>
          navigator.clipboard.writeText(
            `${window.location.origin}${PUBLIC.CORE.INVITE.CHALLENGE(duel.shareToken)}`
          )
        }
        className="w-full justify-start"
      >
        도전장 링크 복사하기
      </Button>
      {canViewResult ? (
        <Link
          href={PRIVATE.FRIENDS.CHALLENGE_RESULT(duel.shareToken)}
          className="hover:bg-gray-1 text-text-main block rounded-lg px-3 py-2 text-xs"
        >
          이 대결 자세히
        </Link>
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
      <Button
        type="button"
        variant="ghost"
        size="xsmall"
        disabled={!canNotify}
        onClick={shareReminder}
        className={cn(
          'w-full justify-start',
          !canNotify && 'text-text-inactive'
        )}
      >
        상대에게 링크 다시 보내기{canNotify ? '' : ' (상대 차례에 가능)'}
      </Button>
      {canRequestCancellation ? (
        <a
          href={`mailto:the.edu.devs@gmail.com?subject=${encodeURIComponent('도전장 취소 요청')}&body=${encodeURIComponent(`도전장 ${duel.shareToken} 취소를 요청합니다.`)}`}
          className="hover:bg-gray-1 text-text-main block rounded-lg px-3 py-2 text-xs"
        >
          보낸 도전장 취소 요청하기
        </a>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="xsmall"
          disabled
          className="text-text-inactive w-full justify-start"
        >
          보낸 도전장 취소 요청하기 (수락 전만 가능)
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="xsmall"
        onClick={onHide}
        className="w-full justify-start"
      >
        목록에서 숨기기
      </Button>
      <a
        href={`mailto:the.edu.devs@gmail.com?subject=${encodeURIComponent('도전장 신고')}&body=${encodeURIComponent(`신고할 도전장: ${duel.shareToken}`)}`}
        className="text-system-warning-text hover:bg-gray-1 block rounded-lg px-3 py-2 text-xs"
      >
        신고하기
      </a>
    </div>
  );
};

const ConquestMap = ({
  friendName,
  friendUnits,
  myNodes,
  isLoading,
  friendError,
  myTreeError,
  onRetryFriend,
  onRetryMine,
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
  friendError: boolean;
  myTreeError: boolean;
  onRetryFriend: () => void;
  onRetryMine: () => void;
}) => {
  const myScores = new Map(
    myNodes.map((node) => [Number(node.nodeId), node.masteryScore])
  );
  const inProgress = (score: number) => score > 0 && score < 80;
  const orderFor = (myScore: number, friendScore: number) => {
    if (inProgress(myScore) && inProgress(friendScore)) return 0;
    if (inProgress(myScore)) return 1;
    if (inProgress(friendScore)) return 2;
    if (myScore >= 80 && friendScore >= 80) return 3;
    return 4;
  };
  const sorted = [...friendUnits].sort(
    (a, b) =>
      orderFor(myScores.get(a.nodeId) ?? 0, a.masteryScore) -
      orderFor(myScores.get(b.nodeId) ?? 0, b.masteryScore)
  );

  return (
    <section className="border-line-line1 rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-body1-heading text-text-main">정복 지도</h2>
        <span className="text-text-sub2 text-xs">
          둘 다 정복 중인 단원부터 · 서로 친구일 때만 보여요
        </span>
      </div>
      {friendError || myTreeError ? (
        <div className="flex flex-col gap-3">
          {friendError && (
            <ConquestError
              message={`${friendName}님의 정복 지도를 불러오지 못했어요.`}
              action="친구 지도 다시 시도"
              onRetry={onRetryFriend}
            />
          )}
          {myTreeError && (
            <ConquestError
              message="내 정복 지도를 불러오지 못했어요."
              action="내 지도 다시 시도"
              onRetry={onRetryMine}
            />
          )}
        </div>
      ) : isLoading ? (
        <div className="bg-gray-1 h-32 animate-pulse rounded-lg" />
      ) : sorted.length === 0 ? (
        <p className="text-text-sub1 py-8 text-center text-sm">
          {withKoreanParticle(`${friendName}님`, '은/는')} 아직 푼 문제가
          적어요. 비어 있는 것은 못한다는 뜻이 아니라 아직 안 갔다는 뜻이에요.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {sorted.map((unit) => {
            const myScore = myScores.get(unit.nodeId) ?? 0;
            const bothInProgress =
              inProgress(myScore) && inProgress(unit.masteryScore);
            return (
              <div key={unit.nodeId}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-text-main text-sm font-bold">
                    {unit.subjectName} · {unit.displayName}
                  </p>
                  {bothInProgress && (
                    <span className="bg-orange-1 text-orange-10 rounded-full px-2 py-1 text-xs font-bold">
                      둘 다 정복 중
                    </span>
                  )}
                </div>
                <MasteryBar
                  name="나"
                  score={myScore}
                />
                <MasteryBar
                  name={friendName}
                  score={unit.masteryScore}
                  opponent
                />
                {bothInProgress && (
                  <UnitChallengeInviteButton
                    unitNodeId={unit.nodeId}
                    unitName={unit.displayName}
                  />
                )}
              </div>
            );
          })}
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
    <progress
      value={score}
      max={100}
      aria-label={`${name} 정복도 ${score}%`}
      className={cn(
        'bg-gray-1 h-2 w-full overflow-hidden rounded-full',
        opponent
          ? score >= 80
            ? 'accent-gray-10'
            : 'accent-gray-8'
          : score >= 80
            ? 'accent-system-success-text'
            : 'accent-orange-7'
      )}
    />
    <span className="text-text-sub2 text-right tabular-nums">
      {score >= 80 ? '정복 완료' : score > 0 ? '정복 중' : '아직 안 간 곳'}{' '}
      {score}%
    </span>
  </div>
);

const UnitChallengeInviteButton = ({
  unitNodeId,
  unitName,
}: {
  unitNodeId: number;
  unitName: string;
}) => {
  const recommendation = useRecommendedChallengesQuery(
    { unitNodeId, size: 1 },
    { enabled: true }
  );
  const challenge = recommendation.data?.[0];

  if (recommendation.isLoading) {
    return (
      <p className="text-text-sub2 mt-2 text-xs">
        보낼 문제를 고르는 중이에요.
      </p>
    );
  }
  if (recommendation.isError || !challenge) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <span className="text-system-warning-text text-xs">
          보낼 문제를 고르지 못했어요.
        </span>
        <Button
          variant="outlined"
          size="xsmall"
          onClick={() => recommendation.refetch()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <ChallengeShareButton
      challengeId={Number(challenge.id)}
      variant="outlined"
      size="xsmall"
      className="mt-2"
      label={`${unitName}로 도전장 보내기`}
    />
  );
};

const ConquestError = ({
  message,
  action,
  onRetry,
}: {
  message: string;
  action: string;
  onRetry: () => void;
}) => (
  <div className="border-system-warning bg-system-warning-alt rounded-card flex flex-col items-center gap-3 border px-4 py-6 text-center">
    <p className="text-system-warning-text text-sm">{message}</p>
    <Button
      variant="outlined"
      size="small"
      onClick={onRetry}
    >
      {action}
    </Button>
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
  <div className="mx-auto flex max-w-240 flex-col gap-3 px-4 py-8">
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
