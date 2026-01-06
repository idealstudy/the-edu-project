'use client';

import { useState } from 'react';

import Image from 'next/image';

import ParentProfileExtra from '@/features/profile/components/parent/parent-profile-extra';
import { ProfileCardDropdown } from '@/features/profile/components/profile-card-dropdown';
import StudentProfileExtra from '@/features/profile/components/student/student-profile-extra';
import TeacherProfileExtra from '@/features/profile/components/teacher/teacher-profile-extra';
import { ProfileAccessProps } from '@/features/profile/types';

export default function ProfileCard({ profile, isOwner }: ProfileAccessProps) {
  const [, setIsEditMode] = useState(false);

  let profileExtra;

  switch (profile.role) {
    case 'ROLE_TEACHER':
      profileExtra = <TeacherProfileExtra />;
      break;
    case 'ROLE_STUDENT':
      profileExtra = <StudentProfileExtra />;
      break;
    case 'ROLE_PARENT':
      profileExtra = <ParentProfileExtra />;
      break;
    default:
      profileExtra = <div>잘못된 접근입니다.</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between">
          <h3 className="font-headline1-heading">{profile.name}</h3>
          <ProfileCardDropdown
            isOwner={isOwner}
            user={profile}
            setIsEditMode={setIsEditMode}
          />
        </div>
        <p>{profile.email}</p>
      </div>
      <Image
        src={profile.profileImg ?? '/character/img_signup_type01.png'}
        width={280}
        height={280}
        alt={`${profile.name}님의 프로필 이미지`}
        className="aspect-square self-center rounded-full border border-gray-400 object-cover"
      />
      {profileExtra}
    </div>
  );
}
