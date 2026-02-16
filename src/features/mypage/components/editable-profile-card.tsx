'use client';

import React, { useState } from 'react';

import { Role } from '@/entities/member';
import { useMemberInfo } from '@/features/member/hooks/use-queries';
import EditProfileCard from '@/features/mypage/components/edit-profile-card';
import { ProfileCardDropdown } from '@/features/mypage/components/profile-card-dropdown';
import { useTeacherBasicInfo } from '@/features/mypage/hooks/teacher/use-basic-info';
import ProfileCard from '@/features/profile/components/profile-card/profile-card';

export default function EditableProfileCard({ role }: { role: Role }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: member } = useMemberInfo();
  const memberId = member?.id.toString();
  const { data: teacherBasicInfo, isLoading } = useTeacherBasicInfo();

  // TODO 학생 훅 연결
  const basicInfo =
    role === 'ROLE_TEACHER' ? teacherBasicInfo : teacherBasicInfo;

  if (isLoading) {
    return <div className="text-center">로딩중...</div>;
  }

  if (!basicInfo || !memberId) {
    return <div className="text-center">프로필 정보를 불러올 수 없습니다.</div>;
  }

  if (isEditMode)
    return (
      <EditProfileCard
        basicInfo={basicInfo}
        setIsEditMode={setIsEditMode}
      />
    );

  return (
    <ProfileCard
      basicInfo={basicInfo}
      action={
        <ProfileCardDropdown
          profileId={memberId}
          setIsEditMode={setIsEditMode}
        />
      }
    />
  );
}
