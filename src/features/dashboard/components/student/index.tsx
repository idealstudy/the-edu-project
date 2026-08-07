import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { UnitNoteEntryCard } from '@/features/unit-note/components/unit-note-entry-card';
import { useAssignedExamsQuery } from '@/features/exam/hooks/use-exam-query';
import { PRIVATE } from '@/shared/constants/route';
import { useMemberStore } from '@/store';

import { useReceivedConnectionList } from '../../connect/hooks/use-connection';
import StudentDashboardHeader from '../header/student-header';
import { AgendaFlowCard } from './agenda-flow-card';
import { ConfirmParentRequestDialog } from './confirm-dialog';
import { ExamHallCard } from './exam-hall-card';
import { TodayProblemsSection } from './today-problems-section';

const DashboardStudent = ({
  initialMemberName,
}: {
  initialMemberName: string;
}) => {
  const memberEmail = useMemberStore((s) => s.member?.email);
  const [isParentRequestDialogOpen, setIsParentRequestDialogOpen] =
    useState(false);
  const assignedExams = useAssignedExamsQuery();
  const inProgressExam = assignedExams.data?.find(
    (exam) => exam.status === 'IN_PROGRESS'
  );
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
      <main className="relative flex w-full flex-col px-4 py-4 md:px-4">
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
        {inProgressExam && (
          <section className="border-gray-3 bg-gray-white rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[180px] flex-1">
                <h2 className="text-gray-12 text-base font-extrabold">
                  이어 풀기
                </h2>
                <p className="text-gray-7 mt-1 text-xs">
                  {inProgressExam.title} · 풀던 시험으로 돌아갑니다
                </p>
              </div>
              <Link
                href={PRIVATE.DASHBOARD.EXAM_ATTEMPT(
                  inProgressExam.attemptId
                )}
                className="bg-orange-9 border-orange-10 inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-xs font-extrabold text-white"
              >
                이어 풀기
              </Link>
            </div>
          </section>
        )}
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
