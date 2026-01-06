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

export default function StudentSections({ isOwner = false }: Props) {
  return (
    <>
      <SectionContainer
        title="누적 활동 리포트"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="내 과제"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="내 질문"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="최근 등록된 수업노트"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer
        title="참여한 스터디룸"
        isOwner={isOwner}
      >
        <ComingSoonSection />
      </SectionContainer>
    </>
  );
}
