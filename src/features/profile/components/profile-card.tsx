'use client';

import { useState } from 'react';

import Image from 'next/image';

import { ProfileCardDropdown } from '@/features/profile/components/profile-card-dropdown';
import TeacherProfileExtra from '@/features/profile/components/teacher/teacher-profile-extra';

type Props =
  | {
      userId: string;
      isOwner?: false;
    }
  | {
      userId?: never;
      isOwner: true;
    };

export default function ProfileCard({ userId, isOwner = false }: Props) {
  const [, setIsEditMode] = useState(false);

  const currentUser = {
    id: '1',
    role: 'TEACHER',
  };

  const profile = {
    id: isOwner ? currentUser.id : userId,
    role: 'TEACHER',
    name: '김에듀',
    intro: '안녕하세요',
    profileImg: undefined,
    email: 'kim1234@dedu.com',
  };

  let profileExtra;

  switch (profile.role) {
    case 'TEACHER':
      profileExtra = <TeacherProfileExtra />;
      break;
    case 'STUDENT':
    case 'PARENT':
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
