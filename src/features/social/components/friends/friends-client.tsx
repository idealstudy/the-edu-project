'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { type Friendship } from '@/entities/social';
import { useSession } from '@/providers';
import { Button, StatusBadge } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants/route';
import { cn } from '@/shared/lib';
import { ChevronRight, Flame, UserPlus, Users } from 'lucide-react';

import {
  useAcceptFriendMutation,
  useFriendSummaryQuery,
  useFriendTurnSummaryQuery,
  useMyFriendsQuery,
} from '../../hooks';
import { ChallengeShareButton } from '../challenge-invite/challenge-share-button';
import { FriendRequestForm } from './friend-request-form';

/* ─────────────────────────────────────────────────────
 * 친구 목록·요청·수락 화면 클라이언트
 *  - 로딩 / 에러 / 빈 / 콘텐츠 4상태
 *  - 내 회원 ID 기준으로 받은 요청 / 보낸 요청 / 친구를 분류
 * ────────────────────────────────────────────────────*/
type OtherIdentity = {
  memberId: number;
  name: string | null;
  profileImageUrl: string | null;
};

const otherIdentity = (friendship: Friendship, myId: number): OtherIdentity =>
  friendship.requesterId === myId
    ? {
        memberId: friendship.addresseeId,
        name: friendship.addresseeName,
        profileImageUrl: friendship.addresseeProfileImageUrl,
      }
    : {
        memberId: friendship.requesterId,
        name: friendship.requesterName,
        profileImageUrl: friendship.requesterProfileImageUrl,
      };

const LAST_ACTIVITY_LABELS: Partial<
  Record<NonNullable<Friendship['lastActivity']>['type'], string>
> = {
  FRIEND_REQUESTED: '친구 요청이 생겼어요',
  FRIENDSHIP_ACCEPTED: '친구가 됐어요',
  INVITE_SENT: '도전장을 보냈어요',
  INVITE_ACCEPTED: '도전장을 수락했어요',
  VIEWER_SUBMITTED: '내가 풀이를 냈어요',
  OPPONENT_SUBMITTED: '상대가 풀이를 냈어요',
  DUEL_COMPLETED: '대결 결과가 나왔어요',
};

const formatLastActivity = (
  activity: Friendship['lastActivity']
): string | null => {
  if (!activity) return null;
  const activityLabel = LAST_ACTIVITY_LABELS[activity.type];
  if (!activityLabel) return null;

  const occurredAt = new Date(activity.occurredAt);
  const timeLabel = Number.isNaN(occurredAt.getTime())
    ? null
    : new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(occurredAt);

  return timeLabel ? `${activityLabel} · ${timeLabel}` : activityLabel;
};

