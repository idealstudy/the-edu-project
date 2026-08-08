'use client';

import Link from 'next/link';

import { type Friendship } from '@/entities/social';
import { useSession } from '@/providers';
import { Button, StatusBadge } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants/route';
import { ChevronRight, Flame, UserPlus, Users } from 'lucide-react';

import {
  useAcceptFriendMutation,
  useFriendSummaryQuery,
  useFriendTurnSummaryQuery,
  useMyFriendsQuery,
} from '../../hooks';
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

export const FriendsClient = () => {
  const { member } = useSession();
  const myId = member?.id ?? -1;

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

      {isLoading && <FriendsSkeleton />}

      {isError && (
        <div className="border-line-line2 flex flex-col items-center gap-3 rounded-[12px] border bg-white p-10 text-center">
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
        <>
          {/* 받은 요청 */}
          {incomingRequests.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-body1-heading text-text-main">
                받은 요청{' '}
                <span className="text-key-color-primary tabular-nums">
                  {incomingRequests.length}
                </span>
              </h2>
              <ul className="flex flex-col gap-2">
                {incomingRequests.map((item) => (
                  <li
                    key={item.id}
                    className="border-line-line2 flex items-center justify-between gap-3 rounded-[12px] border bg-white px-4 py-3"
                  >
                    <FriendIdentityLink {...otherIdentity(item, myId)} />
                    <Button
                      size="xsmall"
                      disabled={isAccepting}
                      onClick={() => accept(item.id)}
                    >
                      수락
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 보낸 요청 */}
          {outgoingRequests.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-body1-heading text-text-main">보낸 요청</h2>
              <ul className="flex flex-col gap-2">
                {outgoingRequests.map((item) => (
                  <li
                    key={item.id}
                    className="border-line-line2 flex items-center justify-between gap-3 rounded-[12px] border bg-white px-4 py-3"
                  >
                    <FriendIdentityLink {...otherIdentity(item, myId)} />
                    <StatusBadge
                      variant="default"
                      label="수락 대기"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 친구 목록 */}
          <section className="flex flex-col gap-3">
            <h2 className="font-body1-heading text-text-main">
              내 친구{' '}
              <span className="text-key-color-primary tabular-nums">
                {accepted.length}
              </span>
            </h2>
            {accepted.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {accepted.map((item) => (
                  <li
                    key={item.id}
                    className="border-line-line2 flex items-center justify-between gap-3 rounded-[12px] border bg-white px-4 py-3"
                  >
                    <AcceptedFriendRow {...otherIdentity(item, myId)} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyFriends />
            )}
          </section>
        </>
      )}
    </div>
  );
};

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
 * 목적지가 둘이라 링크를 두 개로 나눈다(링크 안에 링크를 넣을 수 없다).
 *  - 이름·사진: 상대 프로필(회장 R-07 요청). 친구가 되기 전에는 요청 행에서
 *    프로필로 갈 수 있는데 친구가 되고 나면 갈 길이 사라졌던 것을 여기서 연다.
 *  - 전적·화살표 영역: 그 친구와의 대결 기록(기존 동선 유지).
 */
const AcceptedFriendRow = (identity: OtherIdentity) => {
  const { data: summary } = useFriendSummaryQuery(identity.memberId);
  const record = summary?.record;
  const displayName = identity.name ?? '이름 미설정 회원';

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Link
        href={PUBLIC.PROFILE.STUDENT(identity.memberId)}
        aria-label={`${displayName} 프로필 보기`}
        className="focus-visible:ring-key-color-primary min-w-0 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
      >
        <FriendIdentity {...identity} />
      </Link>
      <Link
        href={PRIVATE.FRIENDS.DETAIL(identity.memberId)}
        aria-label={`${displayName}님과의 대결 기록 보기`}
        className="focus-visible:ring-key-color-primary ml-auto flex shrink-0 items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
      >
        <span className="hidden shrink-0 text-right sm:block">
          <span className="text-text-main block text-xs font-bold">
            {record
              ? `${record.win}승 ${record.lose}패 ${record.draw}무`
              : '대결 기록 불러오는 중'}
          </span>
          {record && record.myTurn > 0 && (
            <span className="text-orange-10 text-[11px] font-bold">
              내 차례 {record.myTurn}건
            </span>
          )}
        </span>
        <ChevronRight
          className="text-text-sub2 shrink-0"
          size={18}
        />
      </Link>
    </div>
  );
};

const FriendIdentity = ({ name, profileImageUrl }: OtherIdentity) => (
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
    </div>
  </div>
);

const EmptyFriends = () => (
  <div className="border-line-line2 flex flex-col items-center gap-2 rounded-[12px] border border-dashed bg-white p-10 text-center">
    <span className="bg-orange-1 text-key-color-primary flex size-12 items-center justify-center rounded-full">
      <UserPlus size={24} />
    </span>
    <p className="font-body2-heading text-text-main">아직 친구가 없어요</p>
    <p className="font-caption-normal text-text-sub2 text-balance">
      방금 푼 문제를 친구에게 보내면 누가 더 잘 푸는지 겨룰 수 있어요.
    </p>
  </div>
);

const FriendsSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="border-line-line2 flex items-center gap-3 rounded-[12px] border bg-white px-4 py-3"
      >
        <div className="bg-gray-1 size-10 shrink-0 animate-pulse rounded-full" />
        <div className="bg-gray-1 h-4 w-32 animate-pulse rounded" />
      </div>
    ))}
  </div>
);
