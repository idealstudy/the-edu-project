'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Image from 'next/image';

import ParentProfileExtra from '@/features/profile/components/parent/parent-profile-extra';
import { ProfileCardDropdown } from '@/features/profile/components/profile-card-dropdown';
import StudentProfileExtra from '@/features/profile/components/student/student-profile-extra';
import TeacherProfileExtra from '@/features/profile/components/teacher/teacher-profile-extra';
import { useTeacherUpdateProfile } from '@/features/profile/hooks/use-profile';
import {
  isParentProfile,
  isStudentProfile,
  isTeacherProfile,
} from '@/features/profile/lib/type-guards';
import {
  ProfileFormSchema,
  ProfileUpdateForm,
} from '@/features/profile/schema/schema';
import { ProfileAccessProps } from '@/features/profile/types';
import { Button, Form } from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ProfileCard({ profile, isOwner }: ProfileAccessProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const teacherUpdateProfileMutation = useTeacherUpdateProfile();

  const updateProfileMutation = isTeacherProfile(profile)
    ? teacherUpdateProfileMutation
    : // TODO 학생으로 변경
      teacherUpdateProfileMutation;

  const methods = useForm<ProfileUpdateForm>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      desc: isTeacherProfile(profile)
        ? profile.description
        : isStudentProfile(profile)
          ? profile.learningGoal
          : '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ProfileUpdateForm) => {
    await updateProfileMutation.mutateAsync(data);

    setIsEditMode(false);
  };

  let profileExtra;

  if (isTeacherProfile(profile))
    profileExtra = (
      <TeacherProfileExtra
        teacherNoteCount={profile.teacherNoteCount}
        studentCount={profile.studentCount}
        reviewCount={profile.reviewCount}
        description={profile.description}
        isEditMode={isEditMode}
      />
    );
  else if (isStudentProfile(profile)) {
    profileExtra = <StudentProfileExtra learningGoal={profile.learningGoal} />;
  } else if (isParentProfile(profile)) {
    profileExtra = <ParentProfileExtra />;
  }

  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div>
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-headline1-heading">{profile.name}</h3>
            {/* TODO 공개 범위 연결 */}
            <span className="text-text-sub2 bg-background-gray font-label-normal mr-auto content-center rounded-sm px-2">
              전체 공개
            </span>

            {!isEditMode && (
              <ProfileCardDropdown
                isOwner={isOwner}
                profile={profile}
                setIsEditMode={setIsEditMode}
              />
            )}
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

        {isEditMode && (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => {
                methods.reset();
                setIsEditMode(false);
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="small"
              disabled={updateProfileMutation.isPending}
            >
              저장
            </Button>
          </div>
        )}
      </Form>
    </FormProvider>
  );
}
