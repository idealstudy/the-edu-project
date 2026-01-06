'use client';

import SectionContainer from '@/features/profile/components/section-container';
import SelectStudyNotesDialog from '@/features/profile/components/teacher/select-studynotes-dialog';
import StudynotesSection from '@/features/profile/components/teacher/studynotes-section';
import StudyroomSection from '@/features/profile/components/teacher/studyroom-section';
import { ProfileAccessProps } from '@/features/profile/types';

export default function TeacherSections({
  profile,
  isOwner,
}: ProfileAccessProps) {
  return (
    <>
      <SectionContainer
        title="활동 요약"
        action={isOwner}
      >
        <></>
      </SectionContainer>

      <SectionContainer
        title="후기"
        action={isOwner}
      >
        <></>
      </SectionContainer>

      <SectionContainer
        title="경력"
        action={isOwner}
      >
        <></>
      </SectionContainer>

      <SectionContainer
        title="대표 수업노트"
        action={<SelectStudyNotesDialog />}
        isOwner={isOwner}
      >
        <StudynotesSection profile={profile} />
      </SectionContainer>

      <SectionContainer
        title="운영중인 스터디룸"
        isOwner={isOwner}
      >
        <StudyroomSection profile={profile} />
      </SectionContainer>
    </>
  );
}
