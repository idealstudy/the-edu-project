import CommunityPageWrapper from '@/features/community/components/community-page-wrapper';
import BackLink from '@/features/dashboard/studynote/components/back-link';

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommunityPageWrapper>
      <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 md:px-8 lg:px-20">
        <BackLink />
        {children}
      </div>
    </CommunityPageWrapper>
  );
}
