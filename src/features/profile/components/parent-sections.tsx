import { ProfileWithMeta } from '@/entities/profile';
import ComingSoonSection from '@/shared/components/profile/coming-soon-section';
import SectionContainer from '@/shared/components/profile/section-container';

export default function ParentSections({}: { profile: ProfileWithMeta }) {
  return (
    <>
      <SectionContainer title="학생의 활동 리포트">
        <ComingSoonSection />
      </SectionContainer>

      <SectionContainer title="학생이 참여한 스터디룸">
        <ComingSoonSection />
      </SectionContainer>
    </>
  );
}
