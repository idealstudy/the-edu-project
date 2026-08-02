import { useTeacherOnboardingQuery } from '@/features/dashboard/hooks/use-onboarding-query';

import { useTeacherDashboardStudyRoomListQuery } from '../../hooks/use-teacher-dashboard-query';
import TeacherDashboardHeader from '../header/teacher-header';
import TeacherQnASection from '../section/teacher-qna-section';
import TeacherStudyroomSection from '../section/teacher-studyroom-section';
import TeacherTabSection from '../section/teacher-tab-section';
import { AiCommentCard } from './ai-comment-card';
import { ExamHallTeacherCard } from './exam-hall-teacher-card';
import { LearningInboxCard } from './learning-inbox-card';
import TeacherOnboarding from './teacher-onboarding';

const DashboardTeacher = ({
  initialMemberName,
}: {
  initialMemberName: string;
}) => {
  const { data: teacherOnboarding, isPending } = useTeacherOnboardingQuery();
  const { data: studyRooms = [], isPending: studyRoomsPending } =
    useTeacherDashboardStudyRoomListQuery();

  const shouldShowOnboarding =
    !isPending && teacherOnboarding?.isCompleted === false;

  return (
    <div className="flex w-full flex-col">
      <TeacherDashboardHeader initialMemberName={initialMemberName} />
      <main className="tablet:gap-12 desktop:gap-20 bg-gray-white tablet:py-12 desktop:pb-25 tablet:px-20 relative flex w-full flex-col gap-8 px-4.5 py-8">
        {shouldShowOnboarding && <TeacherOnboarding />}
        {/* MVP-G v4 — 이번 주 AI 코멘트 (신규, ⛔ 백엔드 계약 필요) */}
        <AiCommentCard />
        <LearningInboxCard />
        {/* MVP-G v4 — PDF 시험 생성·반 단위 배정 실 API */}
        <ExamHallTeacherCard />
        <div className="tablet:gap-25 flex w-full flex-col gap-8">
          <TeacherQnASection />
          <TeacherStudyroomSection
            studyRooms={studyRooms}
            isPending={studyRoomsPending}
          />
          <TeacherTabSection studyRooms={studyRooms} />
        </div>
      </main>
    </div>
  );
};

export default DashboardTeacher;
