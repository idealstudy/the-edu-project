'use client';

import ComingSoonSection from '@/features/profile/components/coming-soon-section';
import SectionContainer from '@/features/profile/components/section-container';
// import SelectStudyNotesDialog from '@/features/profile/components/teacher/select-studynotes-dialog';
// import StudynotesSection from '@/features/profile/components/teacher/studynotes-section';
// import StudyroomSection from '@/features/profile/components/teacher/studyroom-section';
import { ProfileAccessProps } from '@/features/profile/types';

export default function TeacherSections({
  // profile,
  isOwner,
}: ProfileAccessProps) {
  return (
    <>
      <SectionContainer
        title="활동 요약"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="후기"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="경력"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="대표 수업노트"
        // action={<SelectStudyNotesDialog />}
        isOwner={isOwner}
      >
        <ComingSoonSection />
        {/* <StudynotesSection profile={profile} /> */}
      </SectionContainer>

      <SectionContainer
        title="운영중인 스터디룸"
        isOwner={isOwner}
      >
        <ComingSoonSection />
        {/* <StudyroomSection profile={profile} /> */}
      </SectionContainer>
    </>
  );
}
