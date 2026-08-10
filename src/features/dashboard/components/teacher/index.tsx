'use client';

import { useState } from 'react';

import Link from 'next/link';

import { TeacherDashboardHeader } from '@/features/dashboard/components/header/teacher-header';
import { useUpdateStudyRoomTitle } from '@/features/study-rooms/components/sidebar/services/query';
import { useTeacherStudyRoomDetailQuery } from '@/features/study-rooms/hooks';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { PRIVATE } from '@/shared/constants';

import { useChangeStudyRoomStatus } from '../../hooks/use-change-study-room-status';
import { useTeacherDashboardStudyRoomListQuery } from '../../hooks/use-teacher-dashboard-query';
import { LearningInboxCard } from './learning-inbox-card';

/**
 * 승인 디자인 v22 `roomCard` 3324 `스터디룸 이름 수정`.
 * 이름 변경 API 는 스터디룸 전체를 다시 보내는 PUT 이라, 열릴 때 상세를 먼저 읽고 이름만 바꿔 보낸다.
 */
const RoomRenameDialog = ({
  studyRoomId,
  currentName,
  onClose,
}: {
  studyRoomId: number;
  currentName: string;
  onClose: () => void;
}) => {
  const [name, setName] = useState(currentName);
  const detailQuery = useTeacherStudyRoomDetailQuery(studyRoomId, {
    enabled: true,
  });
  const rename = useUpdateStudyRoomTitle();
  const detail = detailQuery.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        className="w-full max-w-sm rounded-xl bg-white p-5"
        data-testid="study-room-rename-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = name.trim();
          if (!trimmed || !detail) return;
          rename.mutate(
            { studyRoomId, name: trimmed, others: detail },
            { onSuccess: onClose }
          );
        }}
      >
        <h3 className="text-sm font-extrabold">스터디룸 이름 수정</h3>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          autoFocus
          aria-label="스터디룸 이름"
          className="mt-3 w-full rounded-lg border border-[#e3e5e8] px-3 py-2 text-sm"
        />
        {!detail && (
          <p className="mt-2 text-[11px] text-[#747980]">
            수업 정보를 불러오는 중입니다.
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            onClick={onClose}
            className="rounded-md border px-3 py-2 text-xs font-bold"
          >
            취소
          </UnstyledButton>
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="submit"
            disabled={!detail || rename.isPending || name.trim().length === 0}
            className="rounded-md bg-[#222] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            저장
          </UnstyledButton>
        </div>
      </form>
    </div>
  );
};

