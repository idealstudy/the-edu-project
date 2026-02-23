import { useTeacherReport } from '@/features/mypage/hooks/teacher/use-report';
import { useTeacherStudyRooms } from '@/features/mypage/hooks/teacher/use-study-rooms';
import ComingSoonSection from '@/features/profile/components/coming-soon-section';
import SectionContainer from '@/features/profile/components/section-container';
import ActivitySummarySection from '@/features/profile/components/teacher/activity-summary-section';
import SelectStudynotesDialog from '@/features/profile/components/teacher/select-studynotes-dialog';
import StudyroomSection from '@/features/profile/components/teacher/studyroom-section';

export default function TeacherSections() {
  const {
    data: report,
    isLoading: isReportLoading,
    isError: isReportError,
  } = useTeacherReport();

  const {
    data: studyRooms,
    isLoading: isStudyRoomsLoading,
    isError: isStudyRoomsError,
  } = useTeacherStudyRooms();

  return (
    <>
      <SectionContainer
        title="활동 요약"
        isLoading={isReportLoading}
        isError={isReportError}
      >
        {report && <ActivitySummarySection summary={report} />}
      </SectionContainer>

      <SectionContainer title="후기">
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer title="경력">
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="대표 수업노트"
        isOwner
        action={<SelectStudynotesDialog />}
      >
        <ComingSoonSection />
        {/* <StudynotesSection profile={profile} /> */}
      </SectionContainer>

      <SectionContainer
        title="운영중인 스터디룸"
        isLoading={isStudyRoomsLoading}
        isError={isStudyRoomsError}
      >
        {studyRooms && studyRooms?.length ? (
          <StudyroomSection studyrooms={studyRooms} />
        ) : (
          <div className="my-4">
            <p className="text-text-sub2 text-center">
              운영중인 스터디룸이 없습니다.
            </p>
          </div>
        )}
      </SectionContainer>
    </>
  );
}
