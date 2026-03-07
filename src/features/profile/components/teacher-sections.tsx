import { useProfileReport } from '@/features/mypage/hooks/teacher/use-profile-report';
import { useProfileReviews } from '@/features/mypage/hooks/teacher/use-profile-reviews';
import { useProfileTeachingNotes } from '@/features/mypage/hooks/teacher/use-profile-teaching-notes';
import SectionContainer from '@/features/profile/components/section-container';
import ActivitySummarySection from '@/features/profile/components/teacher/activity-summary-section';
import CareerSection from '@/features/profile/components/teacher/career-section';
import DescriptionSection from '@/features/profile/components/teacher/description-section';
import ReviewSection from '@/features/profile/components/teacher/review-section';
import StudyroomSection from '@/features/profile/components/teacher/studyroom-section';
import StudynotesSection from '@/features/profile/components/teacher/teachingnotes-section';
import { useProfileCareers } from '@/features/profile/hooks/use-profile-careers';
import { useProfileDescription } from '@/features/profile/hooks/use-profile-description';
import { useProfileStudyRooms } from '@/features/profile/hooks/use-profile-study-rooms';

export default function TeacherSections({ teacherId }: { teacherId: number }) {
  const { data: description } = useProfileDescription(teacherId);
  const { data: careers } = useProfileCareers(teacherId);
  const { data: report } = useProfileReport(teacherId);
  const { data: reviews } = useProfileReviews(teacherId);
  const { data: teachingNotes } = useProfileTeachingNotes(teacherId);
  const { data: studyRooms } = useProfileStudyRooms(teacherId);

  return (
    <>
      <SectionContainer title="선생님의 특징">
        {description?.description && (
          <DescriptionSection description={description} />
        )}
      </SectionContainer>

      <SectionContainer title="활동 요약">
        {report && <ActivitySummarySection summary={report} />}
      </SectionContainer>

      <SectionContainer title="후기">
        {reviews && <ReviewSection reviews={reviews} />}
      </SectionContainer>

      <SectionContainer title="경력">
        {careers && <CareerSection careers={careers} />}
      </SectionContainer>

      <SectionContainer title="대표 수업노트">
        {teachingNotes && <StudynotesSection teachingnotes={teachingNotes} />}
      </SectionContainer>

      <SectionContainer title="운영중인 스터디룸">
        {studyRooms && <StudyroomSection studyrooms={studyRooms} />}
      </SectionContainer>
    </>
  );
}
