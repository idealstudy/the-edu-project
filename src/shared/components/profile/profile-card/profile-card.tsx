'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import { FrontendBasicInfo } from '@/entities/teacher/types';
import EditProfileCard from '@/features/mypage/components/edit-profile-card';
import TeacherProfileExtra from '@/shared/components/profile/profile-card/teacher-profile-extra';

export default function ProfileCard({
  basicInfo,
  action,
}: {
  basicInfo: FrontendBasicInfo;
  action?: React.ReactNode;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  let profileExtra;

  if (basicInfo.role === 'ROLE_TEACHER')
    profileExtra = (
      <TeacherProfileExtra
        teacherNoteCount={0}
        studentCount={0}
        reviewCount={0}
        description={basicInfo.simpleIntroduction || ''}
      />
    );

  if (isEditMode)
    return (
      <EditProfileCard
        basicInfo={basicInfo}
        setIsEditMode={setIsEditMode}
      />
    );

  return (
    <>
      <div>
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-headline1-heading">{basicInfo.name}</h3>
          <span className="text-text-sub2 bg-background-gray font-label-normal mr-auto content-center rounded-sm px-2">
            {basicInfo.profilePublicKorean}
          </span>

          {action && action}
        </div>
        <p>{basicInfo.email}</p>
      </div>

      <Image
        src={'/character/img_signup_type01.png'}
        width={280}
        height={280}
        alt={`${basicInfo.name}님의 프로필 이미지`}
        className="aspect-square self-center rounded-full border border-gray-400 object-cover"
      />

      {profileExtra}
    </>
  );
}
