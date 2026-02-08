'use client';

import React, { useState } from 'react';

import { ProfileWithMeta } from '@/entities/profile';
import EditProfileCard from '@/features/mypage/components/edit-profile-card';
import { ProfileCardDropdown } from '@/features/mypage/components/profile-card-dropdown';
import ProfileCard from '@/shared/components/profile/profile-card/profile-card';

export default function EditableProfileCard({
  profile,
}: {
  profile: ProfileWithMeta;
}) {
  const [isEditMode, setIsEditMode] = useState(false);

  if (isEditMode)
    return (
      <EditProfileCard
        profile={profile}
        setIsEditMode={setIsEditMode}
      />
    );

  return (
    <ProfileCard
      profile={profile}
      action={
        <ProfileCardDropdown
          profile={profile}
          setIsEditMode={setIsEditMode}
        />
      }
    />
  );
}
