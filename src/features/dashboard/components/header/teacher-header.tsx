'use client';

import { useTeacherDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-teacher-dashboard-query';
import { useMemberStore } from '@/store';

type Props = {
  initialMemberName?: string;
  subtitle?: string;
};

export const TeacherDashboardHeader = ({
  initialMemberName,
  subtitle,
}: Props) => {
  const storedMemberName = useMemberStore((state) => state.member?.name);
  const roomsQuery = useTeacherDashboardStudyRoomListQuery();
  const rooms = roomsQuery.data ?? [];
  const memberName = initialMemberName?.trim() || storedMemberName || '선생님';
  const studentCount = rooms.filter((room) => room.studentName).length;
  const todoCount = rooms.reduce((sum, room) => sum + room.todoCount, 0);

  return (
    <header className="border-gray-3 -0 sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3">
      <span className="bg-orange-7 flex size-9 items-center justify-center rounded-full text-sm font-extrabold text-white">
        {memberName.slice(0, 1)}
      </span>
      <div>
        <b className="text-coach block font-extrabold">{memberName} 선생님</b>
        <small className="text-gray-8 text-ui-compact block font-semibold">
          {subtitle ?? `스터디룸 ${rooms.length}개 · 학생 ${studentCount}명`}
        </small>
      </div>
      <div className="ml-auto flex gap-5 text-right">
        <div>
          <small className="text-gray-8 text-ui-compact block font-bold">
            손볼 것 · 누르면 정렬
          </small>
          <b className="block text-sm font-extrabold tabular-nums">
            {roomsQuery.isPending ? '-' : `${todoCount}건`}
          </b>
        </div>
        <div className="hidden sm:block">
          <small className="text-gray-8 text-ui-compact block font-bold">
            이번 주 사용
          </small>
          <b className="block text-sm font-extrabold tabular-nums">
            0분{' '}
            <em className="text-gray-8 text-ui-choice font-bold not-italic">
              / 30분
            </em>
          </b>
        </div>
      </div>
    </header>
  );
};

export default TeacherDashboardHeader;