const DashboardTeacher = ({
  initialMemberName,
}: {
  initialMemberName: string;
}) => {
  const { data: studyRooms = [], isPending } =
    useTeacherDashboardStudyRoomListQuery();
  const rooms = [...studyRooms].sort((a, b) => b.todoCount - a.todoCount);
  const activeRooms = rooms.filter(
    (room) => room.enrollmentStatus !== 'CLOSED'
  );
  const closedRooms = rooms.filter(
    (room, index, all) =>
      room.enrollmentStatus === 'CLOSED' &&
      all.findIndex((candidate) => candidate.id === room.id) === index
  );
  const [openMenuRoomId, setOpenMenuRoomId] = useState<number | null>(null);
  const [showClosedRooms, setShowClosedRooms] = useState(false);
  // 승인 디자인 v22 `roomCard` 3324 `스터디룸 이름 수정`
  const [renamingRoomId, setRenamingRoomId] = useState<number | null>(null);
  const statusMutation = useChangeStudyRoomStatus();

  const changeRoomStatus = (
    studyRoomId: number,
    status: 'OPERATING' | 'CLOSED'
  ) => {
    statusMutation.mutate(
      { studyRoomId, status },
      { onSuccess: () => setOpenMenuRoomId(null) }
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f7f9]">
      <TeacherDashboardHeader initialMemberName={initialMemberName} />
      <main className="mx-auto w-full max-w-[1120px] px-6 py-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-extrabold">학생별 수업</h2>
          <span className="text-xs text-[#747980]">
            카드에서 손볼 것과 도착지를 바로 확인합니다
          </span>
          {rooms.length > 0 && (
            <Link
              href="/study-rooms/new"
              className="ml-auto rounded-md bg-[#222] px-3 py-2 text-xs font-bold text-white"
            >
              수업 만들기
            </Link>
          )}
        </div>
        {isPending ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm">
            수업을 불러오는 중입니다.
          </div>
        ) : rooms.length === 0 ? (
          <section
            className="rounded-xl border border-[#e3e5e8] bg-white p-12 text-center"
            data-testid="teacher-rooms-empty"
          >
            <h2 className="text-lg font-extrabold">
              아직 스터디룸이 하나도 없어요
            </h2>
            <p className="mt-2 text-sm text-[#747980]">
              학생 한 명당 스터디룸 하나가 기본입니다. 먼저 만들어 두고 학생을
              부를 수도 있습니다.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/study-rooms/new"
                className="rounded-md bg-[#222] px-4 py-2 text-sm font-bold text-white"
              >
                첫 스터디룸 만들기
              </Link>
              <Link
                href="/dashboard/teacher/my"
                className="rounded-md border px-4 py-2 text-sm font-bold"
              >
                학생 초대 코드 보기
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div
              className="grid gap-3 md:grid-cols-2"
              data-testid="teacher-rooms-list"
            >
              {activeRooms.map((room) => (
                <article
                  key={`${room.id}-${room.studentName ?? 'empty'}`}
                  className="relative rounded-xl border border-[#e3e5e8] bg-white p-5 hover:border-[#f26a2e]"
                >
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/study-rooms/${room.id}/note`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff0e7] font-extrabold text-[#a4481e]">
                        {(room.studentName ?? room.name).slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-extrabold">
                          {room.studentName ?? room.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#747980]">
                          {room.name} · 활성 수업
                        </p>
                      </div>
                      <b className="text-sm">손볼 것 {room.todoCount}건</b>
                      <span className="text-[#a4481e]">›</span>
                    </Link>
                    <UnstyledButton
                      variant="unstyled"
                      size="none"
                      type="button"
                      aria-label={`${room.studentName ?? room.name} 스터디룸 더 보기`}
                      aria-expanded={openMenuRoomId === room.id}
                      onClick={() =>
                        setOpenMenuRoomId((current) =>
                          current === room.id ? null : room.id
                        )
                      }
                      className="rounded px-2 py-1 text-sm font-bold text-[#60646b] hover:bg-[#f6f7f9]"
                    >
                      ···
                    </UnstyledButton>
                  </div>
                  {openMenuRoomId === room.id && (
                    <div className="absolute top-12 right-4 z-10 rounded-lg border bg-white p-1 shadow-lg">
                      {/* 승인 디자인 v22 `roomCard` 3323~3325: 메뉴 4개 */}
                      <UnstyledButton
                        variant="unstyled"
                        size="none"
                        type="button"
                        onClick={() => {
                          setRenamingRoomId(room.id);
                          setOpenMenuRoomId(null);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs font-bold hover:bg-[#f6f7f9]"
                      >
                        스터디룸 이름 수정
                      </UnstyledButton>
                      <Link
                        href={PRIVATE.ROOM.MEMBERS(room.id)}
                        onClick={() => setOpenMenuRoomId(null)}
                        className="block w-full rounded px-3 py-2 text-left text-xs font-bold hover:bg-[#f6f7f9]"
                      >
                        학생 초대
                      </Link>
                      <Link
                        href={PRIVATE.NOTE.CREATE(room.id)}
                        onClick={() => setOpenMenuRoomId(null)}
                        className="block w-full rounded px-3 py-2 text-left text-xs font-bold hover:bg-[#f6f7f9]"
                      >
                        기록 일지 쓰기
                      </Link>
                      <UnstyledButton
                        variant="unstyled"
                        size="none"
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() => changeRoomStatus(room.id, 'CLOSED')}
                        className="block w-full rounded px-3 py-2 text-left text-xs font-bold text-[#b43b30] hover:bg-[#fff3f1] disabled:opacity-50"
                      >
                        이 수업 종료하기
                      </UnstyledButton>
                    </div>
                  )}
                  {renamingRoomId === room.id && (
                    <RoomRenameDialog
                      studyRoomId={room.id}
                      currentName={room.name}
                      onClose={() => setRenamingRoomId(null)}
                    />
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-[#fafafa] px-3 py-2 text-[11px] text-[#60646b]">
                    <span>
                      피드백 달 것 <b>{room.todoBreakdown.commentNeeded}</b>
                    </span>
                    <span>
                      할 일 승인 <b>{room.todoBreakdown.todoApproval}</b>
                    </span>
                    <span>
                      못했어요 사유 <b>{room.todoBreakdown.notDoneReason}</b>
                    </span>
                    <span>
                      미확인 제출 <b>{room.todoBreakdown.unreadSubmission}</b>
                    </span>
                  </div>
                </article>
              ))}
            </div>
            {closedRooms.length > 0 && (
              <section
                className="mt-4 rounded-xl border border-[#e3e5e8] bg-white p-4 text-sm text-[#60646b]"
                data-testid="teacher-closed-rooms"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    종료된 스터디룸 <b>{closedRooms.length}개</b>를 접어
                    두었습니다. 방학에 쉬는 학생은 여기서 <b>재개하기</b>로 다시
                    시작합니다.
                  </span>
                  <UnstyledButton
                    variant="unstyled"
                    size="none"
                    type="button"
                    onClick={() => setShowClosedRooms((visible) => !visible)}
                    className="ml-auto rounded-md border px-3 py-2 text-xs font-bold text-[#222]"
                  >
                    {showClosedRooms ? '종료된 것 접기' : '종료된 것 보기'}
                  </UnstyledButton>
                </div>
                {showClosedRooms && (
                  <ul className="mt-3 space-y-2 border-t pt-3">
                    {closedRooms.map((room) => (
                      <li
                        key={room.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-[#fafafa] px-3 py-2"
                      >
                        <span className="font-bold">
                          {room.studentName ?? room.name}
                          <small className="ml-2 font-normal text-[#747980]">
                            {room.name}
                          </small>
                        </span>
                        <UnstyledButton
                          variant="unstyled"
                          size="none"
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => changeRoomStatus(room.id, 'OPERATING')}
                          className="rounded-md border px-3 py-2 text-xs font-bold text-[#222] disabled:opacity-50"
                        >
                          재개하기
                        </UnstyledButton>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            {statusMutation.isError && (
              <p
                role="alert"
                className="mt-3 text-sm font-bold text-[#b43b30]"
              >
                수업 상태를 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}
          </>
        )}
        {rooms.length > 0 && (
          <div
            className="mt-4"
            data-testid="teacher-learning-inbox-after-rooms"
          >
            <LearningInboxCard />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardTeacher;