export const FriendsClient = () => {
  const { member } = useSession();
  const searchParams = useSearchParams();
  const myId = member?.id ?? -1;
  const challengeIdValue = searchParams.get('challengeId');
  const unitNodeIdValue = searchParams.get('unitNodeId');
  const challengeId = challengeIdValue ? Number(challengeIdValue) : null;
  const selectionQuery = new URLSearchParams();
  if (challengeId != null && Number.isFinite(challengeId)) {
    selectionQuery.set('challengeId', String(challengeId));
  }
  if (unitNodeIdValue) selectionQuery.set('unitNodeId', unitNodeIdValue);
  const selectionSuffix = selectionQuery.size > 0 ? `?${selectionQuery}` : '';

  const { data: friends, isLoading, isError, refetch } = useMyFriendsQuery();
  const { data: turnSummary } = useFriendTurnSummaryQuery();
  const { mutate: accept, isPending: isAccepting } = useAcceptFriendMutation();

  const incomingRequests =
    friends?.filter(
      (item) => item.state === 'PENDING' && item.addresseeId === myId
    ) ?? [];
  const outgoingRequests =
    friends?.filter(
      (item) => item.state === 'PENDING' && item.requesterId === myId
    ) ?? [];
  const accepted = friends?.filter((item) => item.state === 'ACCEPTED') ?? [];
  const acceptedMyTurn = accepted.filter((item) => item.myTurn === true);
  const acceptedWaiting = accepted.filter((item) => item.myTurn !== true);

  return (
    <div className="flex flex-col gap-6">
      {turnSummary && turnSummary.myTurnCount > 0 && turnSummary.oldest && (
        <Link
          href={`${PUBLIC.CORE.INVITE.CHALLENGE(turnSummary.oldest.shareToken)}`}
          className="border-orange-7 bg-orange-1 focus-visible:ring-key-color-primary flex items-center gap-3 rounded-r-xl border-l-4 px-4 py-4 focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
            <Flame
              className="text-orange-7"
              size={20}
            />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="text-text-main block text-sm">
              내 차례인 대결 {turnSummary.myTurnCount}건
            </strong>
            <span className="text-text-sub1 block truncate text-xs">
              가장 오래 기다린 것은 {turnSummary.oldest.opponentName}님과의{' '}
              {turnSummary.oldest.challengeTitle}입니다
            </span>
          </span>
          <span className="text-orange-10 hidden shrink-0 text-xs font-bold sm:block">
            지금 풀러 가기
          </span>
          <ChevronRight
            className="text-orange-10"
            size={18}
          />
        </Link>
      )}

      <FriendRequestForm />

      {challengeId != null && Number.isFinite(challengeId) && (
        <div className="border-orange-7 bg-orange-1 rounded-card border px-4 py-3">
          <strong className="text-text-main block text-sm">
            도전장을 보낼 친구를 고르세요
          </strong>
          <span className="text-text-sub1 mt-1 block text-xs">
            친구를 누르면 선택한 문제 맥락을 유지한 채 공유 링크를 만들 수
            있어요.
          </span>
        </div>
      )}

      {isLoading && <FriendsSkeleton />}

      {isError && (
        <div className="border-line-line2 rounded-card flex flex-col items-center gap-3 border bg-white p-10 text-center">
          <p className="font-body2-normal text-text-sub1">
            친구 목록을 불러오지 못했어요.
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
        <section className="flex flex-col gap-3">
          <h2 className="font-body1-heading text-text-main">
            친구{' '}
            <span className="text-key-color-primary tabular-nums">
              {accepted.length}
            </span>
          </h2>

          {/* 시안(§4)은 "친구"와 "요청"을 나눈 목록이 아니라 사람 한 줄기로
              합쳐 보여준다. 서버 myTurn=true인 친구를 목록 맨 위에 두고,
              받은 요청 → 나머지 친구 → 보낸 요청 순으로 이어 붙인다. */}
          {incomingRequests.length === 0 &&
          outgoingRequests.length === 0 &&
          accepted.length === 0 ? (
            <EmptyFriends challengeId={challengeId} />
          ) : (
            <ul className="flex flex-col gap-2">
              {acceptedMyTurn.map((item) => (
                <AcceptedFriendListItem
                  key={`friend-${item.id}`}
                  friendship={item}
                  myId={myId}
                  selectionSuffix={selectionSuffix}
                />
              ))}

              {incomingRequests.map((item) => (
                <li
                  key={`incoming-${item.id}`}
                  className="border-key-color-primary bg-orange-1 rounded-card flex items-center justify-between gap-3 border px-4 py-3"
                >
                  <FriendIdentityLink {...otherIdentity(item, myId)} />
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-orange-10 text-ui-choice font-bold whitespace-nowrap">
                      친구 요청
                    </span>
                    <Button
                      size="xsmall"
                      disabled={isAccepting}
                      onClick={() => accept(item.id)}
                    >
                      수락
                    </Button>
                  </div>
                </li>
              ))}

              {acceptedWaiting.map((item) => (
                <AcceptedFriendListItem
                  key={`friend-${item.id}`}
                  friendship={item}
                  myId={myId}
                  selectionSuffix={selectionSuffix}
                />
              ))}

              {outgoingRequests.map((item) => (
                <li
                  key={`outgoing-${item.id}`}
                  className="border-line-line2 rounded-card flex items-center justify-between gap-3 border bg-white px-4 py-3 opacity-70"
                >
                  <FriendIdentityLink {...otherIdentity(item, myId)} />
                  <StatusBadge
                    variant="default"
                    label="수락 대기"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

const AcceptedFriendListItem = ({
  friendship,
  myId,
  selectionSuffix,
}: {
  friendship: Friendship;
  myId: number;
  selectionSuffix: string;
}) => (
  <li
    className={cn(
      'rounded-card flex items-center justify-between gap-3 border px-4 py-3',
      friendship.myTurn
        ? 'border-orange-7 bg-orange-1'
        : 'border-line-line2 bg-white'
    )}
  >
    <AcceptedFriendRow
      {...otherIdentity(friendship, myId)}
      myTurn={friendship.myTurn}
      lastActivity={friendship.lastActivity}
      selectionSuffix={selectionSuffix}
    />
  </li>
);

const FriendIdentityLink = ({
  memberId,
  name,
  profileImageUrl,
}: OtherIdentity) => (
  <Link
    href={PUBLIC.PROFILE.STUDENT(memberId)}
    aria-label={`${name ?? '이름 미설정 회원'} 프로필 보기`}
    className="focus-visible:ring-key-color-primary flex min-w-0 flex-1 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
  >
    <FriendIdentity
      memberId={memberId}
      name={name}
      profileImageUrl={profileImageUrl}
    />
  </Link>
);

/**
 * 수락된 친구 행.
 *
 * D-11 확정에 따라 행 전체의 주 목적지는 그 친구와의 대결 기록이다.
 * 전적 조회가 실패해도 링크는 보존하고 전적 영역만 재시도 상태로 바꾼다.
 */
const AcceptedFriendRow = ({
  selectionSuffix,
  myTurn,
  lastActivity,
  ...identity
}: OtherIdentity & {
  selectionSuffix: string;
  myTurn: boolean | undefined;
  lastActivity: Friendship['lastActivity'];
}) => {
  // 결함(2026-08-13, QA 관찰): 이전엔 로딩 중과 에러를 같은 문구
  // "대결 기록 불러오는 중"으로 묶어, 조회가 실패해도 영원히 로딩처럼
  // 보였다(record가 계속 undefined). isError를 분리해 실패는 실패로
  // 보여주고 재시도 길을 준다. curl로 백엔드 단독 호출은 200으로 빠르게
  // 응답함을 확인했다(관찰됨). 실패는 개별 요청 실패·네트워크 순간
  // 장애 쪽일 가능성이 높아, 재시도 버튼으로 그 케이스를 흡수한다.
  const {
    data: summary,
    isError,
    isLoading,
    refetch,
  } = useFriendSummaryQuery(identity.memberId);
  const record = summary?.record;
  const displayName = identity.name ?? '이름 미설정 회원';
  const recordLabel = record
    ? `${record.win}승 ${record.lose}패 ${record.draw}무`
    : isLoading
      ? '전적 불러오는 중'
      : isError
        ? '전적을 불러오지 못했어요'
        : '전적 없음';
  const activityLabel = formatLastActivity(lastActivity);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Link
        href={`${PRIVATE.FRIENDS.DETAIL(identity.memberId)}${selectionSuffix}`}
        aria-label={`${displayName}님과의 대결 기록 보기`}
        className="focus-visible:ring-key-color-primary flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
      >
        <FriendIdentity
          {...identity}
          activityLabel={activityLabel}
          mobileRecordLabel={recordLabel}
        />
        <span className="ml-auto hidden shrink-0 text-right sm:block">
          <span
            className={cn(
              'block text-xs font-bold',
              isError ? 'text-system-warning-text' : 'text-text-main'
            )}
          >
            {recordLabel}
          </span>
          {myTurn && (
            <span className="text-orange-10 text-ui-choice font-bold">
              내 차례
            </span>
          )}
        </span>
        <ChevronRight
          className="text-text-sub2 shrink-0"
          size={18}
        />
      </Link>
      {isError && (
        <Button
          variant="outlined"
          size="xsmall"
          className="shrink-0"
          onClick={() => refetch()}
        >
          전적 다시 불러오기
        </Button>
      )}
    </div>
  );
};

const FriendIdentity = ({
  name,
  profileImageUrl,
  activityLabel,
  mobileRecordLabel,
}: OtherIdentity & {
  activityLabel?: string | null;
  mobileRecordLabel?: string;
}) => (
  <div className="flex min-w-0 items-center gap-3">
    {profileImageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, next/image 도메인 미등록
      <img
        src={profileImageUrl}
        alt=""
        className="size-10 shrink-0 rounded-full object-cover"
      />
    ) : (
      <span className="bg-orange-1 text-key-color-primary flex size-10 shrink-0 items-center justify-center rounded-full">
        <Users size={20} />
      </span>
    )}
    <div className="flex min-w-0 flex-col">
      <span className="font-body2-heading text-text-main truncate">
        {name ?? '이름 미설정 회원'}
      </span>
      {activityLabel && (
        <span className="font-caption-normal text-text-sub1 truncate">
          {mobileRecordLabel && (
            <span className="sm:hidden">{mobileRecordLabel} · </span>
          )}
          {activityLabel}
        </span>
      )}
    </div>
  </div>
);

const EmptyFriends = ({ challengeId }: { challengeId: number | null }) => (
  <div className="border-line-line2 rounded-card flex flex-col items-center gap-2 border border-dashed bg-white p-10 text-center">
    <span className="bg-orange-1 text-key-color-primary flex size-12 items-center justify-center rounded-full">
      <UserPlus size={24} />
    </span>
    <p className="font-body2-heading text-text-main">아직 친구가 없어요</p>
    <p className="font-caption-normal text-text-sub2 text-balance">
      방금 푼 문제를 친구에게 보내면 누가 더 잘 푸는지 겨룰 수 있어요. 친구가
      회원이 아니어도 풀 수 있습니다.
    </p>
    {challengeId != null && Number.isFinite(challengeId) ? (
      <ChallengeShareButton
        challengeId={challengeId}
        variant="primary"
        size="large"
        label="이 문제로 도전장 보내기"
      />
    ) : (
      <Button
        variant="primary"
        size="large"
        asChild
      >
        <Link href={PUBLIC.OPEN_CHALLENGE.LIST}>문제 골라 도전장 보내기</Link>
      </Button>
    )}
  </div>
);

const FriendsSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="border-line-line2 rounded-card flex items-center gap-3 border bg-white px-4 py-3"
      >
        <div className="bg-gray-1 size-10 shrink-0 animate-pulse rounded-full" />
        <div className="bg-gray-1 h-4 w-32 animate-pulse rounded" />
      </div>
    ))}
  </div>
);
