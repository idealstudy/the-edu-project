'use client';

import ComingSoonSection from '@/features/profile/components/coming-soon-section';
import SectionContainer from '@/features/profile/components/section-container';
import { ProfileAccessProps } from '@/features/profile/types';

export default function ParentSections({
  isOwner = false,
}: ProfileAccessProps) {
  return (
    <>
      <SectionContainer
        isOwner={isOwner}
        title="학생의 활동 리포트"
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
