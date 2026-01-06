'use client';

import ComingSoonSection from '@/features/profile/components/coming-soon-section';
import SectionContainer from '@/features/profile/components/section-container';

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

export default function ParentSections({ isOwner = false }: Props) {
  return (
    <>
      <SectionContainer
        isOwner={isOwner}
        title="김에듀의 활동 리포트"
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        isOwner={isOwner}
        title="학생이 참여한 스터디룸"
      >
        <ComingSoonSection />
      </SectionContainer>
    </>
  );
}
