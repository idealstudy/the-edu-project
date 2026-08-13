'use client';

import EditableProfileCard from '@/features/mypage/common/components/editable-profile-card';
import ProfileMain from '@/features/mypage/profile/components/profile-main';
import { StudentMyPage } from '@/features/mypage/student/components/student-my-page';
import { PageLayout } from '@/layout';
import { useMemberStore } from '@/store';

export const MypageDefaultView = () => {
  const role = useMemberStore((state) => state.member?.role);

  if (!role) {
    return (
      <PageLayout>
        <div className="bg-surface-skeleton-alt rounded-card h-60 animate-pulse" />
      </PageLayout>
    );
  }

  if (role === 'ROLE_STUDENT') return <StudentMyPage />;

  return <MypageProfileView />;
};

export const MypageProfileView = () => {
  const role = useMemberStore((state) => state.member?.role);

  if (!role) {
    return (
      <PageLayout>
        <div className="bg-surface-skeleton-alt rounded-card h-60 animate-pulse" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      width="content"
      className="gap-section-gap desktop:grid-cols-2 grid grid-cols-1 items-start"
      data-testid="mypage-profile-view"
    >
      <div className="border-line-line1 rounded-card p-card-pad border bg-white">
        <EditableProfileCard role={role} />
      </div>
      <div className="gap-block-gap grid min-w-0">
        <ProfileMain />
      </div>
    </PageLayout>
  );
};
