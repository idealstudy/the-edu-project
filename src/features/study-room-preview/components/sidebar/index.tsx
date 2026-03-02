'use client';

import { StudyStats } from '@/features/study-rooms/components/sidebar/status';
import { SidebarButton } from '@/shared/components/sidebar';

import { usePreviewSideInfo } from '../../hooks/use-preview';
import { StudyroomPreviewSidebarHeader } from './header';
import { TeacherOtherStudyrooms } from './teacher-other-studyrooms';

type StudyroomPreviewContentsProps = {
  teacherId: number;
  studyRoomId: number;
};

const onClick = () => {
  alert('준비중 입니다.');
};

export const StudyroomPreviewSidebar = ({
  teacherId,
  studyRoomId,
}: StudyroomPreviewContentsProps) => {
  const { data, isPending, isError } = usePreviewSideInfo(
    teacherId,
    studyRoomId
  );

  const otherRooms =
    data?.otherStudyRooms
      .filter((room) => room.id !== studyRoomId)
      .map((room) => ({ id: room.id, name: room.name })) ?? [];

  if (isPending) {
    return <div className="text-gray-7 px-2 py-3 text-sm">불러오는 중...</div>;
  }

  if (isError) {
    return (
      <div className="text-gray-7 px-2 py-3 text-sm">
        데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-7 px-2 py-3 text-sm">
        표시할 정보가 없습니다.
      </div>
    );
  }

  return (
    <>
      <StudyroomPreviewSidebarHeader
        studyRoomName={data.name}
        teacherName={data.teacherName}
      />
      <StudyStats
        numberOfTeachingNote={data.numberOfTeachingNotes}
        numberOfStudents={data.numberOfStudents}
        numberOfQuestion={data.numberOfQuestions}
      />
      <SidebarButton
        onClick={onClick}
        btnName="수업 문의하기"
      />
      {data.otherStudyRooms.length ? (
        <TeacherOtherStudyrooms
          studyRoomName={data.name}
          teacherId={teacherId}
          rooms={otherRooms}
        />
      ) : null}
    </>
  );
};
