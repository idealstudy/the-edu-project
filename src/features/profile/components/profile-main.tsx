'use client';

import { ProfileRole } from '@/entities/profile';
import ProfileLayout from '@/features/profile/components/profile-layout';
import { useProfile } from '@/features/profile/hooks/use-profile';

export default function ProfileMain({ userId }: { userId: string }) {
  // TODO API 변경
  const { data: profileData, isLoading } = useProfile(userId);

  if (isLoading) {
    return <div className="text-center">로딩중...</div>;
  }

  if (!profileData) {
    return <div className="text-center">프로필 정보를 불러올 수 없습니다.</div>;
  }

  // role 추론: profileData 필드로 역할 판단
  // TODO 변경 가능
  let role: ProfileRole;
  if ('teacherNoteCount' in profileData) {
    role = 'ROLE_TEACHER';
  } else if ('learningGoal' in profileData) {
    role = 'ROLE_STUDENT';
  } else {
    role = 'ROLE_PARENT';
  }

  return (
    <ProfileLayout
      profile={{
        ...profileData,
        id: String(userId),
        role,
      }}
      isOwner={false}
    />
  );
}
