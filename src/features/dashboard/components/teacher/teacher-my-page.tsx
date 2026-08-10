'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { TeacherDashboardHeader } from '@/features/dashboard/components/header/teacher-header';
import { useTeacherDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-teacher-dashboard-query';
import { useInvitationQuery } from '@/features/study-rooms/hooks/use-invitation-query';
import { useToggleInvitation } from '@/features/study-rooms/hooks/use-toggle-invitation';
import { PageLayout } from '@/layout';
import { showBottomToast } from '@/shared/components/ui/bottom-toast';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { PRIVATE } from '@/shared/constants';

/**
 * 승인 디자인 v22 `tMyOk` 3706~3709 `학생 초대 코드` 카드 + `코드 복사`·`링크로 보내기`.
 *
 * v22 는 선생님 1인당 코드 한 개를 그리지만, 서버의 초대 계약은 스터디룸마다
 * 초대 링크를 발행하는 구조다(`GET/PUT /api/teacher/study-rooms/{id}/invitation`).
 * 학생이 실제로 들어오는 경로(`/invite?token=...`)도 그 계약 위에 이미 서 있다.
 * 그래서 코드는 수업을 고른 뒤 그 수업의 초대 토큰으로 발행한다.
 * 두 버튼은 모두 진짜 동작한다: 복사는 클립보드, 보내기는 공유 시트(없으면 클립보드).
 */
const TeacherInviteCodeCard = () => {
  const rooms = useTeacherDashboardStudyRoomListQuery();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const roomList = rooms.data ?? [];
  const activeRoomId = selectedRoomId ?? roomList[0]?.id ?? null;

  useEffect(() => {
    const firstRoom = roomList[0];
    if (selectedRoomId === null && firstRoom) {
      setSelectedRoomId(firstRoom.id);
    }
  }, [roomList, selectedRoomId]);

  const invitation = useInvitationQuery(activeRoomId ?? 0, {
    enabled: activeRoomId !== null,
  });
  const toggleInvitation = useToggleInvitation(activeRoomId ?? 0);

  const token = invitation.data?.enabled ? invitation.data.token : null;
  const inviteLink = token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invite?token=${token}`
    : null;

  const copyCode = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    showBottomToast('초대 코드를 복사했어요. 학생에게 전달해 주세요');
  };

  const shareLink = async () => {
    if (!inviteLink) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: '디에듀 학생 초대', url: inviteLink });
        return;
      } catch {
        // 공유 시트를 닫은 경우까지 오류로 다루지 않고 복사로 넘어간다.
      }
    }
    await navigator.clipboard.writeText(inviteLink);
    showBottomToast('초대 링크를 복사했어요. 메시지로 보내면 됩니다');
  };

  return (
    <section
      className="border-gray-3 rounded-xl border bg-white p-5"
      data-testid="teacher-invite-code-card"
    >
      <div className="mb-3">
        <h2 className="font-extrabold">학생 초대 코드</h2>
        <p className="text-gray-8 text-xs">
          학생이 이 코드를 넣으면 고른 수업에 바로 들어옵니다
        </p>
      </div>

      {roomList.length > 1 && (
        <label className="text-gray-8 mb-3 block text-xs font-bold">
          코드를 발행할 수업
          <select
            value={activeRoomId ?? ''}
            onChange={(event) => setSelectedRoomId(Number(event.target.value))}
            data-testid="teacher-invite-code-room"
            className="border-gray-3 text-gray-12 mt-1 min-h-11 w-full rounded-lg border px-3 text-sm font-bold"
          >
            {roomList.map((room) => (
              <option
                key={room.id}
                value={room.id}
              >
                {room.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {roomList.length === 0 ? (
        <>
          <div className="border-orange-4 text-orange-11 rounded-lg border border-dashed p-4 text-center text-xs font-bold">
            수업이 아직 없어서 코드를 만들 수 없습니다
          </div>
          <Link
            href={PRIVATE.DASHBOARD.TEACHER}
            className="mt-3 block rounded-md border py-2 text-center text-xs font-bold"
          >
            수업 만들러 가기
          </Link>
        </>
      ) : (
        <>
          <div
            className="border-orange-4 text-orange-11 rounded-lg border border-dashed p-4 text-center text-sm font-extrabold tracking-widest break-all"
            data-testid="teacher-invite-code-value"
          >
            {invitation.isPending
              ? '코드를 불러오는 중입니다'
              : (token ?? '이 수업의 초대 코드가 꺼져 있습니다')}
          </div>
          <div className="mt-3 flex gap-2">
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              onClick={copyCode}
              disabled={!token}
              data-testid="teacher-invite-code-copy"
              className="min-h-11 flex-1 cursor-pointer rounded-md border text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              코드 복사
            </UnstyledButton>
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              onClick={shareLink}
              disabled={!inviteLink}
              data-testid="teacher-invite-code-share"
              className="min-h-11 flex-1 cursor-pointer rounded-md border text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              링크로 보내기
            </UnstyledButton>
          </div>
          <p className="text-gray-8 mt-2 text-[11px]">
            학생은 초대 코드 넣기 화면(/invite)에 이 코드를 붙여넣거나, 보낸
            링크를 눌러 들어옵니다.
          </p>
          {!token && !invitation.isPending && (
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              onClick={() => toggleInvitation.mutate(true)}
              disabled={toggleInvitation.isPending}
              data-testid="teacher-invite-code-enable"
              className="border-orange-4 text-orange-11 mt-2 min-h-11 w-full cursor-pointer rounded-md border text-xs font-bold"
            >
              {toggleInvitation.isPending ? '켜는 중' : '초대 코드 켜기'}
            </UnstyledButton>
          )}
        </>
      )}
    </section>
  );
};

export const TeacherMyPage = ({ memberName }: { memberName: string }) => (
  <div className="bg-gray-1 min-h-screen w-full">
    <TeacherDashboardHeader initialMemberName={memberName} />
    <PageLayout
      className="gap-block-gap lg:grid-split-legacy grid items-start"
      data-testid="teacher-my-page"
    >
      <h1 className="col-span-full text-[19px] font-extrabold">마이페이지</h1>
      <div className="space-y-4">
        <section className="border-gray-3 rounded-xl border bg-white p-5">
          <div className="mb-4 flex items-center">
            <h2 className="font-extrabold">내 정보</h2>
            <Link
              href={`${PRIVATE.MYPAGE}?tab=profile`}
              className="ml-auto rounded-md border px-2 py-1 text-xs font-bold"
            >
              수정
            </Link>
          </div>
          <dl className="grid grid-cols-[80px_1fr] gap-y-3 text-sm">
            <dt className="text-gray-8">이름</dt>
            <dd className="font-bold">{memberName}</dd>
            <dt className="text-gray-8">과목</dt>
            <dd className="font-bold">수학</dd>
            <dt className="text-gray-8">대상</dt>
            <dd className="font-bold">중3 ~ 고3</dd>
          </dl>
        </section>
        <TeacherInviteCodeCard />
      </div>
      <div className="space-y-4">
        <section className="border-gray-3 rounded-xl border bg-white p-5">
          <div className="mb-3">
            <h2 className="font-extrabold">알림</h2>
            <p className="text-gray-8 text-xs">받을 것만 켜 둡니다</p>
          </div>
          <Setting
            label="학생이 질문을 남겼을 때"
            detail="즉시"
            enabled
          />
          <Setting
            label="오답이 3일 넘게 방치될 때"
            detail="하루 한 번 모아서"
            enabled
          />
          <Setting
            label="학생이 시험을 제출했을 때"
            detail="즉시"
          />
        </section>
        <section className="border-gray-3 rounded-xl border bg-white p-5">
          <div className="mb-3 flex items-center">
            <h2 className="font-extrabold">이번 주 사용 시간</h2>
            <span className="text-gray-8 ml-auto text-xs">목표 주당 30분</span>
          </div>
          <b className="text-2xl">0분</b>
          <div className="bg-gray-2 mt-3 h-2 overflow-hidden rounded-full">
            <i className="bg-orange-7 block h-full w-0" />
          </div>
          <p className="text-gray-8 mt-3 text-xs">
            스터디룸 안에서 손볼 것을 카드 단위로 닫는 구조라 시간을 아낄 수
            있습니다.
          </p>
        </section>
      </div>
    </PageLayout>
  </div>
);

const Setting = ({
  label,
  detail,
  enabled = false,
}: {
  label: string;
  detail: string;
  enabled?: boolean;
}) => (
  <div className="border-gray-2 flex items-center border-t py-3 first:border-t-0">
    <div>
      <b className="block text-sm">{label}</b>
      <small className="text-gray-8">{detail}</small>
    </div>
    <Link
      href={PRIVATE.SETTINGS}
      className={`ml-auto rounded-md border px-2 py-1 text-xs font-bold ${enabled ? 'border-orange-4 text-orange-11' : ''}`}
      aria-label={`${label} 알림 설정 열기`}
    >
      {enabled ? '켜짐' : '꺼짐'}
    </Link>
  </div>
);
