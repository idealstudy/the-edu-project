'use client';

import Link from 'next/link';

import { type Friendship } from '@/entities/social';
import { useSession } from '@/providers';
import { Button, StatusBadge } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants/route';
import { UserPlus, Users } from 'lucide-react';

import { useAcceptFriendMutation, useMyFriendsQuery } from '../../hooks';
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
                    <FriendIdentityLink {...otherIdentity(item, myId)} />
                    <StatusBadge
                      variant="success"
                      label="친구"
                    />
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
      회원 번호로 친구를 추가하고 도전장을 주고받아 보세요.
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
