'use client';

import Link from 'next/link';

import { TeacherDashboardHeader } from '@/features/dashboard/components/header/teacher-header';

import { useTeacherDashboardStudyRoomListQuery } from '../../hooks/use-teacher-dashboard-query';

const DashboardTeacher = ({
  initialMemberName,
}: {
  initialMemberName: string;
}) => {
  const { data: studyRooms = [], isPending } =
    useTeacherDashboardStudyRoomListQuery();
  const rooms = [...studyRooms].sort((a, b) => b.todoCount - a.todoCount);

  return (
    <div className="min-h-screen w-full bg-[#f6f7f9]">
      <TeacherDashboardHeader initialMemberName={initialMemberName} />
      <main className="mx-auto w-full max-w-[1120px] px-6 py-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-extrabold">학생별 수업</h2>
          <span className="text-xs text-[#747980]">
            카드에서 손볼 것과 도착지를 바로 확인합니다
          </span>
          <Link
            href="/study-rooms/new"
            className="ml-auto rounded-md bg-[#222] px-3 py-2 text-xs font-bold text-white"
          >
            수업 만들기
          </Link>
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
            <h2 className="text-lg font-extrabold">아직 수업이 없어요</h2>
            <p className="mt-2 text-sm text-[#747980]">
              학생을 초대하거나 새 수업을 만들어 시작하세요.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Link
                href="/study-rooms/new"
                className="rounded-md bg-[#222] px-4 py-2 text-sm font-bold text-white"
              >
                학생 초대
              </Link>
              <Link
                href="/study-rooms/new"
                className="rounded-md border px-4 py-2 text-sm font-bold"
              >
                수업 만들기
              </Link>
            </div>
          </section>
        ) : (
          <div
            className="grid gap-3 md:grid-cols-2"
            data-testid="teacher-rooms-list"
          >
            {rooms.map((room) => (
              <Link
                key={`${room.id}-${room.studentName ?? 'empty'}`}
                href={`/study-rooms/${room.id}/note`}
                className="group rounded-xl border border-[#e3e5e8] bg-white p-5 hover:border-[#f26a2e]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-[#fff0e7] font-extrabold text-[#a4481e]">
                    {(room.studentName ?? room.name).slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-extrabold">
                      {room.studentName ?? room.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#747980]">
                      {room.name} ·{' '}
                      {room.state === 'TERMINATED'
                        ? '종료된 수업'
                        : '활성 수업'}
                    </p>
                  </div>
                  <b className="text-sm">손볼 것 {room.todoCount}건</b>
                  <span className="text-[#a4481e]">›</span>
                </div>
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardTeacher;
