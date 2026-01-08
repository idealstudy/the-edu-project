'use client';

import { useState } from 'react';

import Image from 'next/image';

import ParentProfileExtra from '@/features/profile/components/parent/parent-profile-extra';
import { ProfileCardDropdown } from '@/features/profile/components/profile-card-dropdown';
import StudentProfileExtra from '@/features/profile/components/student/student-profile-extra';
import TeacherProfileExtra from '@/features/profile/components/teacher/teacher-profile-extra';
import {
  isParentProfile,
  isStudentProfile,
  isTeacherProfile,
} from '@/features/profile/lib/type-guards';
import { ProfileAccessProps } from '@/features/profile/types';

export default function ProfileCard({ profile, isOwner }: ProfileAccessProps) {
  const [, setIsEditMode] = useState(false);

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between">
          <h3 className="font-headline1-heading">{profile.name}</h3>
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
    </div>
  );
}
