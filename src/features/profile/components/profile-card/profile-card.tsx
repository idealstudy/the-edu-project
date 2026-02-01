'use client';

import { useState } from 'react';

import Image from 'next/image';

import EditProfileCard from '@/features/profile/components/profile-card/edit-profile-card';
import ParentProfileExtra from '@/features/profile/components/profile-card/parent-profile-extra';
import { ProfileCardDropdown } from '@/features/profile/components/profile-card/profile-card-dropdown';
import StudentProfileExtra from '@/features/profile/components/profile-card/student-profile-extra';
import TeacherProfileExtra from '@/features/profile/components/profile-card/teacher-profile-extra';
import {
  isParentProfile,
  isStudentProfile,
  isTeacherProfile,
} from '@/features/profile/lib/type-guards';
import { ProfileAccessProps } from '@/features/profile/types';

export default function ProfileCard({ profile, isOwner }: ProfileAccessProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  let profileExtra;

  if (isTeacherProfile(profile))
    profileExtra = (
      <TeacherProfileExtra
        teacherNoteCount={profile.teacherNoteCount}
        studentCount={profile.studentCount}
        reviewCount={profile.reviewCount}
        description={profile.description}
      />
    );
  else if (isStudentProfile(profile)) {
    profileExtra = <StudentProfileExtra learningGoal={profile.learningGoal} />;
  } else if (isParentProfile(profile)) {
    profileExtra = <ParentProfileExtra />;
  }

  if (isEditMode)
    return (
      <EditProfileCard
        profile={profile}
        setIsEditMode={setIsEditMode}
      />
    );

  return (
    <>
      <div>
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-headline1-heading">{profile.name}</h3>
          {/* TODO 공개 범위 연결 */}
          <span className="text-text-sub2 bg-background-gray font-label-normal mr-auto content-center rounded-sm px-2">
            전체 공개
          </span>

          <ProfileCardDropdown
            isOwner={isOwner}
            profile={profile}
            setIsEditMode={setIsEditMode}
          />
        </div>
        <p>{profile.email}</p>
      </div>

      <Image
        src={'/character/img_signup_type01.png'}
        width={280}
        height={280}
        alt={`${profile.name}님의 프로필 이미지`}
        className="aspect-square self-center rounded-full border border-gray-400 object-cover"
      />

      {profileExtra}
    </>
  );
}
