'use client';

import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';

import { ProfileWithMeta } from '@/entities/profile';
import { useTeacherUpdateProfile } from '@/features/profile/hooks/use-profile';
import {
  isStudentProfile,
  isTeacherProfile,
} from '@/features/profile/lib/type-guards';
import {
  ProfileFormSchema,
  ProfileUpdateForm,
} from '@/features/profile/schema/schema';
import {
  Button,
  Form,
  Input,
  RequiredMark,
  Select,
} from '@/shared/components/ui';
import { useRole } from '@/shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditProfileCardProps {
  profile: ProfileWithMeta;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
}

export default function EditProfileCard({
  profile,
  setIsEditMode,
}: EditProfileCardProps) {
  const { role } = useRole();
  const isTeacher = role === 'ROLE_TEACHER';

  const teacherUpdateProfileMutation = useTeacherUpdateProfile();

  const updateProfileMutation = isTeacher
    ? teacherUpdateProfileMutation
    : // TODO 학생으로 변경
      teacherUpdateProfileMutation;

  const {
    register,
    handleSubmit,
    // setError,
    reset,
    formState: { errors /* isSubmitting */ },
  } = useForm<ProfileUpdateForm>({
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

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
    >
      <div>
        <h3 className="font-headline1-heading">{profile.name}</h3>
        <p>{profile.email}</p>
      </div>

      <Image
        src={'/character/img_signup_type01.png'}
        width={280}
        height={280}
        alt={`${profile.name}님의 프로필 이미지`}
        className="aspect-square self-center rounded-full border border-gray-400 object-cover"
      />

      {/* TODO 공개 범위 연결 */}
      <Form.Item>
        <Form.Label>
          공개 범위
          <RequiredMark />
        </Form.Label>

        <Select defaultValue="PUBLIC">
          <Select.Trigger className="w-[240px]" />

          <Select.Content>
            <Select.Option value="PUBLIC">전체 공개</Select.Option>
            <Select.Option value="PRIVATE">비공개</Select.Option>
          </Select.Content>
        </Select>
      </Form.Item>

      <Form.Item error={!!errors.desc}>
        <Form.Label>
          간단 소개
          <RequiredMark />
        </Form.Label>

        <Form.Control>
          <Input
            {...register('desc')}
            placeholder="간단 소개를 입력해 주세요."
          />
        </Form.Control>
        {errors.desc?.message && (
          <Form.ErrorMessage>{errors.desc.message}</Form.ErrorMessage>
        )}
      </Form.Item>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={() => {
            reset();
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
    </Form>
  );
}
