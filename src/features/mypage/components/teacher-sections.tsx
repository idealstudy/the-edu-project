import ComingSoonSection from '@/shared/components/profile/coming-soon-section';
import SectionContainer from '@/shared/components/profile/section-container';
import SelectStudynotesDialog from '@/shared/components/profile/teacher/select-studynotes-dialog';

export default function TeacherSections() {
  return (
    <>
      <SectionContainer title="활동 요약">
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer title="후기">
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer title="경력">
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="대표 수업노트"
        action={<SelectStudynotesDialog />}
      >
        <ComingSoonSection />
        {/* <StudynotesSection profile={profile} /> */}
      </SectionContainer>

      <SectionContainer title="운영중인 스터디룸">
        <ComingSoonSection />
        {/* <StudyroomSection profile={profile} /> */}
      </SectionContainer>
    </>
  );
}
