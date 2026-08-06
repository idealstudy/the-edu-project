'use client';

import React, { useState } from 'react';

import { Role, type UserBasicInfo } from '@/entities/member';
import { useMemberInfo } from '@/features/member/hooks/use-queries';
import EditProfileCard from '@/features/mypage/common/components/edit-profile-card';
import { useStudentBasicInfo } from '@/features/mypage/common/hooks/student/use-basic-info';
import { useTeacherBasicInfo } from '@/features/mypage/common/hooks/teacher/use-basic-info';
import { useTeacherReport } from '@/features/mypage/common/hooks/teacher/use-report';
import { useProfileImage } from '@/features/profile-image/hooks/use-profile-image';
import ProfileCard from '@/features/profile/components/profile-card/profile-card';
import { Pen } from 'lucide-react';

import { useParentBasicInfo } from '../hooks/parent/use-basic-info';

export default function EditableProfileCard({ role }: { role: Role }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: member } = useMemberInfo();
  const memberId = member?.id;
  const teacherBasicInfoQuery = useTeacherBasicInfo({
    enabled: role === 'ROLE_TEACHER',
  });
  const studentBasicInfoQuery = useStudentBasicInfo({
    enabled: role === 'ROLE_STUDENT',
  });
  const parentBasicInfoQuery = useParentBasicInfo({
    enabled: role === 'ROLE_PARENT',
  });
  const profileImageQuery = useProfileImage({
    enabled: role === 'ROLE_ADMIN',
  });

  const teacherReportQuery = useTeacherReport({
    enabled: role === 'ROLE_TEACHER',
  });

  let basicInfo: UserBasicInfo | undefined;
  let isBasicInfoLoading = false;
  switch (role) {
    case 'ROLE_TEACHER':
      basicInfo = teacherBasicInfoQuery.data;
      isBasicInfoLoading = teacherBasicInfoQuery.isLoading;
      break;
    case 'ROLE_STUDENT':
      basicInfo = studentBasicInfoQuery.data;
      isBasicInfoLoading = studentBasicInfoQuery.isLoading;
      break;
    case 'ROLE_PARENT':
      basicInfo = parentBasicInfoQuery.data;
      isBasicInfoLoading = parentBasicInfoQuery.isLoading;
      break;
    case 'ROLE_ADMIN':
      isBasicInfoLoading = profileImageQuery.isLoading;
      if (member) {
        basicInfo = {
          role: 'ROLE_ADMIN',
          name: member.name ?? member.email,
          email: member.email,
          isProfilePublic: false,
          profilePublicKorean: '비공개',
          profileImageUrl: profileImageQuery.data?.imageUrl ?? '',
        };
      }
      break;
  }

  if (
    isBasicInfoLoading ||
    (role === 'ROLE_TEACHER' && teacherReportQuery.isLoading)
  ) {
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
      teacherReport={teacherReportQuery.data}
      memberId={memberId}
      action={
        <button
          onClick={() => setIsEditMode(true)}
          className="cursor-pointer"
          aria-label="기본정보 수정하기"
        >
          <Pen />
        </button>
      }
    />
  );
}
