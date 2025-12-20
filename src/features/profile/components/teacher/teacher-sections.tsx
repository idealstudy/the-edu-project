'use client';

import SectionContainer from '@/features/profile/components/section-container';
import StudynotesSection from '@/features/profile/components/teacher/studynotes-section';
import StudyroomSection from '@/features/profile/components/teacher/studyroom-section';

export type Profile = {
  id: string;
  role: string;
  name: string;
  intro: string;
};

type Props = {
  profile: Profile;
  isOwner?: boolean;
};

export default function TeacherSections({ profile, isOwner = false }: Props) {
  return (
    <>
      <SectionContainer
        title="스터디노트"
        action={isOwner}
      >
        <StudynotesSection profile={profile} />
      </SectionContainer>

      <SectionContainer
        title="스터디룸"
        action={isOwner}
      >
        <StudyroomSection profile={profile} />
      </SectionContainer>
    </>
  );
}
