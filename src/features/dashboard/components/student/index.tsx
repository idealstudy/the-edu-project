import { useEffect, useMemo, useState } from 'react';

import { UnitNoteEntryCard } from '@/features/unit-note/components/unit-note-entry-card';
import { useMemberStore } from '@/store';

import { useReceivedConnectionList } from '../../connect/hooks/use-connection';
import { useOnboardingStatus } from '../../hooks/use-onboarding-status';
import { useStudentDashboardStudyRoomListQuery } from '../../hooks/use-student-dashboard-query';
import StudentDashboardHeader from '../header/student-header';
import { AgendaFlowCard } from './agenda-flow-card';
import { ConfirmParentRequestDialog } from './confirm-dialog';
import { ExamHallCard } from './exam-hall-card';
import StudentOnboarding from './student-onboarding';
import { TodayProblemsSection } from './today-problems-section';

const DashboardStudent = ({
  initialMemberName,
}: {
  initialMemberName: string;
}) => {
  const memberEmail = useMemberStore((s) => s.member?.email);
  const [isParentRequestDialogOpen, setIsParentRequestDialogOpen] =
    useState(false);
  const { data: studyRooms = [] } = useStudentDashboardStudyRoomListQuery();
  const { hasRooms, hasNotes, hasQuestions } = useOnboardingStatus({
    rooms: studyRooms,
  });
  const studentCompletionStatus = [hasRooms, hasNotes, hasQuestions] as const;
  const studentStepsCompleted = studentCompletionStatus.every(Boolean);
  const query = {
    page: 0,
    size: 10,
    sort: 'regDate,DESC',
  };

  const { data: receivedData } = useReceivedConnectionList(query);
  const receivedParentRequest = useMemo(
    () =>
      receivedData?.connectionList.find(
        (connection) =>
          connection.state === 'PENDING' &&
          connection.recipientEmail === memberEmail
      ) ?? null,
    [memberEmail, receivedData?.connectionList]
  );

  useEffect(() => {
    if (!receivedParentRequest) return;

    setIsParentRequestDialogOpen(true);
  }, [receivedParentRequest]);

  return (
    <div className="flex w-full flex-col">
      <StudentDashboardHeader initialMemberName={initialMemberName} />
      <main className="relative mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-5 md:px-8">
        {!studentStepsCompleted && (
          <StudentOnboarding completionStatus={studentCompletionStatus} />
        )}
        <div className="mb-1 flex items-baseline gap-2">
          <h2 className="text-gray-12 text-sm font-extrabold">지금 내 상태</h2>
          <p className="text-gray-7 text-xs">어디에 있고 무엇을 정리해 뒀나</p>
        </div>
        <ExamHallCard />
        <UnitNoteEntryCard />
        <div className="mt-3 flex items-baseline gap-2">
          <h2 className="text-gray-12 text-sm font-extrabold">오늘 할 것</h2>
          <p className="text-gray-7 text-xs">오늘 안에 닫는 일</p>
        </div>
        <TodayProblemsSection />
        <AgendaFlowCard />
      </main>
      <ConfirmParentRequestDialog
        connection={receivedParentRequest}
        open={isParentRequestDialogOpen}
        onOpenChange={setIsParentRequestDialogOpen}
      />
    </div>
  );
};

export default DashboardStudent;
